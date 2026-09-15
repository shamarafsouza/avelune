import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Livro } from "../types/livro";

type LinhaLivro = {
  titulo: string;
  autor: string;
  genero: string;
  avaliacao: string | null;
  cor: string;
  simbolo: string;
  sinopse: string;
  amazon_url: string | null;
  capa_url: string | null;
  real: boolean;
};

function paraLivro(linha: LinhaLivro): Livro {
  return {
    titulo: linha.titulo,
    autor: linha.autor,
    genero: linha.genero,
    avaliacao: linha.avaliacao ?? "—",
    cor: linha.cor,
    simbolo: linha.simbolo,
    sinopse: linha.sinopse,
    amazonUrl: linha.amazon_url ?? undefined,
    capaUrl: linha.capa_url ?? undefined,
    real: linha.real,
  };
}

/**
 * Busca o catálogo de livros no Supabase.
 *
 * Antes esse mesmo array de 38 livros vivia copiado (e levemente
 * divergente) dentro de Biblioteca.tsx, Explorar.tsx e Resenhas.tsx.
 * Agora a tabela `livros` é a única fonte de verdade; as três páginas
 * usam este hook.
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
          "titulo, autor, genero, avaliacao, cor, simbolo, sinopse, amazon_url, capa_url, real"
        )
        .order("ordem", { ascending: true });

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
