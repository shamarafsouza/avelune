import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Notificacao = {
  id: number;
  tipo: "seguir" | "curtida" | "comentario";
  autor_id: string;
  publicacao_id?: number | null;
  comentario_id?: number | null;
  lida: boolean;
  created_at: string;
  autor?: {
    nome: string | null;
    username: string | null;
    avatar_url: string | null;
  };
};

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  useEffect(() => {
    let ativo = true;
    let usuarioAtual: string | null = null;
    let canal: ReturnType<typeof supabase.channel> | null = null;

    async function carregar(usuarioId: string) {
      const { data, error } = await supabase
        .from("notificacoes")
        .select("id, tipo, autor_id, publicacao_id, comentario_id, lida, created_at")
        .eq("usuario_id", usuarioId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!ativo) return;

      if (error || !data?.length) {
        setNotificacoes([]);
        return;
      }

      const idsAutores = [...new Set(data.map((item) => item.autor_id))];
      const { data: autores } = await supabase
        .from("profiles")
        .select("id, nome, username, avatar_url")
        .in("id", idsAutores);

      if (!ativo) return;

      const mapa = new Map((autores ?? []).map((autor) => [autor.id, autor]));
      setNotificacoes(
        data.map((item) => ({ ...item, autor: mapa.get(item.autor_id) })) as Notificacao[]
      );
    }

    function iniciar(usuarioId: string | null) {
      if (usuarioId === usuarioAtual) return;
      usuarioAtual = usuarioId;

      if (canal) {
        void supabase.removeChannel(canal);
        canal = null;
      }

      if (!usuarioId) {
        setNotificacoes([]);
        return;
      }

      void carregar(usuarioId);

      canal = supabase
        .channel(`notificacoes-${usuarioId}-${Math.random().toString(36).slice(2)}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notificacoes",
            filter: `usuario_id=eq.${usuarioId}`,
          },
          () => void carregar(usuarioId)
        )
        .subscribe();
    }

    supabase.auth.getSession().then(({ data }) => {
      iniciar(data.session?.user.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      iniciar(sessao?.user.id ?? null);
    });

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
      if (canal) void supabase.removeChannel(canal);
    };
  }, []);

  const marcarComoLida = useCallback(async (id: number) => {
    const { error } = await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", id);

    if (!error) {
      setNotificacoes((atuais) =>
        atuais.map((item) => (item.id === id ? { ...item, lida: true } : item))
      );
    }
  }, []);

  const marcarTodasComoLidas = useCallback(async () => {
    const { data: usuarioAuth } = await supabase.auth.getUser();
    if (!usuarioAuth.user) return;

    const { error } = await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("usuario_id", usuarioAuth.user.id)
      .eq("lida", false);

    if (!error) {
      setNotificacoes((atuais) => atuais.map((item) => ({ ...item, lida: true })));
    }
  }, []);

  const naoLidas = notificacoes.filter((item) => !item.lida).length;

  return { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas };
}
