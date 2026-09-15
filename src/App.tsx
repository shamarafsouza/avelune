import { useEffect, useRef, useState } from "react";
import { criarCena } from "./three/Scene";
import Biblioteca from "./pages/Biblioteca";
import Explorar from "./pages/Explorar";
import Comunidade from "./pages/Comunidade";
import Perfil from "./pages/Perfil";
import Auth from "./pages/Auth";
import "./App.css";

type Pagina =
  | "inicio"
  | "biblioteca"
  | "explorar"
  | "comunidade"
  | "perfil"
  | "auth-cadastro"
  | "auth-login";

function App() {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [entrando, setEntrando] =
    useState(false);

  const [pagina, setPagina] =
    useState<Pagina>("inicio");

  useEffect(() => {
    if (
      pagina !== "inicio" ||
      !containerRef.current
    ) {
      return;
    }

    const limparCena =
      criarCena(containerRef.current);

    return limparCena;
  }, [pagina]);

  function entrarNaBiblioteca() {
    setEntrando(true);

    setTimeout(() => {
      navegar("biblioteca");
    }, 1800);
  }

  function navegar(novaPagina: Pagina) {
    setPagina(novaPagina);
  }

  if (pagina === "biblioteca") {
    return (
      <Biblioteca
        onNavigate={navegar}
      />
    );
  }

  if (pagina === "explorar") {
    return (
      <Explorar
        onNavigate={navegar}
      />
    );
  }

  if (pagina === "comunidade") {
    return (
      <Comunidade
        onNavigate={navegar}
      />
    );
  }

  if (pagina === "perfil") {
    return (
      <Perfil
        onNavigate={navegar}
      />
    );
  }

  if (pagina === "resenhas") {
    return (
      <Resenhas
        onNavigate={navegar}
      />
    );
  }

  if (pagina === "auth-cadastro") {
    return (
      <Auth
        modoInicial="cadastro"
        onAuthenticated={() =>
          navegar("comunidade")
        }
        onBack={() =>
          navegar("comunidade")
        }
      />
    );
  }

  if (pagina === "auth-login") {
    return (
      <Auth
        modoInicial="login"
        onAuthenticated={() =>
          navegar("comunidade")
        }
        onBack={() =>
          navegar("comunidade")
        }
      />
    );
  }

  return (
    <main
      className={`avelune ${
        entrando
          ? "avelune--entrando"
          : ""
      }`}
    >
      <div
        ref={containerRef}
        className="scene"
      />

      <div className="vignette" />

      <div className="brilho-central" />

      <header className="topo">
        <div className="mini-logo">
          AVELUNE
        </div>

        <nav>
          <button
            type="button"
            onClick={() =>
              navegar("biblioteca")
            }
          >
            Biblioteca
          </button>

          <button
            type="button"
            onClick={() =>
              navegar("explorar")
            }
          >
            Explorar
          </button>

          <button
            type="button"
            onClick={() =>
              navegar("resenhas")
            }
          >
            Resenhas
          </button>

          <button
            type="button"
            onClick={() =>
              navegar("comunidade")
            }
          >
            Comunidade
          </button>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">
          UMA BIBLIOTECA PARA QUEM AMA
          HISTÓRIAS
        </p>

        <h1>AVELUNE</h1>

        <div className="ornamento">
          <span />
          <strong>✦</strong>
          <span />
        </div>

        <p className="subtitulo">
          Onde cada história encontra
          seu leitor.
        </p>

        <button
          className="entrar"
          type="button"
          onClick={entrarNaBiblioteca}
        >
          <span>
            ENTRAR NA BIBLIOTECA
          </span>
          <strong>→</strong>
        </button>
      </section>

      <div className="rodape">
        <div>
          <span className="numero">
            01
          </span>

          <span>
            O COMEÇO DE UMA HISTÓRIA
          </span>
        </div>

        <div className="scroll">
          <span>EXPLORE</span>

          <span className="scroll-arrow">
            ↓
          </span>
        </div>

        <div>
          <span>BIBLIOTECA</span>

          <span className="numero">
            ∞
          </span>
        </div>
      </div>

      {entrando && (
        <div className="transicao">
          <div className="transicao-luz" />

          <p>
            A biblioteca está esperando...
          </p>
        </div>
      )}
    </main>
  );
}

export default App;
