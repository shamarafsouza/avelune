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
        .select(
          "id, tipo, autor_id, publicacao_id, comentario_id, lida, created_at"
        )
        .eq("usuario_id", usuarioId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!ativo || error) return;

      if (!data?.length) {
        setNotificacoes([]);
        return;
      }

      const idsAutores = [
        ...new Set(data.map((item) => item.autor_id)),
      ];

      const { data: autores } = await supabase
        .from("profiles")
        .select("id, nome, username, avatar_url")
        .in("id", idsAutores);

      if (!ativo) return;

      const mapaAutores = new Map(
        (autores ?? []).map((autor) => [autor.id, autor])
      );

      setNotificacoes(
        data.map((item) => ({
          ...item,
          autor: mapaAutores.get(item.autor_id),
        })) as Notificacao[]
      );
    }

    async function adicionarNotificacao(
      notificacao: Notificacao
    ) {
      const { data: autor } = await supabase
        .from("profiles")
        .select("id, nome, username, avatar_url")
        .eq("id", notificacao.autor_id)
        .maybeSingle();

      if (!ativo) return;

      setNotificacoes((atuais) => {
        const nova = {
          ...notificacao,
          autor: autor ?? undefined,
        };

        const existe = atuais.some(
          (item) => item.id === nova.id
        );

        if (existe) return atuais;

        return [nova, ...atuais].slice(0, 30);
      });
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
        .channel(`notificacoes-${usuarioId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notificacoes",
            filter: `usuario_id=eq.${usuarioId}`,
          },
          (payload) => {
            void adicionarNotificacao(
              payload.new as Notificacao
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notificacoes",
            filter: `usuario_id=eq.${usuarioId}`,
          },
          (payload) => {
            const atualizada = payload.new as Notificacao;

            setNotificacoes((atuais) =>
              atuais.map((item) =>
                item.id === atualizada.id
                  ? {
                      ...item,
                      ...atualizada,
                    }
                  : item
              )
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "notificacoes",
            filter: `usuario_id=eq.${usuarioId}`,
          },
          (payload) => {
            const excluida = payload.old as Notificacao;

            setNotificacoes((atuais) =>
              atuais.filter(
                (item) => item.id !== excluida.id
              )
            );
          }
        )
        .subscribe();
    }

    supabase.auth.getSession().then(({ data }) => {
      iniciar(data.session?.user.id ?? null);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        (_evento, sessao) => {
          iniciar(sessao?.user.id ?? null);
        }
      );

    return () => {
      ativo = false;

      listener.subscription.unsubscribe();

      if (canal) {
        void supabase.removeChannel(canal);
      }
    };
  }, []);

  // Apenas marca como lida.
  // NÃO remove a notificação.
  const marcarComoLida = useCallback(
    async (id: number) => {
      setNotificacoes((atuais) =>
        atuais.map((item) =>
          item.id === id
            ? { ...item, lida: true }
            : item
        )
      );

      await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", id);
    },
    []
  );

  // Marca todas como lidas.
  // Também NÃO remove nenhuma.
  const marcarTodasComoLidas = useCallback(
    async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) return;

      setNotificacoes((atuais) =>
        atuais.map((item) => ({
          ...item,
          lida: true,
        }))
      );

      await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("usuario_id", data.user.id)
        .eq("lida", false);
    },
    []
  );

  // AQUI é que a notificação realmente desaparece.
  const excluirNotificacao = useCallback(
    async (id: number) => {
      const { error } = await supabase
        .from("notificacoes")
        .delete()
        .eq("id", id);

      if (!error) {
        setNotificacoes((atuais) =>
          atuais.filter((item) => item.id !== id)
        );
      }
    },
    []
  );

  const naoLidas = notificacoes.filter(
    (item) => !item.lida
  ).length;

  return {
    notificacoes,
    naoLidas,
    marcarComoLida,
    marcarTodasComoLidas,
    excluirNotificacao,
  };
}