import { useEffect, useMemo, useState } from "react";
import "./Biblioteca.css";
import AveluneHeader from "../components/AveluneHeader";
import { supabase } from "../lib/supabase";
import type { Livro as LivroBase } from "../types/livro";

type Livro = LivroBase & {
  id: string;
  avaliacao?: string;
  cor: string;
  simbolo: string;
  amazonUrl?: string;
  capaUrl?: string;
  real?: boolean;
};

type LivroBanco = {
  id: string;
  titulo: string;
  autora?: string | null;
  autor?: string | null;
  genero: string;
  sinopse?: string | null;
  avaliacao?: string | number | null;
  cor?: string | null;
  simbolo?: string | null;
  amazon_url?: string | null;
  capa_url?: string | null;
  tropes?: string[] | null;
  vibes?: string[] | null;
};

type FiltroBiblioteca =
  | "todos"
  | "estante"
  | "favoritos";

type BibliotecaProps = {
  onNavigate?: (
    pagina:
      | "inicio"
      | "biblioteca"
      | "comunidade"
      | "perfil"
  ) => void;
};

function Biblioteca({
  onNavigate,
}: BibliotecaProps) {
  const categorias = [
    "Todos",
    "Fantasia",
    "Romance",
    "Mistério",
    "Terror",
    "Ficção",
    "Aventura",
    "Dark Romance",
  ];

  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarLivros() {
      try {
        setCarregando(true);
        setErro("");
        const { data, error: erroSupabase } = await supabase
          .from("livros")
          .select("*")
          .order("created_at", { ascending: false });

        if (erroSupabase) {
          throw erroSupabase;
        }

        const dados = (data ?? []) as LivroBanco[];

        setLivros(
          dados.map((livro) => ({
            id: livro.id,
            titulo: livro.titulo,
            autor: livro.autor ?? livro.autora ?? "Autor desconhecido",
            genero: livro.genero,
            sinopse: livro.sinopse ?? "",
            amazonUrl: livro.amazon_url ?? undefined,
            capaUrl: livro.capa_url ?? undefined,
            real: Boolean(livro.capa_url),
            avaliacao:
              livro.avaliacao !== null &&
                livro.avaliacao !== undefined
                ? String(livro.avaliacao)
                : "",
            cor: livro.cor ?? "vinho",
            simbolo: livro.simbolo ?? "✦",
            tropes: Array.isArray(livro.tropes) ? livro.tropes : [],
            vibes: Array.isArray(livro.vibes) ? livro.vibes : [],
          }))
        );
      } catch (error) {
        console.error(error);
        setErro("Não foi possível carregar a biblioteca.");
      } finally {
        setCarregando(false);
      }
    }

    carregarLivros();
  }, []);

  const [categoriaAtiva, setCategoriaAtiva] =
    useState("Todos");

  const [filtroBiblioteca, setFiltroBiblioteca] =
    useState<FiltroBiblioteca>("todos");

  const [busca, setBusca] = useState("");

  const [livroSelecionado, setLivroSelecionado] =
    useState<Livro | null>(null);

  const [favoritos, setFavoritos] =
    useState<string[]>(() => {
      try {
        const salvos = localStorage.getItem(
          "avelune-favoritos"
        );

        return salvos
          ? JSON.parse(salvos)
          : [];
      } catch {
        return [];
      }
    });

  const [queroLer, setQueroLer] =
    useState<string[]>(() => {
      try {
        const salvos = localStorage.getItem(
          "avelune-quero-ler"
        );

        return salvos
          ? JSON.parse(salvos)
          : [];
      } catch {
        return [];
      }
    });

  useEffect(() => {
    localStorage.setItem(
      "avelune-favoritos",
      JSON.stringify(favoritos)
    );
  }, [favoritos]);

  useEffect(() => {
    localStorage.setItem(
      "avelune-quero-ler",
      JSON.stringify(queroLer)
    );
  }, [queroLer]);

  const livrosFiltrados = useMemo(() => {
  const texto = busca.toLowerCase().trim();

  const categoriaSelecionada = String(categoriaAtiva)
    .toLowerCase()
    .trim();

  return livros.filter((livro) => {
    const genero = String(livro.genero ?? "")
      .toLowerCase()
      .trim();

    const titulo = String(livro.titulo ?? "")
      .toLowerCase()
      .trim();

    const autor = String(livro.autor ?? livro.autora ?? "")
      .toLowerCase()
      .trim();

    const pertenceCategoria =
      categoriaSelecionada === "" ||
      categoriaSelecionada === "todos" ||
      genero === categoriaSelecionada;

    const pertenceFiltro =
      filtroBiblioteca === "todos" ||
      (filtroBiblioteca === "estante" &&
        queroLer.includes(livro.id)) ||
      (filtroBiblioteca === "favoritos" &&
        favoritos.includes(livro.id));

    const correspondeBusca =
      texto === "" ||
      titulo.includes(texto) ||
      autor.includes(texto) ||
      genero.includes(texto);

    return (
      pertenceCategoria &&
      pertenceFiltro &&
      correspondeBusca
    );
  });
}, [
  livros,
  categoriaAtiva,
  filtroBiblioteca,
  busca,
  favoritos,
  queroLer,
]);

  function alternarFavorito(
    id: string
  ) {
    setFavoritos((atuais) => {
      if (atuais.includes(id)) {
        return atuais.filter(
          (item) => item !== id
        );
      }

      return [...atuais, id];
    });
  }

  function alternarQueroLer(
    id: string
  ) {
    setQueroLer((atuais) => {
      if (atuais.includes(id)) {
        return atuais.filter(
          (item) => item !== id
        );
      }

      return [...atuais, id];
    });
  }

  function limparFiltros() {
    setBusca("");
    setCategoriaAtiva("Todos");
    setFiltroBiblioteca("todos");
  }

  function selecionarFiltro(
    filtro: FiltroBiblioteca
  ) {
    setFiltroBiblioteca(filtro);
    setCategoriaAtiva("Todos");
    setBusca("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  let tituloSecao = "Em destaque";
  let eyebrowSecao =
    "ESCOLHAS DA BIBLIOTECA";

  if (filtroBiblioteca === "estante") {
    tituloSecao = "Minha estante";
    eyebrowSecao = "SEUS LIVROS";
  }

  if (filtroBiblioteca === "favoritos") {
    tituloSecao = "Favoritos";
    eyebrowSecao =
      "SUAS HISTÓRIAS FAVORITAS";
  }

  return (
    <main className="biblioteca">
      <div className="biblioteca-particulas" />

      <AveluneHeader
        paginaAtual="biblioteca"
        onNavigate={(pagina) => onNavigate?.(pagina)}
      />

      <section className="biblioteca-conteudo">

        <section
          className="biblioteca-hero"
          aria-label="Apresentação da biblioteca"
        >
          <div className="biblioteca-hero-conteudo">

            <div className="biblioteca-introducao">
              <span className="biblioteca-eyebrow">
                A GRANDE BIBLIOTECA
              </span>

              <h1>
                Encontre sua
                <br />
                próxima história.
              </h1>

              <p>
                Entre em um universo de histórias,
                personagens e mundos esperando
                para serem descobertos.
              </p>
            </div>

            <div className="biblioteca-busca">
              <span>⌕</span>

              <input
                type="text"
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
                placeholder="Buscar livros, autores ou histórias..."
              />

              <button
                type="button"
                onClick={() =>
                  setBusca(busca.trim())
                }
              >
                BUSCAR
              </button>
            </div>

          </div>
        </section>

        <section className="categorias">
          <div className="secao-titulo">
            <span>CATEGORIAS</span>
            <div className="linha" />
          </div>

          <div className="categorias-lista">
            {categorias.map(
              (categoria) => (
                <button
                  key={categoria}
                  type="button"
                  className={
                    categoriaAtiva ===
                      categoria
                      ? "categoria ativo"
                      : "categoria"
                  }
                  onClick={() => {
                    setCategoriaAtiva(
                      categoria
                    );
                    setFiltroBiblioteca(
                      "todos"
                    );
                  }}
                >
                  {categoria}
                </button>
              )
            )}
          </div>
        </section>

        <section className="biblioteca-filtros">
          <button
            type="button"
            className={
              filtroBiblioteca === "todos"
                ? "filtro-biblioteca ativo"
                : "filtro-biblioteca"
            }
            onClick={() =>
              selecionarFiltro("todos")
            }
          >
            TODOS OS LIVROS
          </button>

          <button
            type="button"
            className={
              filtroBiblioteca === "estante"
                ? "filtro-biblioteca ativo"
                : "filtro-biblioteca"
            }
            onClick={() =>
              selecionarFiltro("estante")
            }
          >
            MINHA ESTANTE
            <span>
              {queroLer.length}
            </span>
          </button>

          <button
            type="button"
            className={
              filtroBiblioteca ===
                "favoritos"
                ? "filtro-biblioteca ativo"
                : "filtro-biblioteca"
            }
            onClick={() =>
              selecionarFiltro(
                "favoritos"
              )
            }
          >
            FAVORITOS
            <span>
              {favoritos.length}
            </span>
          </button>
        </section>

        {carregando ? (
          <div className="nenhum-livro">
            <span>✦</span>
            <h3>Consultando o acervo...</h3>
            <p>As histórias da Avelune estão sendo carregadas.</p>
          </div>
        ) : erro ? (
          <div className="nenhum-livro">
            <span>✦</span>
            <h3>A biblioteca não abriu.</h3>
            <p>{erro}</p>
            <button type="button" onClick={() => window.location.reload()}>
              TENTAR NOVAMENTE
            </button>
          </div>
        ) : filtroBiblioteca === "todos" && categoriaAtiva === "Todos" && busca.trim() === "" ? (
          <>
            <section className="destaques biblioteca-secao-livros">
              <div className="secao-cabecalho">
                <div>
                  <span className="secao-eyebrow">ESCOLHAS DA BIBLIOTECA</span>
                  <h2>Em destaque</h2>
                </div>
                <button className="ver-todos" type="button" onClick={limparFiltros}>
                  VER TODOS →
                </button>
              </div>

              {livros.length > 0 ? (
                <div className="livros-grid">
                  {livros.slice(0, 4).map((livro, index) => {
                    const estaFavoritado = favoritos.includes(livro.id);
                    const estaNaLista = queroLer.includes(livro.id);

                    return (
                      <article className="livro-card" key={livro.id} onClick={() => setLivroSelecionado(livro)}>
                        <div className={`livro-capa ${livro.cor}`}>
                          {livro.real && livro.capaUrl && (
                            <img className="capa-imagem-real" src={livro.capaUrl} alt={`Capa de ${livro.titulo}`} loading="lazy" referrerPolicy="no-referrer" />
                          )}
                          {livro.real && <span className="livro-selo-amazon">AMAZON</span>}
                          <div className="capa-moldura">
                            <span className="moldura-canto superior-esquerdo">❖</span>
                            <span className="moldura-canto superior-direito">❖</span>
                            <span className="moldura-canto inferior-esquerdo">❖</span>
                            <span className="moldura-canto inferior-direito">❖</span>
                            <div className="moldura-linha" />
                          </div>
                          {!livro.real && (
                            <>
                              <div className="capa-brilho" />
                              <div className="capa-ornamento">{livro.simbolo}</div>
                              <div className="capa-conteudo">
                                <span>AVELUNE</span>
                                <strong>{livro.titulo}</strong>
                                <small>{livro.autor}</small>
                              </div>
                            </>
                          )}
                          <div className="capa-numero">{String(index + 1).padStart(2, "0")}</div>
                          <div className="capa-acoes">
                            <button type="button" className={estaFavoritado ? "capa-acao ativo" : "capa-acao"} onClick={(event) => { event.stopPropagation(); alternarFavorito(livro.id); }} aria-label="Favoritar livro">
                              {estaFavoritado ? "♥" : "♡"}
                            </button>
                            <button type="button" className={estaNaLista ? "capa-acao ativo" : "capa-acao"} onClick={(event) => { event.stopPropagation(); alternarQueroLer(livro.id); }} aria-label="Adicionar à estante">
                              {estaNaLista ? "✓" : "+"}
                            </button>
                          </div>
                        </div>
                        <div className="livro-informacoes">
                          <div><h3>{livro.titulo}</h3><p>{livro.autor}</p></div>
                        </div>
                        <span className="livro-genero">{livro.genero}</span>
                        {livro.real && livro.amazonUrl && (
                          <a className="livro-amazon" href={livro.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                            COMPRAR NA AMAZON ↗
                          </a>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="nenhum-livro compacto">
                  <span>✦</span>
                  <h3>Nenhuma história encontrada.</h3>
                  <p>O acervo retornou vazio. Verifique a conexão com o Supabase.</p>
                </div>
              )}
            </section>

            {livros.length > 4 && (
              <section className="destaques biblioteca-secao-livros biblioteca-ultimas">
                <div className="secao-cabecalho">
                  <div>
                    <span className="secao-eyebrow">RECÉM-CHEGADOS</span>
                    <h2>Últimas adições</h2>
                  </div>
                  <button className="ver-todos" type="button" onClick={limparFiltros}>VER TODOS →</button>
                </div>
                <div className="livros-grid">
                  {livros.slice(4, 8).map((livro, index) => {
                    const estaFavoritado = favoritos.includes(livro.id);
                    const estaNaLista = queroLer.includes(livro.id);
                    return (
                      <article className="livro-card" key={livro.id} onClick={() => setLivroSelecionado(livro)}>
                        <div className={`livro-capa ${livro.cor}`}>
                          {livro.real && livro.capaUrl && <img className="capa-imagem-real" src={livro.capaUrl} alt={`Capa de ${livro.titulo}`} loading="lazy" referrerPolicy="no-referrer" />}
                          {livro.real && <span className="livro-selo-amazon">AMAZON</span>}
                          <div className="capa-moldura"><span className="moldura-canto superior-esquerdo">❖</span><span className="moldura-canto superior-direito">❖</span><span className="moldura-canto inferior-esquerdo">❖</span><span className="moldura-canto inferior-direito">❖</span><div className="moldura-linha" /></div>
                          {!livro.real && <><div className="capa-brilho" /><div className="capa-ornamento">{livro.simbolo}</div><div className="capa-conteudo"><span>AVELUNE</span><strong>{livro.titulo}</strong><small>{livro.autor}</small></div></>}
                          <div className="capa-numero">{String(index + 5).padStart(2, "0")}</div>
                          <div className="capa-acoes">
                            <button type="button" className={estaFavoritado ? "capa-acao ativo" : "capa-acao"} onClick={(event) => { event.stopPropagation(); alternarFavorito(livro.id); }}>{estaFavoritado ? "♥" : "♡"}</button>
                            <button type="button" className={estaNaLista ? "capa-acao ativo" : "capa-acao"} onClick={(event) => { event.stopPropagation(); alternarQueroLer(livro.id); }}>{estaNaLista ? "✓" : "+"}</button>
                          </div>
                        </div>
                        <div className="livro-informacoes"><div><h3>{livro.titulo}</h3><p>{livro.autor}</p></div></div>
                        <span className="livro-genero">{livro.genero}</span>
                        {livro.real && livro.amazonUrl && <a className="livro-amazon" href={livro.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>COMPRAR NA AMAZON ↗</a>}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="destaques biblioteca-secao-livros">
            <div className="secao-cabecalho">
              <div>
                <span className="secao-eyebrow">{eyebrowSecao}</span>
                <h2>{categoriaAtiva !== "Todos" && filtroBiblioteca === "todos" ? categoriaAtiva : tituloSecao}</h2>
              </div>
              <button className="ver-todos" type="button" onClick={limparFiltros}>VER TODOS →</button>
            </div>
            {livrosFiltrados.length > 0 ? (
              <div className="livros-grid">
                {livrosFiltrados.map((livro, index) => {
                  const estaFavoritado = favoritos.includes(livro.id);
                  const estaNaLista = queroLer.includes(livro.id);
                  return (
                    <article className="livro-card" key={livro.id} onClick={() => setLivroSelecionado(livro)}>
                      <div className={`livro-capa ${livro.cor}`}>
                        {livro.real && livro.capaUrl && <img className="capa-imagem-real" src={livro.capaUrl} alt={`Capa de ${livro.titulo}`} loading="lazy" referrerPolicy="no-referrer" />}
                        {livro.real && <span className="livro-selo-amazon">AMAZON</span>}
                        <div className="capa-moldura"><span className="moldura-canto superior-esquerdo">❖</span><span className="moldura-canto superior-direito">❖</span><span className="moldura-canto inferior-esquerdo">❖</span><span className="moldura-canto inferior-direito">❖</span><div className="moldura-linha" /></div>
                        {!livro.real && <><div className="capa-brilho" /><div className="capa-ornamento">{livro.simbolo}</div><div className="capa-conteudo"><span>AVELUNE</span><strong>{livro.titulo}</strong><small>{livro.autor}</small></div></>}
                        <div className="capa-numero">{String(index + 1).padStart(2, "0")}</div>
                        <div className="capa-acoes"><button type="button" className={estaFavoritado ? "capa-acao ativo" : "capa-acao"} onClick={(event) => { event.stopPropagation(); alternarFavorito(livro.id); }}>{estaFavoritado ? "♥" : "♡"}</button><button type="button" className={estaNaLista ? "capa-acao ativo" : "capa-acao"} onClick={(event) => { event.stopPropagation(); alternarQueroLer(livro.id); }}>{estaNaLista ? "✓" : "+"}</button></div>
                      </div>
                      <div className="livro-informacoes"><div><h3>{livro.titulo}</h3><p>{livro.autor}</p></div></div>
                      <span className="livro-genero">{livro.genero}</span>
                      {livro.real && livro.amazonUrl && <a className="livro-amazon" href={livro.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>COMPRAR NA AMAZON ↗</a>}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="nenhum-livro"><span>{filtroBiblioteca === "favoritos" ? "♥" : "✦"}</span><h3>{filtroBiblioteca === "estante" ? "Sua estante está vazia." : filtroBiblioteca === "favoritos" ? "Você ainda não tem favoritos." : "Nenhuma história encontrada."}</h3><p>{filtroBiblioteca === "estante" ? "Escolha uma história na biblioteca para começar sua coleção." : "Tente buscar por outro título, autor ou categoria."}</p><button type="button" onClick={limparFiltros}>EXPLORAR TODAS AS HISTÓRIAS</button></div>
            )}
          </section>
        )}


        {filtroBiblioteca ===
          "todos" && (
            <section className="biblioteca-estante">
              <div className="secao-cabecalho">
                <div>
                  <span className="secao-eyebrow">
                    SUA COLEÇÃO
                  </span>

                  <h2>
                    Minha estante
                  </h2>
                </div>

                <button
                  type="button"
                  className="ver-todos"
                  onClick={() =>
                    selecionarFiltro(
                      "estante"
                    )
                  }
                >
                  VER ESTANTE →
                </button>
              </div>

              {queroLer.length > 0 ? (
                <div className="estante-lista">
                  {livros
                    .filter((livro) =>
                      queroLer.includes(
                        livro.id
                      )
                    )
                    .map((livro) => (
                      <button
                        key={livro.id}
                        type="button"
                        className="estante-livro"
                        onClick={() =>
                          setLivroSelecionado(
                            livro
                          )
                        }
                      >
                        <span
                          className={`estante-capa ${livro.cor}`}
                        >
                          {livro.simbolo}
                        </span>

                        <span>
                          <strong>
                            {
                              livro.titulo
                            }
                          </strong>

                          <small>
                            {livro.autor}
                          </small>
                        </span>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="estante-vazia">
                  <span>☾</span>

                  <p>
                    Sua estante ainda está
                    vazia.
                    <br />
                    Escolha uma história
                    para começar sua
                    coleção.
                  </p>
                </div>
              )}
            </section>
          )}
      </section>

      <footer className="biblioteca-rodape">
        <span>
          AVELUNE © 2026
        </span>

        <span>
          ONDE CADA HISTÓRIA ENCONTRA
          SEU LEITOR
        </span>

        <span className="biblioteca-afiliado">
          Como associado da Amazon, a Avelune recebe por compras qualificadas.
        </span>

        <span>✦</span>
      </footer>

      {livroSelecionado && (
        <div
          className="livro-modal"
          onClick={() =>
            setLivroSelecionado(null)
          }
        >
          <div
            className="livro-modal-conteudo"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-fechar"
              aria-label="Fechar"
              onClick={() =>
                setLivroSelecionado(null)
              }
            >
              ×
            </button>

            <div
              className={`modal-capa ${livroSelecionado.cor}`}
            >
              {livroSelecionado.real &&
                livroSelecionado.capaUrl && (
                  <img
                    className="capa-imagem-real"
                    src={livroSelecionado.capaUrl}
                    alt={`Capa de ${livroSelecionado.titulo}`}
                  />
                )}

              <div className="capa-moldura">
                <span className="moldura-canto superior-esquerdo">
                  ❖
                </span>

                <span className="moldura-canto superior-direito">
                  ❖
                </span>

                <span className="moldura-canto inferior-esquerdo">
                  ❖
                </span>

                <span className="moldura-canto inferior-direito">
                  ❖
                </span>

                <div className="moldura-linha" />
              </div>

              {!livroSelecionado.real && (
                <>
                  <div className="capa-brilho" />

                  <div className="capa-ornamento">
                    {
                      livroSelecionado.simbolo
                    }
                  </div>

                  <div className="capa-conteudo">
                    <span>
                      AVELUNE
                    </span>

                    <strong>
                      {
                        livroSelecionado.titulo
                      }
                    </strong>

                    <small>
                      {
                        livroSelecionado.autor
                      }
                    </small>
                  </div>
                </>
              )}
            </div>

            <div className="modal-informacoes">
              <span className="modal-eyebrow">
                {
                  livroSelecionado.genero
                }
              </span>

              <h2>
                {
                  livroSelecionado.titulo
                }
              </h2>

              <p className="modal-autor">
                por{" "}
                <strong>
                  {
                    livroSelecionado.autor
                  }
                </strong>
              </p>

              <div className="modal-divisor" />

              <p className="modal-sinopse">
                {
                  livroSelecionado.sinopse
                }
              </p>

              <div className="modal-acoes">
                <button
                  type="button"
                  className={
                    queroLer.includes(
                      livroSelecionado.id
                    )
                      ? "modal-botao principal ativo"
                      : "modal-botao principal"
                  }
                  onClick={() =>
                    alternarQueroLer(
                      livroSelecionado.id
                    )
                  }
                >
                  {queroLer.includes(
                    livroSelecionado.id
                  )
                    ? "✓ NA MINHA ESTANTE"
                    : "＋ QUERO LER"}
                </button>

                <button
                  type="button"
                  className={
                    favoritos.includes(
                      livroSelecionado.id
                    )
                      ? "modal-botao secundario ativo"
                      : "modal-botao secundario"
                  }
                  onClick={() =>
                    alternarFavorito(
                      livroSelecionado.id
                    )
                  }
                >
                  {favoritos.includes(
                    livroSelecionado.id
                  )
                    ? "♥ FAVORITADO"
                    : "♡ FAVORITAR"}
                </button>

                {livroSelecionado.amazonUrl && (
                  <a
                    className="modal-botao amazon"
                    href={livroSelecionado.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🛒 COMPRAR NA AMAZON
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Biblioteca;
