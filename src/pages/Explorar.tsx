import { useEffect, useMemo, useState } from "react";
import "./Explorar.css";
import type { Livro } from "../types/livro";
import { useLivros } from "../hooks/useLivros";

type ExplorarProps = {
  onNavigate?: (
    pagina:
      | "inicio"
      | "biblioteca"
      | "explorar"
      | "comunidade"
      | "perfil"
  ) => void;
};

function Explorar({
  onNavigate,
}: ExplorarProps) {
  const { livros, carregando, erro } = useLivros();


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

  const [categoriaAtiva, setCategoriaAtiva] =
    useState("Todos");

  const [menuAberto, setMenuAberto] = useState(false);

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
    const texto = busca
      .toLowerCase()
      .trim();

    return livros.filter((livro) => {
      const categoriaOk =
        categoriaAtiva === "Todos" ||
        livro.genero === categoriaAtiva;

      const buscaOk =
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

      return categoriaOk && buscaOk;
    });
  }, [livros, categoriaAtiva, busca]);

  const maisBemAvaliados = [...livros]
    .sort(
      (a, b) =>
        Number(b.avaliacao) -
        Number(a.avaliacao)
    )
    .slice(0, 4);

  // livros[i] pode ser undefined enquanto o catálogo ainda está
  // carregando (ou se o catálogo tiver menos de 8 livros) — filtramos
  // esses casos pra não quebrar o render.
  const emAlta = [
    livros[0],
    livros[3],
    livros[6],
    livros[1],
  ].filter((item): item is Livro => Boolean(item));

  const recentes = [
    livros[7],
    livros[5],
    livros[4],
    livros[2],
  ].filter((item): item is Livro => Boolean(item));

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

  function abrirLivro(livro: Livro) {
    setLivroSelecionado(livro);
  }

  function fecharLivro() {
    setLivroSelecionado(null);
  }

  function renderCapa(livro: Livro) {
    const estaFavoritado =
      favoritos.includes(livro.titulo);

    const estaNaLista =
      queroLer.includes(livro.titulo);

    return (
      <div
        className={`explorar-capa ${livro.cor}`}
      >
        <div className="explorar-capa-moldura">
          <span className="explorar-canto top-left">
            ❖
          </span>

          <span className="explorar-canto top-right">
            ❖
          </span>

          <span className="explorar-canto bottom-left">
            ❖
          </span>

          <span className="explorar-canto bottom-right">
            ❖
          </span>
        </div>

        {livro.real && livro.capaUrl ? (
          <>
            <img
              className="explorar-capa-imagem-real"
              src={livro.capaUrl}
              alt={`Capa de ${livro.titulo}`}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <span className="explorar-selo-amazon">AMAZON</span>
          </>
        ) : (
          <>
            <div className="explorar-capa-brilho" />
            <span className="explorar-simbolo">{livro.simbolo}</span>
            <div className="explorar-capa-texto">
              <small>AVELUNE</small>
              <strong>{livro.titulo}</strong>
              <span>{livro.autor}</span>
            </div>
          </>
        )}

        <div className="explorar-capa-acoes">
          <button
            type="button"
            aria-label={
              estaFavoritado
                ? "Remover dos favoritos"
                : "Favoritar livro"
            }
            className={
              estaFavoritado
                ? "ativo"
                : ""
            }
            onClick={(event) => {
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
            aria-label={
              estaNaLista
                ? "Remover da estante"
                : "Adicionar à estante"
            }
            className={
              estaNaLista
                ? "ativo"
                : ""
            }
            onClick={(event) => {
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
    );
  }

  function renderCards(lista: Livro[]) {
    return (
      <div className="explorar-grid">
        {lista.map((livro) => (
          <article
            className="explorar-card"
            key={livro.titulo}
            onClick={() =>
              abrirLivro(livro)
            }
          >
            {renderCapa(livro)}

            <div className="explorar-info">
              <div>
                <h3>
                  {livro.titulo}
                </h3>

                <p>
                  {livro.autor}
                </p>
              </div>

              <span>
                ★ {livro.avaliacao}
              </span>
            </div>

            <small className="explorar-genero">
              {livro.genero}
            </small>
          </article>
        ))}
      </div>
    );
  }

  return (
    <main className="explorar">
      <div className="explorar-particulas" />

      <header className="explorar-topo">
        <div className="explorar-logo">
          AVELUNE
        </div>

        <nav className="explorar-nav">
          <button
            type="button"
            onClick={() =>
              onNavigate?.("biblioteca")
            }
          >
            Biblioteca
          </button>

          <button
            type="button"
            className="ativo"
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
          className={`explorar-menu-mobile ${
            menuAberto ? "aberto" : ""
          }`}
          aria-label={
            menuAberto ? "Fechar menu" : "Abrir menu"
          }
          aria-expanded={menuAberto}
          onClick={() =>
            setMenuAberto((atual) => !atual)
          }
        >
          <span />
          <span />
          <span />
        </button>

        {menuAberto && (
          <div className="explorar-menu-dropdown">
            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onNavigate?.("biblioteca");
              }}
            >
              Biblioteca
            </button>

            <button
              type="button"
              className="ativo"
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

        <div className="explorar-acoes">
          <button
            className="explorar-icone"
            aria-label="Pesquisar"
            type="button"
            onClick={() => {
              document
                .querySelector<HTMLInputElement>(
                  ".explorar-busca input"
                )
                ?.focus();
            }}
          >
            ⌕
          </button>

          <button
            className="explorar-perfil"
            aria-label="Perfil"
            type="button"
          >
            ◇
          </button>
        </div>
      </header>

      <section className="explorar-conteudo">
        <div className="explorar-introducao">
          <span>
            EXPLORE O UNIVERSO AVELUNE
          </span>

          <h1>
            Há sempre uma
            <br />
            nova história.
          </h1>

          <p>
            Descubra livros que despertam
            a imaginação, encontre novos
            mundos e deixe sua próxima
            leitura encontrar você.
          </p>
        </div>

        <div className="explorar-busca">
          <span>⌕</span>

          <input
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
            placeholder="O que você deseja descobrir?"
          />

          {busca && (
            <button
              type="button"
              onClick={() =>
                setBusca("")
              }
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <section className="explorar-categorias">
          <div className="explorar-secao-titulo">
            <span>
              EXPLORE POR GÊNERO
            </span>

            <div />
          </div>

          <div className="explorar-categorias-lista">
            {categorias.map(
              (categoria) => (
                <button
                  key={categoria}
                  type="button"
                  className={
                    categoriaAtiva ===
                    categoria
                      ? "ativo"
                      : ""
                  }
                  onClick={() =>
                    setCategoriaAtiva(
                      categoria
                    )
                  }
                >
                  {categoria}
                </button>
              )
            )}
          </div>
        </section>

        {busca ||
        categoriaAtiva !== "Todos" ? (
          <section className="explorar-resultados">
            <div className="explorar-cabecalho">
              <div>
                <span>
                  RESULTADOS
                </span>

                <h2>
                  {categoriaAtiva !==
                  "Todos"
                    ? categoriaAtiva
                    : "Sua busca"}
                </h2>
              </div>

              <span className="explorar-total">
                {livrosFiltrados.length}{" "}
                {livrosFiltrados.length ===
                1
                  ? "história"
                  : "histórias"}
              </span>
            </div>

            {carregando ? (
              <div className="explorar-vazio">
                <span>✦</span>
                <h3>Abrindo a biblioteca...</h3>
                <p>Buscando os livros do catálogo.</p>
              </div>
            ) : erro ? (
              <div className="explorar-vazio">
                <span>✦</span>
                <h3>{erro}</h3>
                <p>Tente recarregar a página em instantes.</p>
              </div>
            ) : livrosFiltrados.length > 0 ? (
              renderCards(
                livrosFiltrados
              )
            ) : (
              <div className="explorar-vazio">
                <span>✦</span>

                <h3>
                  Nenhuma história
                  encontrada.
                </h3>

                <p>
                  Tente outro título,
                  autor ou gênero.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setCategoriaAtiva(
                      "Todos"
                    );
                  }}
                >
                  EXPLORAR NOVAMENTE
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="explorar-secao">
              <div className="explorar-cabecalho">
                <div>
                  <span>
                    OS MAIS QUERIDOS
                  </span>

                  <h2>
                    Mais bem avaliados
                  </h2>
                </div>

                <span className="explorar-ornamento">
                  ✦
                </span>
              </div>

              {renderCards(
                maisBemAvaliados
              )}
            </section>

            <section className="explorar-secao">
              <div className="explorar-cabecalho">
                <div>
                  <span>
                    O QUE ESTÁ DESPERTANDO
                    CURIOSIDADE
                  </span>

                  <h2>
                    Em alta
                  </h2>
                </div>

                <span className="explorar-ornamento">
                  ◇
                </span>
              </div>

              {renderCards(emAlta)}
            </section>

            <section className="explorar-secao">
              <div className="explorar-cabecalho">
                <div>
                  <span>
                    RECÉM-CHEGADOS À
                    BIBLIOTECA
                  </span>

                  <h2>
                    Descobertas recentes
                  </h2>
                </div>

                <span className="explorar-ornamento">
                  ☾
                </span>
              </div>

              {renderCards(recentes)}
            </section>

            <section className="explorar-banner">
              <div className="explorar-banner-ornamento">
                ✦
              </div>

              <span>
                UMA HISTÓRIA PARA CADA
                MOMENTO
              </span>

              <h2>
                Talvez seu próximo
                livro esteja aqui.
              </h2>

              <p>
                Caminhe pelas estantes,
                siga sua curiosidade e
                deixe a biblioteca escolher
                o próximo capítulo.
              </p>

              <button
                type="button"
                onClick={() =>
                  setCategoriaAtiva(
                    "Fantasia"
                  )
                }
              >
                COMEÇAR A DESCOBRIR →
              </button>
            </section>
          </>
        )}
      </section>

      <footer className="explorar-rodape">
        <span>
          AVELUNE © 2026
        </span>

        <span>
          ONDE CADA HISTÓRIA ENCONTRA
          SEU LEITOR
        </span>

        <span>✦</span>
      </footer>

      {livroSelecionado && (
        <div
          className="explorar-modal"
          onClick={fecharLivro}
        >
          <div
            className="explorar-modal-conteudo"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="explorar-modal-fechar"
              aria-label="Fechar"
              onClick={fecharLivro}
            >
              ×
            </button>

            <div
              className={`explorar-modal-capa ${livroSelecionado.cor}`}
            >
              <div className="explorar-capa-moldura">
                <span className="explorar-canto top-left">
                  ❖
                </span>

                <span className="explorar-canto top-right">
                  ❖
                </span>

                <span className="explorar-canto bottom-left">
                  ❖
                </span>

                <span className="explorar-canto bottom-right">
                  ❖
                </span>
              </div>

              {livroSelecionado.real && livroSelecionado.capaUrl ? (
                <img
                  className="explorar-capa-imagem-real"
                  src={livroSelecionado.capaUrl}
                  alt={`Capa de ${livroSelecionado.titulo}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <div className="explorar-capa-brilho" />
                  <span className="explorar-simbolo">
                    {livroSelecionado.simbolo}
                  </span>
                  <div className="explorar-capa-texto">
                    <small>AVELUNE</small>
                    <strong>{livroSelecionado.titulo}</strong>
                    <span>{livroSelecionado.autor}</span>
                  </div>
                </>
              )}
            </div>

            <div className="explorar-modal-informacoes">
              <span className="explorar-modal-genero">
                {livroSelecionado.genero}
              </span>

              <h2>
                {livroSelecionado.titulo}
              </h2>

              <p className="explorar-modal-autor">
                por{" "}
                <strong>
                  {livroSelecionado.autor}
                </strong>
              </p>

              <div className="explorar-modal-avaliacao">
                <span>★</span>

                <strong>
                  {livroSelecionado.avaliacao}
                </strong>

                <small>
                  avaliação da biblioteca
                </small>
              </div>

              <div className="explorar-modal-divisor" />

              <p className="explorar-modal-sinopse">
                {livroSelecionado.sinopse}
              </p>

              <div className="explorar-modal-acoes">
                <button
                  type="button"
                  className={
                    queroLer.includes(livroSelecionado.titulo)
                      ? "principal ativo"
                      : "principal"
                  }
                  onClick={() =>
                    alternarQueroLer(livroSelecionado.titulo)
                  }
                >
                  {queroLer.includes(livroSelecionado.titulo)
                    ? "✓ NA MINHA ESTANTE"
                    : "＋ QUERO LER"}
                </button>

                <button
                  type="button"
                  className={
                    favoritos.includes(livroSelecionado.titulo)
                      ? "secundario ativo"
                      : "secundario"
                  }
                  onClick={() =>
                    alternarFavorito(livroSelecionado.titulo)
                  }
                >
                  {favoritos.includes(livroSelecionado.titulo)
                    ? "♥ FAVORITADO"
                    : "♡ FAVORITAR"}
                </button>

                {livroSelecionado.amazonUrl && (
                  <a
                    className="secundario amazon"
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

export default Explorar;
