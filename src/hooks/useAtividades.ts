import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Atividade } from "../types";

function rowToAtividade(row: any): Atividade {
  return {
    id: row.id,
    avaliacao: row.avaliacao,
    instrumento: row.instrumento,
    disciplina: row.disciplina,
    subdivisao: row.subdivisao,
    status: row.status,
    data: row.data ?? "",
    pesoAvaliacao: row.peso_avaliacao,
    pesoInstrumento: row.peso_instrumento,
    pontuacaoMaxima: row.pontuacao_maxima,
    pontuacao: row.pontuacao,
    observacoes: row.observacoes,
  };
}

function atividadeToInsert(item: Omit<Atividade, "id">, userId: string): any {
  return {
    user_id: userId,
    avaliacao: item.avaliacao,
    instrumento: item.instrumento,
    disciplina: item.disciplina,
    subdivisao: item.subdivisao,
    status: item.status,
    data: item.data || null,
    peso_avaliacao: item.pesoAvaliacao,
    peso_instrumento: item.pesoInstrumento,
    pontuacao_maxima: item.pontuacaoMaxima,
    pontuacao: item.pontuacao,
    observacoes: item.observacoes,
  };
}

function atividadeToUpdate(item: Atividade): any {
  return {
    avaliacao: item.avaliacao,
    instrumento: item.instrumento,
    disciplina: item.disciplina,
    subdivisao: item.subdivisao,
    status: item.status,
    data: item.data || null,
    peso_avaliacao: item.pesoAvaliacao,
    peso_instrumento: item.pesoInstrumento,
    pontuacao_maxima: item.pontuacaoMaxima,
    pontuacao: item.pontuacao,
    observacoes: item.observacoes,
  };
}

interface UseAtividadesReturn {
  atividades: Atividade[];
  loading: boolean;
  error: string | null;
  addAtividade: (item: Omit<Atividade, "id">) => Promise<void>;
  updateAtividade: (item: Atividade) => Promise<void>;
  deleteAtividade: (id: string) => Promise<void>;
  importAtividades: (items: Omit<Atividade, "id">[]) => Promise<void>;
}

export function useAtividades(user: User | null): UseAtividadesReturn {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAtividades([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("atividades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError("Erro ao carregar: " + error.message);
        else setAtividades((data as any[]).map(rowToAtividade));
        setLoading(false);
      });
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`atividades:${user.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "atividades",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const nova = rowToAtividade(payload.new);
        setAtividades((prev) => prev.find((a) => a.id === nova.id) ? prev : [...prev, nova]);
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "atividades",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const atualizada = rowToAtividade(payload.new);
        setAtividades((prev) => prev.map((a) => a.id === atualizada.id ? atualizada : a));
      })
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "atividades",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setAtividades((prev) => prev.filter((a) => a.id !== (payload.old as any).id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const addAtividade = useCallback(async (item: Omit<Atividade, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("atividades")
      .insert(atividadeToInsert(item, user.id))
      .select()
      .single();
    if (error) { setError("Erro ao salvar: " + error.message); return; }
    const nova = rowToAtividade(data);
    setAtividades((prev) => prev.find((a) => a.id === nova.id) ? prev : [...prev, nova]);
  }, [user]);

  const updateAtividade = useCallback(async (item: Atividade) => {
    if (!user) return;
    const { error } = await supabase
      .from("atividades")
      .update(atividadeToUpdate(item))
      .eq("id", item.id)
      .eq("user_id", user.id);
    if (error) { setError("Erro ao atualizar: " + error.message); return; }
    setAtividades((prev) => prev.map((a) => a.id === item.id ? item : a));
  }, [user]);

  const deleteAtividade = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("atividades")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) { setError("Erro ao excluir: " + error.message); return; }
    setAtividades((prev) => prev.filter((a) => a.id !== id));
  }, [user]);

  const importAtividades = useCallback(async (items: Omit<Atividade, "id">[]) => {
    if (!user) return;
    await supabase.from("atividades").delete().eq("user_id", user.id);
    const inserts = items.map((item) => atividadeToInsert(item, user.id));
    const { data, error } = await supabase.from("atividades").insert(inserts).select();
    if (error) { setError("Erro ao importar: " + error.message); return; }
    setAtividades((data as any[]).map(rowToAtividade));
  }, [user]);

  return { atividades, loading, error, addAtividade, updateAtividade, deleteAtividade, importAtividades };
}
