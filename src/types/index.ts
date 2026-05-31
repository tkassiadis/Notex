// ============================================================
// src/types/index.ts
// Tipagem central do projeto.
// Espelha exatamente os campos que já existem no frontend,
// com adição de user_id e timestamps do banco.
// ============================================================

// ------------------------------------------------------------
// Atividade — objeto principal do sistema
// Os nomes de campo aqui são camelCase (frontend).
// A conversão snake_case ↔ camelCase é feita no hook useAtividades.
// ------------------------------------------------------------
export interface Atividade {
  id: string;                    // UUID (substituiu Date.now())
  avaliacao: string;             // "AP1" | "AP2" | "AS" | "AF" | "Trabalho"
  instrumento: string;           // Nome do instrumento de avaliação
  disciplina: string;            // Nome da disciplina
  subdivisao: string;            // Subdivisão (ex: "Pneumo e Cardio")
  status: StatusOption;          // Status de estudo
  data: string;                  // ISO date string "YYYY-MM-DD"
  pesoAvaliacao: number;         // 0 a 1
  pesoInstrumento: number;       // 0 a 1
  pontuacaoMaxima: number | null;
  pontuacao: number | null;
  observacoes: string;
}

// Atividade enriquecida — adiciona campo calculado, não persistido
export interface AtividadeEnriquecida extends Atividade {
  daysRemaining: number | null;
}

// ------------------------------------------------------------
// Opções fixas — preservadas exatamente do original
// ------------------------------------------------------------
export type StatusOption =
  | "Não iniciado"
  | "Estudo inicial"
  | "Estudo médio"
  | "Estudo avançado"
  | "Finalizado";

export type AvaliacaoOption = "AP1" | "AP2" | "AS" | "AF" | "Trabalho";

// ------------------------------------------------------------
// DisciplinaStats — resultado de getDisciplineStats()
// Preservado exatamente do original
// ------------------------------------------------------------
export interface DisciplinaStats {
  disciplina: string;
  items: AtividadeEnriquecida[];
  mediaAtual: number | null;
  pesoConcluido: number;
  pesoRestante: number;
  notaNecessaria: number | null;
  statusCounts: {
    "Não iniciado": number;
    "Em andamento": number;
    "Finalizado": number;
  };
  proximas: AtividadeEnriquecida[];
  aguardandoCorrecao: AtividadeEnriquecida[];
  color: string;
  emRisco: boolean;
}

// ------------------------------------------------------------
// Profile — dados do usuário no Supabase
// ------------------------------------------------------------
export interface Profile {
  id: string;
  email: string;
  nome: string | null;
  metaAprovacao: number;         // default 7.0, configurável
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// Formato da row no banco (snake_case) — usado internamente no hook
// ------------------------------------------------------------
export interface AtividadeRow {
  id: string;
  user_id: string;
  avaliacao: string;
  instrumento: string;
  disciplina: string;
  subdivisao: string;
  status: string;
  data: string | null;
  peso_avaliacao: number;
  peso_instrumento: number;
  pontuacao_maxima: number | null;
  pontuacao: number | null;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  email: string;
  nome: string | null;
  meta_aprovacao: number;
  created_at: string;
  updated_at: string;
}
