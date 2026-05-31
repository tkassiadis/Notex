-- ============================================================
-- CONTROLE DO SEMESTRE — Schema Supabase
-- Arquivo: 001_schema_inicial.sql
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- ------------------------------------------------------------
-- 1. EXTENSÃO UUID
-- Necessária para gerar IDs únicos automaticamente
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 2. TABELA: profiles
-- Estende o auth.users padrão do Supabase
-- Criada automaticamente via trigger no signup
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  nome        text,
  meta_aprovacao numeric(4,2) not null default 7.0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Dados de perfil do usuário, incluindo meta de aprovação configurável';
comment on column public.profiles.meta_aprovacao is 'Meta de aprovação (ex: 6.0, 7.0, 8.0). Usada em todos os cálculos de nota necessária';

-- ------------------------------------------------------------
-- 3. TABELA: atividades
-- Espelha exatamente o objeto Atividade do frontend
-- Todos os campos existentes estão presentes, sem alteração semântica
-- ------------------------------------------------------------
create table if not exists public.atividades (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,

  -- Campos existentes no frontend (nomes preservados em snake_case)
  avaliacao         text not null default 'AP1',
  instrumento       text not null default '',
  disciplina        text not null default '',
  subdivisao        text not null default '',
  status            text not null default 'Não iniciado',
  data              date,
  peso_avaliacao    numeric(6,4) not null default 0,
  peso_instrumento  numeric(6,4) not null default 0,
  pontuacao_maxima  numeric(8,4),
  pontuacao         numeric(8,4),
  observacoes       text not null default '',

  -- Metadados
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.atividades is 'Atividades/instrumentos de avaliação do semestre, por usuário';
comment on column public.atividades.peso_avaliacao is 'Peso da avaliação na média final (0 a 1)';
comment on column public.atividades.peso_instrumento is 'Peso do instrumento dentro da avaliação (0 a 1)';
comment on column public.atividades.pontuacao_maxima is 'Pontuação máxima possível neste instrumento';
comment on column public.atividades.pontuacao is 'Pontuação obtida pelo aluno. NULL = ainda não avaliado';

-- ------------------------------------------------------------
-- 4. ÍNDICES
-- Otimizam as queries mais comuns do sistema
-- ------------------------------------------------------------

-- Busca de todas as atividades de um usuário (query principal)
create index idx_atividades_user_id
  on public.atividades(user_id);

-- Ordenação por data (usada em múltiplas views)
create index idx_atividades_data
  on public.atividades(user_id, data);

-- Filtro por disciplina (usado no DisciplineTab e cálculos)
create index idx_atividades_disciplina
  on public.atividades(user_id, disciplina);

-- Filtro por status (usado em AlertsTab e DashboardTab)
create index idx_atividades_status
  on public.atividades(user_id, status);

-- ------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS)
-- Garante isolamento total: cada usuário vê apenas seus dados
-- ------------------------------------------------------------

alter table public.profiles  enable row level security;
alter table public.atividades enable row level security;

-- Policies: profiles
create policy "Usuário lê apenas seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário atualiza apenas seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Policies: atividades
create policy "Usuário lê apenas suas atividades"
  on public.atividades for select
  using (auth.uid() = user_id);

create policy "Usuário insere apenas suas atividades"
  on public.atividades for insert
  with check (auth.uid() = user_id);

create policy "Usuário atualiza apenas suas atividades"
  on public.atividades for update
  using (auth.uid() = user_id);

create policy "Usuário deleta apenas suas atividades"
  on public.atividades for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 6. TRIGGER: updated_at automático
-- Atualiza o campo updated_at em qualquer UPDATE
-- ------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_atividades_updated_at
  before update on public.atividades
  for each row execute function public.handle_updated_at();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------
-- 7. TRIGGER: criação automática de profile no signup
-- Quando um usuário se registra, cria o perfil automaticamente
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_new_user_profile
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 8. REALTIME
-- Habilita sincronização em tempo real entre dispositivos
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.atividades;
alter publication supabase_realtime add table public.profiles;
