// ============================================================
// src/types/index.ts
// ============================================================

export interface Atividade {
  id: string;
  avaliacao: string;
  instrumento: string;
  disciplina: string;
  subdivisao: string;
  status: StatusOption;
  data: string;
  pesoAvaliacao: number;
  pesoInstrumento: number;
  pontuacaoMaxima: number | null;
  pontuacao: number | null;
  observacoes: string;
}

export interface AtividadeEnriquecida extends Atividade {
  daysRemaining: number | null;
}

export type StatusOption =
  | "Não iniciado"
  | "Estudo inicial"
  | "Estudo médio"
  | "Estudo avançado"
  | "Finalizado";

export type AvaliacaoOption = "AP1" | "AP2" | "AS" | "AF" | "Trabalho";

export interface DisciplinaStats {
  disciplina: string;
  items: AtividadeEnriquecida[];
  mediaAtual: number | null;
  pesoConcluido: number;
  pesoRestante: number;
  notaNecessaria: number | null;
  notaMaxima: number | null;           // NOVO: nota máxima alcançável
  aprovacaoGarantida: boolean;         // NOVO: meta já garantida matematicamente
  aprovacaoImpossivel: boolean;        // NOVO: impossível atingir a meta
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

export interface Profile {
  id: string;
  email: string;
  nome: string | null;
  metaAprovacao: number;
  createdAt: string;
  updatedAt: string;
}

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
