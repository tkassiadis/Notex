// ============================================================
// src/hooks/useDisciplinas.ts
// Gerencia a tabela de disciplinas (CRUD + realtime).
// ============================================================

import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Disciplina, DisciplinaRow, TipoDisciplina } from "../types";

function rowToDisciplina(row: DisciplinaRow): Disciplina {
  return {
    id: row.id,
    nome: row.nome,
    tipo: (row.tipo as TipoDisciplina) || "Teórica",
    observacoes: row.observacoes || "",
    pesoTeorica: Number(row.peso_teorica ?? 100),
    pesoPratica: Number(row.peso_pratica ?? 0),
    subdivisoes: Array.isArray(row.subdivisoes) ? row.subdivisoes : [],
  };
}

function disciplinaToInsert(d: Omit<Disciplina, "id">, userId: string): any {
  return {
    user_id: userId,
    nome: d.nome,
    tipo: d.tipo,
    observacoes: d.observacoes || "",
    peso_teorica: d.pesoTeorica,
    peso_pratica: d.pesoPratica,
    subdivisoes: d.subdivisoes || [],
  };
}

function disciplinaToUpdate(d: Partial<Disciplina>): any {
  const out: any = {};
  if (d.nome !== undefined) out.nome = d.nome;
  if (d.tipo !== undefined) out.tipo = d.tipo;
  if (d.observacoes !== undefined) out.observacoes = d.observacoes;
  if (d.pesoTeorica !== undefined) out.peso_teorica = d.pesoTeorica;
  if (d.pesoPratica !== undefined) out.peso_pratica = d.pesoPratica;
  if (d.subdivisoes !== undefined) out.subdivisoes = d.subdivisoes;
  return out;
}

interface UseDisciplinasReturn {
  disciplinas: Disciplina[];
  loading: boolean;
  error: string | null;
  addDisciplina: (d: Omit<Disciplina, "id">) => Promise<Disciplina | null>;
  updateDisciplina: (id: string, patch: Partial<Disciplina>) => Promise<void>;
  deleteDisciplina: (id: string) => Promise<void>;
}

export function useDisciplinas(user: User | null): UseDisciplinasReturn {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega + realtime
  useEffect(() => {
    if (!user) {
      setDisciplinas([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    supabase
      .from("disciplinas")
      .select("*")
      .eq("user_id", user.id)
      .order("nome", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setDisciplinas((data as DisciplinaRow[]).map(rowToDisciplina));
        }
        setLoading(false);
      });

    const channel = supabase
      .channel("disciplinas-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "disciplinas", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const nova = rowToDisciplina(payload.new as DisciplinaRow);
            setDisciplinas((prev) => (prev.find((d) => d.id === nova.id) ? prev : [...prev, nova]));
          } else if (payload.eventType === "UPDATE") {
            const atualizada = rowToDisciplina(payload.new as DisciplinaRow);
            setDisciplinas((prev) => prev.map((d) => (d.id === atualizada.id ? atualizada : d)));
          } else if (payload.eventType === "DELETE") {
            const oldId = (payload.old as any).id;
            setDisciplinas((prev) => prev.filter((d) => d.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const addDisciplina = useCallback(
    async (d: Omit<Disciplina, "id">): Promise<Disciplina | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("disciplinas")
        .insert(disciplinaToInsert(d, user.id))
        .select()
        .single();
      if (error) {
        setError("Erro ao salvar disciplina: " + error.message);
        throw error;
      }
      const nova = rowToDisciplina(data as DisciplinaRow);
      setDisciplinas((prev) => (prev.find((x) => x.id === nova.id) ? prev : [...prev, nova]));
      return nova;
    },
    [user]
  );

  const updateDisciplina = useCallback(
    async (id: string, patch: Partial<Disciplina>): Promise<void> => {
      if (!user) return;
      const { error } = await supabase
        .from("disciplinas")
        .update(disciplinaToUpdate(patch))
        .eq("id", id);
      if (error) {
        setError("Erro ao atualizar disciplina: " + error.message);
        throw error;
      }
      setDisciplinas((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    },
    [user]
  );

  const deleteDisciplina = useCallback(
    async (id: string): Promise<void> => {
      if (!user) return;
      const { error } = await supabase.from("disciplinas").delete().eq("id", id);
      if (error) {
        setError("Erro ao excluir disciplina: " + error.message);
        throw error;
      }
      setDisciplinas((prev) => prev.filter((d) => d.id !== id));
    },
    [user]
  );

  return { disciplinas, loading, error, addDisciplina, updateDisciplina, deleteDisciplina };
}
