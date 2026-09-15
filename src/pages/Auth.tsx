import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
import "./Auth.css";

type ModoAuth = "login" | "cadastro";

type AuthProps = {
  modoInicial?: ModoAuth;
  onAuthenticated: () => void;
  onBack?: () => void;
};

function traduzirErroAuth(mensagem: string) {
  const texto = mensagem.toLowerCase();

  if (
    texto.includes("user already registered") ||
    texto.includes("already been registered")
  ) {
    return "Este e-mail já está cadastrado no Avelune.";
  }

  if (
    texto.includes("invalid login credentials") ||
    texto.includes("invalid credentials")
  ) {
    return "E-mail ou senha incorretos.";
  }

  if (
    texto.includes("email not confirmed") ||
    texto.includes("email_not_confirmed")
  ) {
    return "Confirme seu e-mail antes de entrar no Avelune.";
  }

  if (
    texto.includes("password") &&
    (texto.includes("weak") || texto.includes("should be at least"))
  ) {
    return "Sua senha precisa ter pelo menos 6 caracteres.";
  }

  return mensagem || "Não foi possível concluir a operação.";
}

function Auth({
  modoInicial = "login",
  onAuthenticated,
  onBack,
}: AuthProps) {
  const [modo, setModo] = useState<ModoAuth>(modoInicial);

  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  function trocarModo(novoModo: ModoAuth) {
    setModo(novoModo);
    setErro("");
    setMensagem("");
  }

  async function enviarFormulario(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (carregando) {
      return;
    }

    setErro("");
    setMensagem("");

    const emailLimpo = email.trim().toLowerCase();

    if (modo === "cadastro") {
      const nomeLimpo = nome.trim();
      const usuarioLimpo = usuario
        .trim()
        .replace(/^@+/, "")
        .toLowerCase();

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

      if (usuarioLimpo.length < 3) {
        setErro(
          "Seu nome de usuário precisa ter pelo menos 3 caracteres."
        );
        return;
      }

      if (!/^[a-z0-9._-]+$/.test(usuarioLimpo)) {
        setErro(
          "O nome de usuário pode usar apenas letras, números, ponto, hífen e sublinhado."
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
        setErro("As senhas não coincidem.");
        return;
      }

      setCarregando(true);

      try {
        const { data, error } =
          await supabase.auth.signUp({
            email: emailLimpo,
            password: senha,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                nome: nomeLimpo,
                username: usuarioLimpo,
              },
            },
          });

        if (error) {
          setErro(traduzirErroAuth(error.message));
          return;
        }

        if (!data.user) {
          setErro("Não foi possível criar sua conta.");
          return;
        }

        if (data.session) {
          setMensagem(
            "Conta criada com sucesso. Bem-vinda ao Avelune!"
          );

          window.setTimeout(() => {
            onAuthenticated();
          }, 700);

          return;
        }

        setMensagem(
          "Conta criada! Confira seu e-mail para confirmar a conta e depois entre no Avelune."
        );
      } catch (erroDesconhecido) {
        const mensagemErro =
          erroDesconhecido instanceof Error
            ? erroDesconhecido.message
            : "Não foi possível criar sua conta.";

        setErro(traduzirErroAuth(mensagemErro));
      } finally {
        setCarregando(false);
      }

      return;
    }

    if (!emailLimpo || !senha) {
      setErro("Preencha seu e-mail e sua senha.");
      return;
    }

    setCarregando(true);

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: emailLimpo,
          password: senha,
        });

      if (error) {
        setErro(traduzirErroAuth(error.message));
        return;
      }

      setMensagem("Entrando no Avelune...");

      window.setTimeout(() => {
        onAuthenticated();
      }, 500);
    } catch (erroDesconhecido) {
      const mensagemErro =
        erroDesconhecido instanceof Error
          ? erroDesconhecido.message
          : "Não foi possível entrar no Avelune.";

      setErro(traduzirErroAuth(mensagemErro));
    } finally {
      setCarregando(false);
    }
  }

  async function recuperarSenha() {
    const emailLimpo = email.trim().toLowerCase();

    setErro("");
    setMensagem("");

    if (!emailLimpo) {
      setErro(
        "Digite seu e-mail para receber o link de recuperação."
      );
      return;
    }

    setCarregando(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          emailLimpo,
          {
            redirectTo: `${window.location.origin}/`,
          }
        );

      if (error) {
        setErro(traduzirErroAuth(error.message));
        return;
      }

      setMensagem(
        "Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
      );
    } catch (erroDesconhecido) {
      const mensagemErro =
        erroDesconhecido instanceof Error
          ? erroDesconhecido.message
          : "Não foi possível solicitar a recuperação da senha.";

      setErro(traduzirErroAuth(mensagemErro));
    } finally {
      setCarregando(false);
    }
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
          disabled={carregando}
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
            onClick={() => trocarModo("login")}
            disabled={carregando}
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
            onClick={() => trocarModo("cadastro")}
            disabled={carregando}
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
                    setNome(
                      evento.target.value
                    )
                  }
                  placeholder="Como podemos chamar você?"
                  maxLength={80}
                  autoComplete="name"
                  disabled={carregando}
                />
              </label>

              <label>
                <span>NOME DE USUÁRIO</span>

                <input
                  type="text"
                  value={usuario}
                  onChange={(evento) =>
                    setUsuario(
                      evento.target.value
                    )
                  }
                  placeholder="@seunome"
                  maxLength={30}
                  autoComplete="username"
                  disabled={carregando}
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
                setEmail(
                  evento.target.value
                )
              }
              placeholder="seu@email.com"
              maxLength={120}
              autoComplete="email"
              disabled={carregando}
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
                  setSenha(
                    evento.target.value
                  )
                }
                placeholder="••••••••"
                autoComplete={
                  modo === "login"
                    ? "current-password"
                    : "new-password"
                }
                disabled={carregando}
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
                disabled={carregando}
              >
                {mostrarSenha
                  ? "◉"
                  : "◌"}
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
                disabled={carregando}
              />
            </label>
          )}

          {modo === "login" && (
            <button
              type="button"
              className="auth-esqueci"
              onClick={() =>
                recuperarSenha()
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
            disabled={carregando}
          >
            <span>
              {carregando
                ? "AGUARDE..."
                : modo === "login"
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