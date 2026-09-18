import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import "./BuscarPessoas.css";

type ResultadoPessoa = {
  id: string;
  nome: string;
  username: string;
  avatar_url?: string | null;
  seguindo: boolean;
};

function BuscarPessoas() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<ResultadoPessoa[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  useEffect(() => {
    const termoLimpo = termo.trim();

    if (termoLimpo.length < 2) {
      setResultados([]);
      return;
    }

    let ativo = true;
    setBuscando(true);

    const timer = window.setTimeout(async () => {
      const { data: usuarioAuth } = await supabase.auth.getUser();
      const meuId = usuarioAuth.user?.id;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, username, avatar_url")
        .or(`nome.ilike.%${termoLimpo}%,username.ilike.%${termoLimpo}%`)
        .limit(10);

      if (!ativo) return;

      if (error) {
        console.error("Erro ao buscar pessoas:", error);
        setResultados([]);
        setBuscando(false);
        return;
      }

      const pessoas = (data ?? []).filter((pessoa) => pessoa.id !== meuId);
      let idsSeguindo: string[] = [];

      if (meuId && pessoas.length > 0) {
        const { data: seguindoRows } = await supabase
          .from("seguidores")
          .select("seguido_id")
          .eq("seguidor_id", meuId)
          .in("seguido_id", pessoas.map((p) => p.id));

        idsSeguindo = (seguindoRows ?? []).map((row) => row.seguido_id);
      }

      if (ativo) {
        setResultados(
          pessoas.map((pessoa) => ({
            ...pessoa,
            seguindo: idsSeguindo.includes(pessoa.id),
          }))
        );
        setBuscando(false);
      }
    }, 350);

    return () => {
      ativo = false;
      window.clearTimeout(timer);
    };
  }, [termo]);

  async function alternarSeguir(pessoa: ResultadoPessoa) {
    const { data: usuarioAuth, error: erroUsuario } = await supabase.auth.getUser();

    if (erroUsuario || !usuarioAuth.user) {
      return;
    }

    const meuId = usuarioAuth.user.id;

    if (pessoa.seguindo) {
      const { error } = await supabase
        .from("seguidores")
        .delete()
        .eq("seguidor_id", meuId)
        .eq("seguido_id", pessoa.id);

      if (!error) {
        setResultados((atual) =>
          atual.map((item) => (item.id === pessoa.id ? { ...item, seguindo: false } : item))
        );
      }
      return;
    }

    const { error } = await supabase
      .from("seguidores")
      .insert({ seguidor_id: meuId, seguido_id: pessoa.id });

    if (!error) {
      setResultados((atual) =>
        atual.map((item) => (item.id === pessoa.id ? { ...item, seguindo: true } : item))
      );
    }
  }

  return (
    <div className="buscar-pessoas" ref={containerRef}>
      <div className="buscar-pessoas-campo">
        <span>⌕</span>
        <input
          type="text"
          value={termo}
          onChange={(evento) => {
            setTermo(evento.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          placeholder="Buscar leitores por nome ou @usuário..."
        />
      </div>

      {aberto && termo.trim().length >= 2 && (
        <div className="buscar-pessoas-painel">
          {buscando ? (
            <p className="buscar-pessoas-vazio">Procurando...</p>
          ) : resultados.length === 0 ? (
            <p className="buscar-pessoas-vazio">Nenhum leitor encontrado.</p>
          ) : (
            resultados.map((pessoa) => (
              <div className="buscar-pessoas-item" key={pessoa.id}>
                <div className="buscar-pessoas-avatar">
                  {pessoa.avatar_url ? <img src={pessoa.avatar_url} alt="" /> : "✦"}
                </div>
                <div className="buscar-pessoas-dados">
                  <strong>{pessoa.nome}</strong>
                  <span>@{pessoa.username}</span>
                </div>
                <button
                  type="button"
                  className={pessoa.seguindo ? "ativo" : ""}
                  onClick={() => alternarSeguir(pessoa)}
                >
                  {pessoa.seguindo ? "SEGUINDO" : "SEGUIR"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default BuscarPessoas;
