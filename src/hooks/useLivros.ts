import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Livro } from "../types/livro";

type LinhaLivro = {
  titulo: string;
  autora: string;
  genero: string;
  avaliacao: string | null;
  cor: string | null;
  simbolo: string | null;
  sinopse: string;
  amazon_url: string | null;
  capa_url: string | null;
  real: boolean;
  tropes: string[] | null;
  vibes: string[] | null;
};

function paraLivro(linha: LinhaLivro): Livro {
  return {
    titulo: linha.titulo,
    autor: linha.autora,
    genero: linha.genero,
    avaliacao: linha.avaliacao ?? "—",
    cor: linha.cor ?? "vinho",
    simbolo: linha.simbolo ?? "✦",
    sinopse: linha.sinopse,
    amazonUrl: linha.amazon_url ?? undefined,
    capaUrl: linha.capa_url ?? undefined,
    real: linha.real,
    tropes: linha.tropes ?? [],
    vibes: linha.vibes ?? [],
  };
}

/**
 * Busca o catálogo de livros no Supabase.
 *
 * A coluna do banco é `autora` (não `autor`) — o mapeamento pra
 * `autor` no tipo Livro acontece aqui, pra não precisar renomear
 * esse campo em todas as páginas que já usam `livro.autor`.
 */
export function useLivros() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro(null);

      const { data, error } = await supabase
        .from("livros")
        .select(
          "titulo, autora, genero, avaliacao, cor, simbolo, sinopse, amazon_url, capa_url, real, tropes, vibes"
        )
        .order("ordem", { ascending: true, nullsFirst: false })
        .order("titulo", { ascending: true });

      if (!ativo) return;

      if (error) {
        console.warn("Não foi possível carregar o catálogo de livros:", error.message);
        setErro("Não foi possível carregar a biblioteca agora.");
        setLivros([]);
      } else {
        setLivros((data ?? []).map(paraLivro));
      }

      setCarregando(false);
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  return { livros, carregando, erro };
}