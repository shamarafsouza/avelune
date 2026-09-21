import { useEffect, useRef, useState } from "react";
import "./AveluneHeader.css";
import { useNotificacoes } from "../hooks/useNotificacoes";

type Pagina = "biblioteca" | "comunidade" | "grupos" | "perfil";

type AveluneHeaderProps = {
  paginaAtual: Pagina;
  onNavigate: (pagina: Pagina) => void;
};

function formatarTempo(data: string) {
  const minutos = Math.floor(Math.max(0, Date.now() - new Date(data).getTime()) / 60000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

export default function AveluneHeader({
  paginaAtual,
  onNavigate,
}: AveluneHeaderProps) {
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas } =
    useNotificacoes();

  const [aberto, setAberto] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    function fecharAoClicarFora(evento: MouseEvent) {
      if (areaRef.current && !areaRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, [aberto]);

  useEffect(() => {
    if (notificacoes.length === 0) setAberto(false);
  }, [notificacoes.length]);

  return (
    <header className="avelune-header">
      <button
        type="button"
        className="avelune-header-logo"
        onClick={() => onNavigate("biblioteca")}
        aria-label="Ir para a Biblioteca"
      >
        <img src="/avelune-brasao.png" alt="Brasão da Avelune" />
        <span>AVELUNE</span>
      </button>

      <div className="avelune-header-direita">
        <nav className="avelune-header-nav" aria-label="Navegação principal">
          <button
            type="button"
            className={paginaAtual === "biblioteca" ? "ativo" : ""}
            onClick={() => onNavigate("biblioteca")}
          >
            Biblioteca
          </button>

          <button
            type="button"
            className={paginaAtual === "comunidade" ? "ativo" : ""}
            onClick={() => onNavigate("comunidade")}
          >
            Comunidade
          </button>

          <button
            type="button"
            className={paginaAtual === "grupos" ? "ativo" : ""}
            onClick={() => onNavigate("grupos")}
          >
            Grupos
          </button>

          <button
            type="button"
            className={paginaAtual === "perfil" ? "ativo" : ""}
            onClick={() => onNavigate("perfil")}
          >
            Perfil
          </button>
        </nav>

        {notificacoes.length > 0 && (
          <div className="avelune-notif" ref={areaRef}>
            <button
              type="button"
              className={`avelune-notif-sino ${aberto ? "avelune-notif-sino--ativo" : ""}`}
              onClick={() => setAberto((atual) => !atual)}
              aria-label="Abrir notificações"
              aria-expanded={aberto}
            >
              <span aria-hidden="true">🔔</span>
              {naoLidas > 0 && (
                <span className="avelune-notif-contador">
                  {naoLidas > 9 ? "9+" : naoLidas}
                </span>
              )}
            </button>

            {aberto && (
              <div className="avelune-notif-painel" role="dialog" aria-label="Notificações">
                <div className="avelune-notif-topo">
                  <h2>Notificações</h2>

                  {naoLidas > 0 && (
                    <button
                      type="button"
                      className="avelune-notif-marcar"
                      onClick={() => void marcarTodasComoLidas()}
                    >
                      Marcar como lidas
                    </button>
                  )}
                </div>

                <div className="avelune-notif-lista">
                  {notificacoes.map((notificacao) => {
                    const nomeAutor = notificacao.autor?.nome || "Alguém";
                    const texto =
                      notificacao.tipo === "seguir"
                        ? "começou a seguir você."
                        : notificacao.tipo === "curtida"
                          ? "curtiu sua publicação."
                          : "comentou sua publicação.";

                    return (
                      <button
                        type="button"
                        key={notificacao.id}
                        className={`avelune-notif-item ${notificacao.lida ? "" : "avelune-notif-item--nova"}`}
                        onClick={() => {
                          if (!notificacao.lida) void marcarComoLida(notificacao.id);
                          setAberto(false);
                          onNavigate("perfil");
                        }}
                      >
                        <span className="avelune-notif-avatar">
                          {notificacao.autor?.avatar_url ? (
                            <img src={notificacao.autor.avatar_url} alt="" />
                          ) : (
                            nomeAutor.charAt(0).toUpperCase()
                          )}
                        </span>

                        <span className="avelune-notif-conteudo">
                          <span>
                            <strong>{nomeAutor}</strong> {texto}
                          </span>
                          <small>{formatarTempo(notificacao.created_at)}</small>
                        </span>

                        {!notificacao.lida && (
                          <span className="avelune-notif-ponto" aria-label="Não lida" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
