import "./AveluneHeader.css";

type Pagina = "biblioteca" | "comunidade" | "grupos" | "perfil";

type AveluneHeaderProps = {
  paginaAtual: Pagina;
  onNavigate: (pagina: Pagina) => void;
};

export default function AveluneHeader({
  paginaAtual,
  onNavigate,
}: AveluneHeaderProps) {
  return (
    <header className="avelune-header">

      <button
        type="button"
        className="avelune-header-logo"
        onClick={() => onNavigate("biblioteca")}
        aria-label="Ir para a Biblioteca"
      >
        <img
          src="/avelune-brasao.png"
          alt="Brasão da Avelune"
        />

        <span>AVELUNE</span>
      </button>

      <nav
        className="avelune-header-nav"
        aria-label="Navegação principal"
      >
        <button
          type="button"
          className={
            paginaAtual === "biblioteca"
              ? "ativo"
              : ""
          }
          onClick={() => onNavigate("biblioteca")}
        >
          Biblioteca
        </button>

             <button
          type="button"
          className={
            paginaAtual === "comunidade"
              ? "ativo"
              : ""
          }
          onClick={() => onNavigate("comunidade")}
        >
          Comunidade
        </button>

        <button
          type="button"
          className={
            paginaAtual === "grupos"
              ? "ativo"
              : ""
          }
          onClick={() => onNavigate("grupos")}
        >
          Grupos
        </button>

        <button
          type="button"
          className={
            paginaAtual === "perfil"
              ? "ativo"
              : ""
          }
          onClick={() => onNavigate("perfil")}
        >
          Perfil
        </button>
      </nav>

    </header>
  );
}
