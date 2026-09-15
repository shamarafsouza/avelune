import { FormEvent, useState } from "react";
import "./Auth.css";

type ModoAuth = "login" | "cadastro";

type AuthProps = {
  modoInicial?: ModoAuth;
  onAuthenticated: () => void;
  onBack?: () => void;
};

function Auth({
  modoInicial = "login",
  onAuthenticated,
  onBack,
}: AuthProps) {
  const [modo, setModo] =
    useState<ModoAuth>(modoInicial);

  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] =
    useState("");

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  function trocarModo(novoModo: ModoAuth) {
    setModo(novoModo);
    setErro("");
    setMensagem("");
  }

  function enviarFormulario(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setErro("");
    setMensagem("");

    if (modo === "cadastro") {
      const nomeLimpo = nome.trim();
      const usuarioLimpo = usuario
        .trim()
        .replace(/^@+/, "");
      const emailLimpo =
        email.trim().toLowerCase();

      if (
        !nomeLimpo ||
        !usuarioLimpo ||
        !emailLimpo ||
        !senha ||
        !confirmarSenha
      ) {
        setErro(
          "Preencha todos os campos para criar sua conta."
        );
        return;
      }

      if (senha.length < 6) {
        setErro(
          "Sua senha precisa ter pelo menos 6 caracteres."
        );
        return;
      }

      if (senha !== confirmarSenha) {
        setErro(
          "As senhas não coincidem."
        );
        return;
      }

      const iniciais =
        nomeLimpo
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((parte) => parte[0])
          .join("")
          .toUpperCase() || "VC";

      try {
        localStorage.setItem(
          "avelune-conta",
          JSON.stringify({
            nome: nomeLimpo,
            usuario: `@${usuarioLimpo}`,
            email: emailLimpo,
          })
        );

        localStorage.setItem(
          "avelune-perfil",
          JSON.stringify({
            nome: nomeLimpo,
            usuario: `@${usuarioLimpo}`,
            bio:
              "Apaixonada por histórias e mundos que ficam com a gente.",
            iniciais,
            foto: "",
          })
        );

        localStorage.setItem(
          "avelune-usuario-logado",
          "true"
        );

        setMensagem(
          "Conta criada. Bem-vinda à comunidade..."
        );

        window.setTimeout(() => {
          onAuthenticated();
        }, 700);
      } catch {
        setErro(
          "Não foi possível criar a conta neste navegador."
        );
      }

      return;
    }

    if (!email.trim() || !senha) {
      setErro(
        "Preencha seu e-mail e sua senha."
      );
      return;
    }

    /*
     * Temporariamente o login usa o navegador
     * apenas para testar o fluxo da aplicação.
     *
     * Depois esta parte será substituída pelo
     * Supabase Auth. Nenhuma senha é salva aqui.
     */
    localStorage.setItem(
      "avelune-usuario-logado",
      "true"
    );

    setMensagem("Entrando no Avelune...");

    window.setTimeout(() => {
      onAuthenticated();
    }, 700);
  }

  return (
    <main className="auth">
      <div className="auth-fundo" />

      <div className="auth-brilho auth-brilho--um" />
      <div className="auth-brilho auth-brilho--dois" />

      <div className="auth-estrelas">
        <span>✦</span>
        <span>✧</span>
        <span>✦</span>
        <span>·</span>
        <span>✧</span>
      </div>

      <section className="auth-painel">
        <button
          type="button"
          className="auth-voltar"
          onClick={onBack}
        >
          ← VOLTAR
        </button>

        <div className="auth-logo">
          AVELUNE
        </div>

        <div className="auth-ornamento">
          <span />
          <strong>✦</strong>
          <span />
        </div>

        <p className="auth-eyebrow">
          {modo === "login"
            ? "BEM-VINDA DE VOLTA"
            : "UMA NOVA HISTÓRIA COMEÇA AQUI"}
        </p>

        <h1>
          {modo === "login"
            ? "Entre na sua biblioteca."
            : "Crie sua conta."}
        </h1>

        <p className="auth-descricao">
          {modo === "login"
            ? "Suas histórias, sua estante e sua comunidade estão esperando por você."
            : "Entre para uma comunidade feita para quem acredita que cada livro guarda um mundo."}
        </p>

        <div className="auth-abas">
          <button
            type="button"
            className={
              modo === "login"
                ? "auth-aba auth-aba--ativa"
                : "auth-aba"
            }
            onClick={() =>
              trocarModo("login")
            }
          >
            ENTRAR
          </button>

          <button
            type="button"
            className={
              modo === "cadastro"
                ? "auth-aba auth-aba--ativa"
                : "auth-aba"
            }
            onClick={() =>
              trocarModo("cadastro")
            }
          >
            CRIAR CONTA
          </button>
        </div>

        <form
          className="auth-formulario"
          onSubmit={enviarFormulario}
        >
          {modo === "cadastro" && (
            <>
              <label>
                <span>SEU NOME</span>

                <input
                  type="text"
                  value={nome}
                  onChange={(evento) =>
                    setNome(evento.target.value)
                  }
                  placeholder="Como podemos chamar você?"
                  maxLength={80}
                  autoComplete="name"
                />
              </label>

              <label>
                <span>NOME DE USUÁRIO</span>

                <input
                  type="text"
                  value={usuario}
                  onChange={(evento) =>
                    setUsuario(evento.target.value)
                  }
                  placeholder="@seunome"
                  maxLength={30}
                  autoComplete="username"
                />
              </label>
            </>
          )}

          <label>
            <span>E-MAIL</span>

            <input
              type="email"
              value={email}
              onChange={(evento) =>
                setEmail(evento.target.value)
              }
              placeholder="seu@email.com"
              maxLength={120}
              autoComplete="email"
            />
          </label>

          <label>
            <span>SENHA</span>

            <div className="auth-senha">
              <input
                type={
                  mostrarSenha
                    ? "text"
                    : "password"
                }
                value={senha}
                onChange={(evento) =>
                  setSenha(evento.target.value)
                }
                placeholder="••••••••"
                autoComplete={
                  modo === "login"
                    ? "current-password"
                    : "new-password"
                }
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarSenha(
                    (atual) => !atual
                  )
                }
                aria-label={
                  mostrarSenha
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
              >
                {mostrarSenha ? "◉" : "◌"}
              </button>
            </div>
          </label>

          {modo === "cadastro" && (
            <label>
              <span>CONFIRMAR SENHA</span>

              <input
                type={
                  mostrarSenha
                    ? "text"
                    : "password"
                }
                value={confirmarSenha}
                onChange={(evento) =>
                  setConfirmarSenha(
                    evento.target.value
                  )
                }
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
          )}

          {modo === "login" && (
            <button
              type="button"
              className="auth-esqueci"
              onClick={() =>
                setMensagem(
                  "A recuperação de senha será configurada junto com o Supabase."
                )
              }
            >
              Esqueci minha senha
            </button>
          )}

          {erro && (
            <div
              className="auth-mensagem auth-mensagem--erro"
              role="alert"
            >
              {erro}
            </div>
          )}

          {mensagem && (
            <div
              className="auth-mensagem auth-mensagem--sucesso"
              role="status"
            >
              {mensagem}
            </div>
          )}

          <button
            type="submit"
            className="auth-botao"
          >
            <span>
              {modo === "login"
                ? "ENTRAR NO AVELUNE"
                : "CRIAR MINHA CONTA"}
            </span>

            <strong>→</strong>
          </button>
        </form>

        <p className="auth-rodape">
          {modo === "login"
            ? "Entre para participar da comunidade Avelune."
            : "Ao criar sua conta, você poderá publicar fotos, escrever resenhas e participar da comunidade."}
        </p>
      </section>

      <div className="auth-frase">
        <span>✦</span>
        <p>
          Toda grande história começa
          com uma página.
        </p>
        <span>✦</span>
      </div>
    </main>
  );
}

export default Auth;
