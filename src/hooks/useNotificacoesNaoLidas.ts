import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useNotificacoesNaoLidas() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let ativo = true;
    let usuarioAtual: string | null = null;
    let canal: ReturnType<typeof supabase.channel> | null = null;

    async function contar(usuarioId: string) {
      const { count } = await supabase
        .from("notificacoes")
        .select("id", { count: "exact", head: true })
        .eq("usuario_id", usuarioId)
        .eq("lida", false);

      if (ativo) setTotal(count ?? 0);
    }

    function iniciar(usuarioId: string | null) {
      if (usuarioId === usuarioAtual) return;
      usuarioAtual = usuarioId;

      if (canal) {
        void supabase.removeChannel(canal);
        canal = null;
      }

      if (!usuarioId) {
        setTotal(0);
        return;
      }

      void contar(usuarioId);

      canal = supabase
        .channel(`notificacoes-${usuarioId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notificacoes",
            filter: `usuario_id=eq.${usuarioId}`,
          },
          () => void contar(usuarioId)
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

  return total;
}
