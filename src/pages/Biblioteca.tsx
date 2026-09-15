import { useEffect, useMemo, useState } from "react";
import "./Biblioteca.css";
import type { Livro } from "../types/livro";
import { useLivros } from "../hooks/useLivros";

type FiltroBiblioteca =
  | "todos"
  | "estante"
  | "favoritos";

type BibliotecaProps = {
  onNavigate?: (
    pagina:
      | "inicio"
      | "biblioteca"
      | "explorar"
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

  const { livros, carregando, erro } = useLivros();


  const [categoriaAtiva, setCategoriaAtiva] =
    useState("Todos");

  const [filtroBiblioteca, setFiltroBiblioteca] =
    useState<FiltroBiblioteca>("todos");

  const [busca, setBusca] = useState("");

  const [menuAberto, setMenuAberto] = useState(false);

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
    const texto = busca
      .toLowerCase()
      .trim();

    return livros.filter((livro) => {
      const pertenceCategoria =
        categoriaAtiva === "Todos" ||
        livro.genero === categoriaAtiva;

      const pertenceFiltro =
        filtroBiblioteca === "todos" ||
        (filtroBiblioteca === "estante" &&
          queroLer.includes(livro.titulo)) ||
        (filtroBiblioteca === "favoritos" &&
          favoritos.includes(livro.titulo));

      const correspondeBusca =
        texto === "" ||
        livro.titulo
          .toLowerCase()
          .includes(texto) ||
        livro.autor
          .toLowerCase()
          .includes(texto) ||
        livro.genero
          .toLowerCase()
          .includes(texto);

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
    titulo: string
  ) {
    setFavoritos((atuais) => {
      if (atuais.includes(titulo)) {
        return atuais.filter(
          (item) => item !== titulo
        );
      }

      return [...atuais, titulo];
    });
  }

  function alternarQueroLer(
    titulo: string
  ) {
    setQueroLer((atuais) => {
      if (atuais.includes(titulo)) {
        return atuais.filter(
          (item) => item !== titulo
        );
      }

      return [...atuais, titulo];
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

      <header className="biblioteca-topo">
        <div className="biblioteca-logo">
          AVELUNE
        </div>

        <nav className="biblioteca-nav">
          <button
            className="ativo"
            type="button"
            onClick={() =>
              onNavigate?.("biblioteca")
            }
          >
            Biblioteca
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.("explorar")
            }
          >
            Explorar
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.("comunidade")
            }
          >
            Comunidade
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.("perfil")
            }
          >
            Perfil
          </button>
        </nav>

        <button
          type="button"
          className={`biblioteca-menu-mobile ${menuAberto ? "aberto" : ""}`}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((atual) => !atual)}
        >
          <span />
          <span />
          <span />
        </button>

        {menuAberto && (
          <div className="biblioteca-menu-dropdown">
            <button
              type="button"
              className="ativo"
              onClick={() => setMenuAberto(false)}
            >
              Biblioteca
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onNavigate?.("explorar");
              }}
            >
              Explorar
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onNavigate?.("comunidade");
              }}
            >
              Comunidade
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onNavigate?.("perfil");
              }}
            >
              Perfil
            </button>
          </div>
        )}

        <div className="biblioteca-acoes">
          <button
            className="icone-botao"
            aria-label="Pesquisar"
            type="button"
            onClick={() => {
              document
                .querySelector<HTMLInputElement>(
                  ".biblioteca-busca input"
                )
                ?.focus();
            }}
          >
            ⌕
          </button>

          <button
            className="perfil-botao"
            aria-label="Perfil"
            type="button"
          >
            ◇
          </button>
        </div>
      </header>

      <section className="biblioteca-conteudo">
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

        <section className="destaques">
          <div className="secao-cabecalho">
            <div>
              <span className="secao-eyebrow">
                {eyebrowSecao}
              </span>

              <h2>
                {categoriaAtiva !==
                  "Todos" &&
                filtroBiblioteca ===
                  "todos"
                  ? categoriaAtiva
                  : tituloSecao}
              </h2>
            </div>

            <button
              className="ver-todos"
              type="button"
              onClick={limparFiltros}
            >
              VER TODOS →
            </button>
          </div>

          {carregando ? (
            <div className="nenhum-livro">
              <span>✦</span>
              <h3>Abrindo a biblioteca...</h3>
              <p>Buscando os livros do catálogo.</p>
            </div>
          ) : erro ? (
            <div className="nenhum-livro">
              <span>✦</span>
              <h3>{erro}</h3>
              <p>Tente recarregar a página em instantes.</p>
            </div>
          ) : livrosFiltrados.length >
          0 ? (
            <div className="livros-grid">
              {livrosFiltrados.map(
                (livro, index) => {
                  const estaFavoritado =
                    favoritos.includes(
                      livro.titulo
                    );

                  const estaNaLista =
                    queroLer.includes(
                      livro.titulo
                    );

                  return (
                    <article
                      className="livro-card"
                      key={livro.titulo}
                      onClick={() =>
                        setLivroSelecionado(
                          livro
                        )
                      }
                    >
                      <div
                        className={`livro-capa ${livro.cor}`}
                      >
                        {livro.real && livro.capaUrl && (
                          <img
                            className="capa-imagem-real"
                            src={livro.capaUrl}
                            alt={`Capa de ${livro.titulo}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        {livro.real && (
                          <span className="livro-selo-amazon">
                            AMAZON
                          </span>
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

                        {!livro.real && (
                          <>
                            <div className="capa-brilho" />

                            <div className="capa-ornamento">
                              {livro.simbolo}
                            </div>

                            <div className="capa-conteudo">
                              <span>
                                AVELUNE
                              </span>

                              <strong>
                                {livro.titulo}
                              </strong>

                              <small>
                                {livro.autor}
                              </small>
                            </div>
                          </>
                        )}

                        <div className="capa-numero">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="capa-acoes">
                          <button
                            type="button"
                            className={
                              estaFavoritado
                                ? "capa-acao ativo"
                                : "capa-acao"
                            }
                            aria-label={
                              estaFavoritado
                                ? "Remover dos favoritos"
                                : "Favoritar livro"
                            }
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              alternarFavorito(
                                livro.titulo
                              );
                            }}
                          >
                            {estaFavoritado
                              ? "♥"
                              : "♡"}
                          </button>

                          <button
                            type="button"
                            className={
                              estaNaLista
                                ? "capa-acao ativo"
                                : "capa-acao"
                            }
                            aria-label={
                              estaNaLista
                                ? "Remover da estante"
                                : "Adicionar à estante"
                            }
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              alternarQueroLer(
                                livro.titulo
                              );
                            }}
                          >
                            {estaNaLista
                              ? "✓"
                              : "+"}
                          </button>
                        </div>
                      </div>

                      <div className="livro-informacoes">
                        <div>
                          <h3>
                            {livro.titulo}
                          </h3>

                          <p>
                            {livro.autor}
                          </p>
                        </div>

                        <span className="avaliacao">
                          ★{" "}
                          {livro.avaliacao}
                        </span>
                      </div>

                      <span className="livro-genero">
                        {livro.genero}
                      </span>

                      {livro.real && livro.amazonUrl && (
                        <a
                          className="livro-amazon"
                          href={livro.amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                        >
                          COMPRAR NA AMAZON ↗
                        </a>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="nenhum-livro">
              <span>
                {filtroBiblioteca ===
                "favoritos"
                  ? "♥"
                  : "✦"}
              </span>

              <h3>
                {filtroBiblioteca ===
                "estante"
                  ? "Sua estante está vazia."
                  : filtroBiblioteca ===
                    "favoritos"
                  ? "Você ainda não tem favoritos."
                  : "Nenhuma história encontrada."}
              </h3>

              <p>
                {filtroBiblioteca ===
                "estante"
                  ? "Escolha uma história na biblioteca para começar sua coleção."
                  : filtroBiblioteca ===
                    "favoritos"
                  ? "Favorite os livros que você deseja encontrar novamente."
                  : "Tente buscar por outro título, autor ou categoria."}
              </p>

              <button
                type="button"
                onClick={limparFiltros}
              >
                EXPLORAR TODAS AS
                HISTÓRIAS
              </button>
            </div>
          )}
        </section>

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
                      livro.titulo
                    )
                  )
                  .map((livro) => (
                    <button
                      key={livro.titulo}
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

              <div className="modal-avaliacao">
                <span>★</span>

                <strong>
                  {
                    livroSelecionado.avaliacao
                  }
                </strong>

                <small>
                  avaliação da biblioteca
                </small>
              </div>

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
                      livroSelecionado.titulo
                    )
                      ? "modal-botao principal ativo"
                      : "modal-botao principal"
                  }
                  onClick={() =>
                    alternarQueroLer(
                      livroSelecionado.titulo
                    )
                  }
                >
                  {queroLer.includes(
                    livroSelecionado.titulo
                  )
                    ? "✓ NA MINHA ESTANTE"
                    : "＋ QUERO LER"}
                </button>

                <button
                  type="button"
                  className={
                    favoritos.includes(
                      livroSelecionado.titulo
                    )
                      ? "modal-botao secundario ativo"
                      : "modal-botao secundario"
                  }
                  onClick={() =>
                    alternarFavorito(
                      livroSelecionado.titulo
                    )
                  }
                >
                  {favoritos.includes(
                    livroSelecionado.titulo
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
