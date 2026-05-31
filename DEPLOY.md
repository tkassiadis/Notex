# Controle do Semestre — Guia Completo de Deploy e PWA

---

## 1. Pré-requisitos

- Node.js 18+
- Conta no Supabase (https://supabase.com) — gratuita
- Conta na Vercel (https://vercel.com) — gratuita

---

## 2. Configurar o Supabase

### 2.1 Criar o projeto
1. Acesse supabase.com → New Project
2. Nome: controle-semestre | Região: South America (São Paulo)
3. Aguarde ~2 minutos

### 2.2 Executar o schema
1. SQL Editor → New query
2. Cole o conteúdo de supabase/migrations/001_schema_inicial.sql
3. Clique em Run

### 2.3 Configurar autenticação
1. Authentication > Settings
2. Site URL: URL da Vercel (preencher após deploy)

### 2.4 Obter credenciais — Project Settings > API:
- Project URL         → VITE_SUPABASE_URL
- anon / public key   → VITE_SUPABASE_ANON_KEY

---

## 3. Deploy na Vercel

### 3.1 Via interface (recomendado)
1. Push do projeto no GitHub
2. vercel.com → Add New Project → importar repositório
3. Framework: Vite (detectado automaticamente)
4. Environment Variables:
   VITE_SUPABASE_URL      = https://SEU_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY = sua_anon_key_aqui
5. Deploy

### 3.2 Via CLI
  npm install -g vercel
  vercel login
  vercel --prod

---

## 4. Instalar como app — iPhone (iOS)

REQUISITO: app em HTTPS (Vercel garante isso automaticamente).

Passo a passo:
1. Abra o SAFARI no iPhone (obrigatório — Chrome/Firefox no iOS nao suportam PWA)
2. Acesse a URL do app (ex: https://controle-semestre.vercel.app)
3. Aguarde carregar completamente
4. Toque no icone de Compartilhar (quadrado com seta, barra inferior)
5. Role a lista e toque em "Adicionar a Tela de Inicio"
6. Edite o nome se quiser → toque em "Adicionar"
7. O icone aparece na tela de inicio

O app abre:
- Sem barra de endereco do Safari
- Em tela cheia (modo standalone)
- Com splash screen de fundo escuro
- Como qualquer app nativo

Notas iOS:
- Funciona a partir do iOS 11.3+
- Somente Safari permite instalar PWAs no iPhone
- Dados locais sao perdidos se limpar dados do Safari — use Supabase para persistencia real

---

## 5. Instalar como app — Android

Passo a passo (Chrome):
1. Abra o Chrome no Android
2. Acesse a URL do app
3. Chrome exibe banner "Adicionar a tela inicial" automaticamente
4. Toque em Instalar ou Adicionar

Se o banner nao aparecer:
1. Menu (tres pontos) → "Adicionar a tela inicial" ou "Instalar app"
2. Confirme

O app abre:
- Sem barra do Chrome
- Em tela cheia com splash screen
- Com icone na gaveta de apps
- Aparece na lista de apps instalados

Funciona no Chrome, Edge, Samsung Internet, Brave.

---

## 6. Testar offline

No DevTools (Chrome):
1. F12 → Application → Service Workers
2. Confirme: "activated and running"
3. Network → marque "Offline"
4. Recarregue — o app deve abrir do cache

No celular:
1. Abra o app com internet (popula o cache)
2. Ative modo aviao
3. Abra o app — funciona normalmente

O que funciona offline:
  OK  Todas as telas (Dashboard, Disciplinas, Atividades, etc.)
  OK  Dados ja carregados
  OK  Calculos de medias e projecoes
  OK  Navegacao entre tabs
  --  Criar/editar: salvo localmente, sincroniza ao reconectar
  NO  Login/cadastro (requer conexao)
  NO  Importar/exportar Excel via Supabase

---

## 7. Variaveis de ambiente

VITE_SUPABASE_URL      → Supabase > Project Settings > API > Project URL
VITE_SUPABASE_ANON_KEY → Supabase > Project Settings > API > anon/public

A anon key e segura para o frontend — acesso controlado pelo RLS.
NUNCA use a service_role key no codigo do cliente.

---

## 8. Arquivos da Fase 3 — PWA

public/
  manifest.json              Web App Manifest (nome, icones, cores, modo standalone)
  sw.js                      Service Worker (cache, offline, estrategias de fetch)
  favicon.svg                Favicon SVG
  _redirects                 SPA routing (Netlify/Vercel)
  icons/
    icon-72x72.svg
    icon-96x96.svg
    icon-128x128.svg
    icon-144x144.svg
    icon-152x152.svg
    icon-192x192.svg
    icon-384x384.svg
    icon-512x512.svg
    apple-touch-icon.svg     Icone para iPhone/iPad
    maskable-512x512.svg     Icone adaptavel (Android circular)

src/
  main.tsx    Atualizado: registra o service worker
  index.css   Atualizado: safe area iOS, range inputs, PWA styles

vercel.json   Headers de cache, seguranca e SPA routing

---

## 9. Checklist de deploy

[ ] Schema SQL executado no Supabase
[ ] Variaveis de ambiente configuradas na Vercel
[ ] Deploy realizado com sucesso
[ ] Site URL atualizado no Supabase Authentication
[ ] App acessivel via HTTPS
[ ] Service Worker ativo (DevTools > Application > Service Workers)
[ ] Manifest valido (DevTools > Application > Manifest)
[ ] Icone aparece ao instalar no iPhone
[ ] Icone aparece ao instalar no Android
[ ] App abre em modo standalone (sem barra do browser)
[ ] Funciona offline apos primeiro acesso

---

## 10. Backup dos dados

Via app:
1. Botao de exportar no header
2. Baixe controle-semestre.xlsx
3. Guarde em Google Drive, iCloud, etc.

Via Supabase:
1. Settings > Database > Backups
2. Plano Pro: backups automaticos diarios

Frequencia recomendada:
- Semanal: exportar via app
- Mensal: backup do banco via Supabase
