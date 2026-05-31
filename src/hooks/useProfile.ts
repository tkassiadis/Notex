import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  email: string;
  nome: string | null;
  metaAprovacao: number;
}

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  updateMeta: (meta: number) => Promise<void>;
}

export function useProfile(user: User | null): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          const row = data as any;
          setProfile({
            id: row.id,
            email: row.email,
            nome: row.nome,
            metaAprovacao: row.meta_aprovacao,
          });
        }
        setLoading(false);
      });
  }, [user?.id]);

  const updateMeta = useCallback(async (meta: number) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ meta_aprovacao: meta } as any)
      .eq("id", user.id);
    setProfile((prev) => (prev ? { ...prev, metaAprovacao: meta } : prev));
  }, [user]);

  return { profile, loading, updateMeta };
}
