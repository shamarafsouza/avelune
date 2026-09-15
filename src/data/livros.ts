export type Livro = {
  id: string;
  titulo: string;
  autora: string;
  genero: string;
  sinopse?: string | null;
  capa_url?: string | null;
  amazon_url?: string | null;
  tropes?: string[] | null;
  vibes?: string[] | null;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export async function buscarLivros(): Promise<Livro[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram configuradas."
    );
  }

  const resposta = await fetch(
    `${SUPABASE_URL}/rest/v1/livros?select=id,titulo,autora,genero,sinopse,capa_url,amazon_url,tropes,vibes&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
    }
  );

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw new Error(`Erro ao consultar o acervo: ${resposta.status} ${detalhe}`);
  }

  const dados = (await resposta.json()) as unknown;

  if (!Array.isArray(dados)) {
    throw new Error("A resposta do acervo não está no formato esperado.");
  }

  return dados as Livro[];
}
