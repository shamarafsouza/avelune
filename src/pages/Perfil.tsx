import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import { supabase } from "../lib/supabase";
import "./Perfil.css";
import AveluneHeader from "../components/AveluneHeader";

type Pagina =
  | "inicio"
  | "biblioteca"
  | "comunidade"
  | "grupos"
  | "perfil"
  | "auth-login"
  | "auth-cadastro";

type PublicacaoPerfil = {
  id: number;
  texto: string;
  livro?: string;
  autor?: string;
  curtidas: number;
  comentarios: number;
  tempo: string;
  foto?: string;
  avaliacao?: number;
};

type PerfilProps = {
  onNavigate?: (pagina: Pagina) => void;
};

type PerfilSeguindo = {
  id: string;
  nome: string;
  username: string;
  avatar_url?: string | null;
};

type PerfilPublico = {
  id: string;
  nome: string;
  username: string;
  bio: string;
  avatar_url?: string | null;
  totalPublicacoes: number;
  totalSeguidores: number;
  totalSeguindo: number;
  seguindo: boolean;
};

type ProgressoLeitura = {
  paginaAtual?: number;
  totalPaginas?: number;
  percentual?: number;
};

function formatarTempoPerfil(data: string) {
  const diferenca = Math.max(0, Date.now() - new Date(data).getTime());
  const minutos = Math.floor(diferenca / 60000);

  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

function Perfil({ onNavigate }: PerfilProps) {
  const [aba, setAba] = useState<
    "publicacoes" | "estante" | "favoritos"
  >("publicacoes");

  const [publicacoes, setPublicacoes] = useState<
    PublicacaoPerfil[]
  >([]);

  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [queroLer, setQueroLer] = useState<string[]>([]);
  const [totalSeguidores, setTotalSeguidores] = useState(0);
  const [totalSeguindo, setTotalSeguindo] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [editando, setEditando] = useState(false);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [menuPublicacaoAberto, setMenuPublicacaoAberto] = useState<number | null>(null);
  const [janelaDetalhes, setJanelaDetalhes] = useState<"seguidores" | "seguindo" | "estante" | null>(null);
  const [pessoasSeguidoras, setPessoasSeguidoras] = useState<PerfilSeguindo[]>([]);
  const [pessoasSeguindo, setPessoasSeguindo] = useState<PerfilSeguindo[]>([]);
  const [perfilPublico, setPerfilPublico] = useState<PerfilPublico | null>(null);
  const [publicacoesPerfilPublico, setPublicacoesPerfilPublico] = useState<PublicacaoPerfil[]>([]);
  const [carregandoPerfilPublico, setCarregandoPerfilPublico] = useState(false);
  const [processandoSeguirPerfilPublico, setProcessandoSeguirPerfilPublico] = useState(false);
  const [progressoLeitura, setProgressoLeitura] = useState<Record<string, ProgressoLeitura>>({});

  const [nomePerfil, setNomePerfil] = useState("");
  const [usuarioPerfil, setUsuarioPerfil] = useState("");
  const [bioPerfil, setBioPerfil] = useState("");
  const [iniciaisPerfil, setIniciaisPerfil] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");

  const [nomeEditado, setNomeEditado] = useState("");
  const [usuarioEditado, setUsuarioEditado] = useState("");
  const [bioEditada, setBioEditada] = useState("");
  const [iniciaisEditadas, setIniciaisEditadas] = useState("");
  const [fotoPerfilEditada, setFotoPerfilEditada] = useState("");

  const inputGaleriaRef = useRef<HTMLInputElement>(null);
  const inputCameraRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    let ativo = true;

    async function carregarPerfilDoSupabase() {
      try {
        const { data: usuarioAuth, error: erroUsuario } =
          await supabase.auth.getUser();

        if (erroUsuario || !usuarioAuth.user || !ativo) {
          if (ativo) {
            setUsuarioLogado(false);
            setCarregandoSessao(false);
          }
          return;
        }

        setUsuarioLogado(true);
        setCarregandoSessao(false);

        const usuarioId = usuarioAuth.user.id;

        const [resultadoPublicacoes, resultadoSeguidores, resultadoSeguindo] =
          await Promise.all([
            supabase
              .from("publicacoes")
              .select(
                "id, texto, livro, autor_livro, avaliacao, foto_url, created_at"
              )
              .eq("usuario_id", usuarioId)
              .order("created_at", { ascending: false }),
            supabase
              .from("seguidores")
              .select("id", { count: "exact", head: true })
              .eq("seguido_id", usuarioId),
            supabase
              .from("seguidores")
              .select("id", { count: "exact", head: true })
              .eq("seguidor_id", usuarioId),
          ]);

        if (resultadoPublicacoes.error) {
          console.error(
            "Erro ao carregar publicações:",
            resultadoPublicacoes.error
          );
        }

        const publicacoesBanco =
          (resultadoPublicacoes.data ?? []) as {
            id: number;
            texto: string;
            livro: string | null;
            autor_livro: string | null;
            avaliacao: number | null;
            foto_url: string | null;
            created_at: string;
          }[];

        if (ativo) {
          setPublicacoes(
            publicacoesBanco.map((item) => ({
              id: item.id,
              texto: item.texto,
              livro: item.livro ?? undefined,
              autor: item.autor_livro ?? undefined,
              curtidas: 0,
              comentarios: 0,
              tempo: formatarTempoPerfil(item.created_at),
              foto: item.foto_url ?? undefined,
              avaliacao: item.avaliacao ?? undefined,
            }))
          );
          setTotalSeguidores(resultadoSeguidores.count ?? 0);
          setTotalSeguindo(resultadoSeguindo.count ?? 0);

          const [resultadoSeguidoresLista, resultadoSeguindoLista] = await Promise.all([
            supabase
              .from("seguidores")
              .select("seguidor_id")
              .eq("seguido_id", usuarioId),
            supabase
              .from("seguidores")
              .select("seguido_id")
              .eq("seguidor_id", usuarioId),
          ]);

          if (resultadoSeguidoresLista.error) {
            console.error("Erro ao carregar seguidores:", resultadoSeguidoresLista.error);
          } else {
            const idsSeguidores = (resultadoSeguidoresLista.data ?? []).map((item) => item.seguidor_id);
            if (idsSeguidores.length > 0) {
              const { data: perfisSeguidores, error: erroPerfisSeguidores } = await supabase
                .from("profiles")
                .select("id, nome, username, avatar_url")
                .in("id", idsSeguidores);

              if (erroPerfisSeguidores) {
                console.error("Erro ao carregar perfis dos seguidores:", erroPerfisSeguidores);
              } else if (ativo) {
                setPessoasSeguidoras((perfisSeguidores ?? []) as PerfilSeguindo[]);
              }
            } else if (ativo) {
              setPessoasSeguidoras([]);
            }
          }

          if (resultadoSeguindoLista.error) {
            console.error("Erro ao carregar pessoas seguidas:", resultadoSeguindoLista.error);
          } else {
            const idsSeguidos = (resultadoSeguindoLista.data ?? []).map((item) => item.seguido_id);
            if (idsSeguidos.length > 0) {
              const { data: perfisSeguidos, error: erroPerfisSeguidos } = await supabase
                .from("profiles")
                .select("id, nome, username, avatar_url")
                .in("id", idsSeguidos);

              if (erroPerfisSeguidos) {
                console.error("Erro ao carregar perfis seguidos:", erroPerfisSeguidos);
              } else if (ativo) {
                setPessoasSeguindo((perfisSeguidos ?? []) as PerfilSeguindo[]);
              }
            } else if (ativo) {
              setPessoasSeguindo([]);
            }
          }

          try {
            const progressoSalvo = localStorage.getItem("avelune-progresso-leitura");
            if (progressoSalvo) {
              const dadosProgresso = JSON.parse(progressoSalvo);
              if (dadosProgresso && typeof dadosProgresso === "object") {
                setProgressoLeitura(dadosProgresso);
              }
            }
          } catch {
            setProgressoLeitura({});
          }
        }

        const { data: perfil, error: erroPerfil } =
          await supabase
            .from("profiles")
            .select(
              "id, nome, username, email, bio, avatar_url"
            )
            .eq("id", usuarioAuth.user.id)
            .maybeSingle();

        if (erroPerfil) {
          console.error(
            "Erro ao carregar perfil:",
            erroPerfil
          );
          mostrarMensagem(
            "Não foi possível carregar seu perfil."
          );
          return;
        }

        if (perfil && ativo) {
          const nome =
            typeof perfil.nome === "string" &&
            perfil.nome.trim()
              ? perfil.nome.trim()
              : "Leitor";

          const username =
            typeof perfil.username === "string" &&
            perfil.username.trim()
              ? `@${perfil.username.replace(/^@+/, "")}`
              : "@leitor";

          const bio =
            typeof perfil.bio === "string" &&
            perfil.bio.trim()
              ? perfil.bio
              : "Entre páginas, mundos e histórias.\nSempre procurando o próximo livro que vai deixar uma marca.";

          const iniciais = nome
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 3)
            .map((parte) => parte[0])
            .join("")
            .toUpperCase() || "VC";

          setNomePerfil(nome);
          setNomeEditado(nome);
          setUsuarioPerfil(username);
          setUsuarioEditado(username);
          setBioPerfil(bio);
          setBioEditada(bio);
          setIniciaisPerfil(iniciais);
          setIniciaisEditadas(iniciais);

          if (
            typeof perfil.avatar_url === "string" &&
            perfil.avatar_url.trim()
          ) {
            setFotoPerfil(perfil.avatar_url);
            setFotoPerfilEditada(perfil.avatar_url);
          } else {
            try {
              const perfilLocal = localStorage.getItem(
                "avelune-perfil"
              );
              if (perfilLocal) {
                const dadosLocais = JSON.parse(perfilLocal);
                if (
                  dadosLocais &&
                  typeof dadosLocais.foto === "string"
                ) {
                  setFotoPerfil(dadosLocais.foto);
                  setFotoPerfilEditada(dadosLocais.foto);
                }
              }
            } catch {
              // A foto local é apenas um fallback visual.
            }
          }

          try {
            localStorage.setItem(
              "avelune-perfil",
              JSON.stringify({
                nome,
                usuario: username,
                bio,
                iniciais,
                foto: perfil.avatar_url ?? "",
              })
            );
          } catch {
            // O Supabase continua sendo a fonte principal.
          }
        }
      } catch (erroDesconhecido) {
        console.error(
          "Erro inesperado ao carregar perfil:",
          erroDesconhecido
        );
      }

      try {
        const favoritosSalvos = localStorage.getItem(
          "avelune-favoritos"
        );
        const queroLerSalvos = localStorage.getItem(
          "avelune-quero-ler"
        );

        if (favoritosSalvos) {
          const dados = JSON.parse(favoritosSalvos);

          if (Array.isArray(dados)) {
            setFavoritos(dados);
          }
        }

        if (queroLerSalvos) {
          const dados = JSON.parse(queroLerSalvos);

          if (Array.isArray(dados)) {
            setQueroLer(dados);
          }
        }
      } catch {
        setFavoritos([]);
        setQueroLer([]);
      }
    }

    void carregarPerfilDoSupabase();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!mensagem) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMensagem("");
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [mensagem]);

  const nome = nomePerfil;
  const usuario = usuarioPerfil;
  const iniciais = iniciaisPerfil;

  const livrosNaEstante = useMemo(
    () => queroLer,
    [queroLer]
  );

  const livrosFavoritos = useMemo(
    () => favoritos,
    [favoritos]
  );

  function navegar(pagina: Pagina) {
    onNavigate?.(pagina);
  }

  function mostrarMensagem(texto: string) {
    setMensagem(texto);
  }

  function formatarNomeLivro(item: string) {
    if (typeof item !== "string") {
      return "Livro";
    }

    return item;
  }

  async function selecionarFotoPerfil(
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = evento.target.files?.[0];

    if (!arquivo) {
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
      mostrarMensagem(
        "Escolha uma imagem válida para o perfil."
      );
      return;
    }

    if (arquivo.size > 8 * 1024 * 1024) {
      mostrarMensagem(
        "A foto precisa ter no máximo 8 MB."
      );
      return;
    }

    try {
      const foto = await redimensionarFotoPerfil(
        arquivo
      );

      setFotoPerfilEditada(foto);
    } catch {
      mostrarMensagem(
        "Não foi possível carregar essa foto."
      );
    }

    evento.target.value = "";
  }

  function removerFotoPerfil() {
    setFotoPerfilEditada("");
  }

  function redimensionarFotoPerfil(
    arquivo: File
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();

      leitor.onload = () => {
        const imagem = new Image();

        imagem.onload = () => {
          const tamanho = 800;
          const menorLado = Math.min(
            imagem.width,
            imagem.height
          );

          const inicioX =
            (imagem.width - menorLado) / 2;
          const inicioY =
            (imagem.height - menorLado) / 2;

          const canvas =
            document.createElement("canvas");

          canvas.width = tamanho;
          canvas.height = tamanho;

          const contexto =
            canvas.getContext("2d");

          if (!contexto) {
            reject(
              new Error(
                "Não foi possível preparar a foto."
              )
            );
            return;
          }

          contexto.drawImage(
            imagem,
            inicioX,
            inicioY,
            menorLado,
            menorLado,
            0,
            0,
            tamanho,
            tamanho
          );

          resolve(
            canvas.toDataURL(
              "image/jpeg",
              0.84
            )
          );
        };

        imagem.onerror = () =>
          reject(
            new Error("Imagem inválida.")
          );

        imagem.src = String(leitor.result);
      };

      leitor.onerror = () =>
        reject(
          new Error(
            "Não foi possível ler a imagem."
          )
        );

      leitor.readAsDataURL(arquivo);
    });
  }

  async function excluirPublicacao(publicacao: PublicacaoPerfil) {
    const { data: usuarioAuth, error: erroUsuario } =
      await supabase.auth.getUser();

    if (erroUsuario || !usuarioAuth.user) {
      mostrarMensagem("Sua sessão expirou. Entre novamente.");
      return;
    }

    if (!window.confirm("Deseja excluir esta publicação? Essa ação não pode ser desfeita.")) {
      return;
    }

    const { error } = await supabase
      .from("publicacoes")
      .delete()
      .eq("id", publicacao.id)
      .eq("usuario_id", usuarioAuth.user.id);

    if (error) {
      console.error("Erro ao excluir publicação:", error);
      mostrarMensagem("Não foi possível excluir a publicação.");
      return;
    }

    setPublicacoes((atuais) =>
      atuais.filter((item) => item.id !== publicacao.id)
    );
    setMenuPublicacaoAberto(null);
    mostrarMensagem("Publicação excluída com sucesso.");
  }

  async function abrirPerfilPublico(id: string) {
    setJanelaDetalhes(null);
    setCarregandoPerfilPublico(true);
    setPerfilPublico(null);
    setPublicacoesPerfilPublico([]);

    try {
      const { data: usuarioAtual } = await supabase.auth.getUser();

      const [resultadoPerfil, resultadoPublicacoes, resultadoSeguidores, resultadoSeguindo] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, nome, username, bio, avatar_url")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("publicacoes")
          .select("id, texto, livro, autor_livro, avaliacao, foto_url, curtidas, comentarios, created_at")
          .eq("usuario_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("seguidores")
          .select("id", { count: "exact", head: true })
          .eq("seguido_id", id),
        supabase
          .from("seguidores")
          .select("id", { count: "exact", head: true })
          .eq("seguidor_id", id),
      ]);

      if (resultadoPerfil.error || !resultadoPerfil.data) {
        console.error("Erro ao carregar perfil público:", resultadoPerfil.error);
        mostrarMensagem("Não foi possível abrir este perfil.");
        return;
      }

      const seguindoAtual = usuarioAtual.user
        ? await supabase
            .from("seguidores")
            .select("id")
            .eq("seguidor_id", usuarioAtual.user.id)
            .eq("seguido_id", id)
            .maybeSingle()
        : { data: null };

      const perfilBanco = resultadoPerfil.data;
      const publicacoesBanco = resultadoPublicacoes.data ?? [];

      setPerfilPublico({
        id: perfilBanco.id,
        nome: perfilBanco.nome?.trim() || "Leitor",
        username: perfilBanco.username?.trim() || "@leitor",
        bio: perfilBanco.bio?.trim() || "Entre páginas, mundos e histórias.",
        avatar_url: perfilBanco.avatar_url,
        totalPublicacoes: publicacoesBanco.length,
        totalSeguidores: resultadoSeguidores.count ?? 0,
        totalSeguindo: resultadoSeguindo.count ?? 0,
        seguindo: Boolean(seguindoAtual.data),
      });

      setPublicacoesPerfilPublico(
        publicacoesBanco.map((item) => ({
          id: item.id,
          texto: item.texto,
          livro: item.livro ?? undefined,
          autor: item.autor_livro ?? undefined,
          curtidas: item.curtidas ?? 0,
          comentarios: item.comentarios ?? 0,
          tempo: formatarTempoPerfil(item.created_at),
          foto: item.foto_url ?? undefined,
          avaliacao: item.avaliacao ?? undefined,
        }))
      );
    } catch (erro) {
      console.error("Erro ao abrir perfil público:", erro);
      mostrarMensagem("Não foi possível abrir este perfil.");
    } finally {
      setCarregandoPerfilPublico(false);
    }
  }

  async function alternarSeguirPerfilPublico() {
    if (!perfilPublico || processandoSeguirPerfilPublico) return;

    const { data: usuarioAtual } = await supabase.auth.getUser();
    if (!usuarioAtual.user || usuarioAtual.user.id === perfilPublico.id) return;

    setProcessandoSeguirPerfilPublico(true);

    try {
      if (perfilPublico.seguindo) {
        const { error } = await supabase
          .from("seguidores")
          .delete()
          .eq("seguidor_id", usuarioAtual.user.id)
          .eq("seguido_id", perfilPublico.id);

        if (error) {
          mostrarMensagem("Não foi possível deixar de seguir.");
          return;
        }

        setPerfilPublico((atual) =>
          atual
            ? { ...atual, seguindo: false, totalSeguidores: Math.max(0, atual.totalSeguidores - 1) }
            : atual
        );
      } else {
        const { error } = await supabase
          .from("seguidores")
          .insert({
            seguidor_id: usuarioAtual.user.id,
            seguido_id: perfilPublico.id,
          });

        if (error) {
          mostrarMensagem("Não foi possível seguir esta pessoa.");
          return;
        }

        setPerfilPublico((atual) =>
          atual
            ? { ...atual, seguindo: true, totalSeguidores: atual.totalSeguidores + 1 }
            : atual
        );
      }
    } finally {
      setProcessandoSeguirPerfilPublico(false);
    }
  }

  function abrirEdicaoPerfil() {
    setNomeEditado(nomePerfil);
    setUsuarioEditado(usuarioPerfil);
    setBioEditada(bioPerfil);
    setIniciaisEditadas(iniciaisPerfil);
    setFotoPerfilEditada(fotoPerfil);
    setEditando(true);
  }

  if (carregandoSessao) {
    return (
      <main className="perfil perfil-acesso">
        <AveluneHeader
          paginaAtual="perfil"
          onNavigate={(pagina) => onNavigate?.(pagina)}
        />
      </main>
    );
  }

  if (!usuarioLogado) {
    return (
      <main className="perfil perfil-acesso">
        <AveluneHeader
          paginaAtual="perfil"
          onNavigate={(pagina) => onNavigate?.(pagina)}
        />

        <section className="perfil-acesso-conteudo">
          <span className="perfil-acesso-simbolo">✦</span>
          <p className="perfil-kicker">SUA JORNADA EM AVELUNE</p>
          <h1>Entre para acessar seu perfil</h1>
          <p>
            Faça login ou crie sua conta para salvar livros,
            acompanhar suas leituras e compartilhar suas histórias.
          </p>

          <div className="perfil-acesso-acoes">
            <button
              type="button"
              onClick={() => onNavigate?.("auth-login")}
            >
              Entrar
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.("auth-cadastro")}
            >
              Criar minha conta
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="perfil">
      <AveluneHeader
        paginaAtual="perfil"
        onNavigate={(pagina) => onNavigate?.(pagina)}
      />

      <div className="perfil-conteudo">
        <section className="perfil-cabecalho">
          <div
            className={`perfil-avatar-grande ${
              fotoPerfil
                ? "perfil-avatar-grande--foto"
                : ""
            }`}
          >
            {fotoPerfil ? (
              <img
                src={fotoPerfil}
                alt={`Foto de perfil de ${nome}`}
              />
            ) : (
              <span>{iniciais}</span>
            )}
          </div>

          <div className="perfil-identidade">
            <div className="perfil-nome-linha">
              <div>
                <p className="perfil-kicker">
                  LEITOR DE AVELUNE
                </p>
                <h1>{nome}</h1>
                <p className="perfil-usuario">{usuario}</p>
              </div>

              <div className="perfil-botoes">
                <button
                  type="button"
                  className="perfil-editar"
                  onClick={abrirEdicaoPerfil}
                >
                  Editar perfil
                </button>

                <button
                  type="button"
                  className="perfil-sair"
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut();

                    if (error) {
                      mostrarMensagem("Não foi possível sair da conta.");
                      return;
                    }

                    onNavigate?.("inicio");
                  }}
                >
                  Sair
                </button>
              </div>
            </div>

            <p className="perfil-bio">
              {bioPerfil.split("\n").map((linha, indice) => (
                <span key={`${linha}-${indice}`}>
                  {linha}
                  {indice < bioPerfil.split("\n").length - 1 && (
                    <br />
                  )}
                </span>
              ))}
            </p>

            <div className="perfil-estatisticas">
              <button type="button" className="perfil-estatistica" onClick={() => setAba("publicacoes")}>
                <strong>{publicacoes.length}</strong>
                <span>publicações</span>
              </button>

              <button type="button" className="perfil-estatistica" onClick={() => setJanelaDetalhes("seguidores")}>
                <strong>{totalSeguidores}</strong>
                <span>seguidores</span>
              </button>

              <button type="button" className="perfil-estatistica" onClick={() => setJanelaDetalhes("seguindo")}>
                <strong>{totalSeguindo}</strong>
                <span>seguindo</span>
              </button>

              <button type="button" className="perfil-estatistica" onClick={() => setJanelaDetalhes("estante")}>
                <strong>{livrosNaEstante.length}</strong>
                <span>na estante</span>
              </button>
            </div>

            {publicacoes.length === 0 &&
              totalSeguidores === 0 &&
              totalSeguindo === 0 &&
              livrosNaEstante.length === 0 && (
                <p className="perfil-estatisticas-convite">
                  Sua jornada em Avelune está apenas começando.
                  Explore a biblioteca, siga outros leitores e
                  compartilhe sua primeira leitura.
                </p>
              )}
          </div>
        </section>

        <div className="perfil-divisor">
          <span />
          <strong>✦</strong>
          <span />
        </div>

        <section className="perfil-painel">
          <div className="perfil-abas">
            <button
              type="button"
              className={
                aba === "publicacoes"
                  ? "perfil-aba perfil-aba--ativa"
                  : "perfil-aba"
              }
              onClick={() => setAba("publicacoes")}
            >
              Publicações
            </button>

            <button
              type="button"
              className={
                aba === "estante"
                  ? "perfil-aba perfil-aba--ativa"
                  : "perfil-aba"
              }
              onClick={() => setAba("estante")}
            >
              Minha estante
              <span>{livrosNaEstante.length}</span>
            </button>

            <button
              type="button"
              className={
                aba === "favoritos"
                  ? "perfil-aba perfil-aba--ativa"
                  : "perfil-aba"
              }
              onClick={() => setAba("favoritos")}
            >
              Favoritos
              <span>{livrosFavoritos.length}</span>
            </button>
          </div>

          {aba === "publicacoes" && (
            <div className="perfil-feed">
              {publicacoes.length === 0 ? (
                <div className="perfil-vazio">
                  <span>✦</span>
                  <h2>Nenhuma publicação ainda</h2>
                  <p>
                    Compartilhe uma leitura ou uma
                    ideia com a comunidade.
                  </p>
                  <button
                    type="button"
                    onClick={() => navegar("comunidade")}
                  >
                    Ir para a comunidade
                  </button>
                </div>
              ) : (
                publicacoes.map((publicacao) => (
                  <article
                    className="perfil-publicacao"
                    key={publicacao.id}
                  >
                    <div className="perfil-publicacao-topo">
                      <div
                        className={`perfil-avatar-post ${
                          fotoPerfil
                            ? "perfil-avatar-post--foto"
                            : ""
                        }`}
                      >
                        {fotoPerfil ? (
                          <img
                            src={fotoPerfil}
                            alt=""
                          />
                        ) : (
                          iniciais
                        )}
                      </div>

                      <div>
                        <strong>{nome}</strong>
                        <span>{publicacao.tempo}</span>
                      </div>

                      <div className="perfil-menu-wrapper">
                        <button
                          type="button"
                          className="perfil-menu"
                          onClick={() =>
                            setMenuPublicacaoAberto((atual) =>
                              atual === publicacao.id ? null : publicacao.id
                            )
                          }
                          aria-label="Mais opções"
                          aria-expanded={menuPublicacaoAberto === publicacao.id}
                        >
                          •••
                        </button>

                        {menuPublicacaoAberto === publicacao.id && (
                          <div className="perfil-menu-dropdown">
                            <button
                              type="button"
                              onClick={() => {
                                mostrarMensagem(
                                  "A edição de publicações será disponibilizada em breve."
                                );
                                setMenuPublicacaoAberto(null);
                              }}
                            >
                              ✎ Editar
                            </button>
                            <button
                              type="button"
                              className="perigo"
                              onClick={() => excluirPublicacao(publicacao)}
                            >
                              🗑 Excluir publicação
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="perfil-publicacao-texto">
                      {publicacao.texto}
                    </p>

                    {publicacao.foto && (
                      <div className="perfil-publicacao-foto">
                        <img
                          src={publicacao.foto}
                          alt="Foto da publicação"
                        />
                      </div>
                    )}

                    {publicacao.livro && (
                      <button
                        type="button"
                        className="perfil-livro"
                        onClick={() => navegar("biblioteca")}
                      >
                        <div className="perfil-livro-capa">
                          ✦
                        </div>

                        <div>
                          <strong>
                            {publicacao.livro}
                          </strong>
                          <span>
                            {publicacao.autor ||
                              "Autor desconhecido"}
                          </span>
                        </div>

                        <span className="perfil-livro-seta">
                          →
                        </span>
                      </button>
                    )}

                    <div className="perfil-interacoes">
                      <span>♡ {publicacao.curtidas}</span>
                      <span>
                        ◌ {publicacao.comentarios}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {aba === "estante" && (
            <div className="perfil-livros">
              {livrosNaEstante.length === 0 ? (
                <div className="perfil-vazio">
                  <span>☾</span>
                  <h2>Sua estante está vazia</h2>
                  <p>
                    Adicione livros que você quer ler
                    pela Biblioteca.
                  </p>
                  <button
                    type="button"
                    onClick={() => navegar("biblioteca")}
                  >
                    Explorar livros
                  </button>
                </div>
              ) : (
                <div className="perfil-grade-livros">
                  {livrosNaEstante.map((livro) => (
                    <button
                      type="button"
                      className="perfil-card-livro"
                      key={livro}
                      onClick={() => navegar("biblioteca")}
                    >
                      <div className="perfil-capa">
                        <span>✦</span>
                      </div>
                      <strong>
                        {formatarNomeLivro(livro)}
                      </strong>
                      <span>Na minha estante</span>
                      <span className="perfil-progresso-texto">
                        {progressoLeitura[livro]?.percentual ?? 0}% lido
                      </span>
                      <span className="perfil-progresso-barra">
                        <span
                          style={{
                            width: `${Math.min(100, Math.max(0, progressoLeitura[livro]?.percentual ?? 0))}%`,
                          }}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {aba === "favoritos" && (
            <div className="perfil-livros">
              {livrosFavoritos.length === 0 ? (
                <div className="perfil-vazio">
                  <span>♡</span>
                  <h2>Você ainda não tem favoritos</h2>
                  <p>
                    Salve seus livros preferidos na
                    Biblioteca.
                  </p>
                  <button
                    type="button"
                    onClick={() => navegar("biblioteca")}
                  >
                    Ver biblioteca
                  </button>
                </div>
              ) : (
                <div className="perfil-grade-livros">
                  {livrosFavoritos.map((livro) => (
                    <button
                      type="button"
                      className="perfil-card-livro"
                      key={livro}
                      onClick={() => navegar("biblioteca")}
                    >
                      <div className="perfil-capa perfil-capa--favorito">
                        <span>♡</span>
                      </div>
                      <strong>
                        {formatarNomeLivro(livro)}
                      </strong>
                      <span>Favorito</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {editando && (
        <div
          className="perfil-modal-fundo"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              setEditando(false);
            }
          }}
        >
          <section
            className="perfil-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="perfil-modal-titulo"
          >
            <div className="perfil-modal-topo">
              <div>
                <p className="perfil-kicker">
                  SUA CONTA
                </p>
                <h2 id="perfil-modal-titulo">
                  Editar perfil
                </h2>
              </div>

              <button
                type="button"
                className="perfil-modal-fechar"
                onClick={() => setEditando(false)}
                aria-label="Fechar edição"
              >
                ×
              </button>
            </div>

            <div className="perfil-modal-avatar-area">
              <div
                className={`perfil-avatar-edicao ${
                  fotoPerfilEditada
                    ? "perfil-avatar-edicao--foto"
                    : ""
                }`}
              >
                {fotoPerfilEditada ? (
                  <img
                    src={fotoPerfilEditada}
                    alt="Prévia da foto de perfil"
                  />
                ) : (
                  iniciaisEditadas || "VC"
                )}
              </div>

              <div className="perfil-foto-controles">
                <strong>Foto de perfil</strong>
                <span>
                  Escolha uma foto da galeria ou use a câmera.
                </span>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      inputGaleriaRef.current?.click()
                    }
                  >
                    GALERIA
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      inputCameraRef.current?.click()
                    }
                  >
                    CÂMERA
                  </button>

                  {fotoPerfilEditada && (
                    <button
                      type="button"
                      className="perfil-remover-foto"
                      onClick={removerFotoPerfil}
                    >
                      REMOVER
                    </button>
                  )}
                </div>

                <input
                  ref={inputGaleriaRef}
                  type="file"
                  accept="image/*"
                  onChange={selecionarFotoPerfil}
                  hidden
                />

                <input
                  ref={inputCameraRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={selecionarFotoPerfil}
                  hidden
                />
              </div>
            </div>

            <label className="perfil-campo">
              <span>Nome</span>
              <input
                value={nomeEditado}
                maxLength={40}
                onChange={(evento) =>
                  setNomeEditado(evento.target.value)
                }
                placeholder="Como você quer ser chamado?"
              />
            </label>

            <label className="perfil-campo">
              <span>Nome de usuário</span>
              <input
                value={usuarioEditado}
                maxLength={30}
                onChange={(evento) =>
                  setUsuarioEditado(evento.target.value)
                }
                placeholder="@seuusuario"
              />
            </label>

            <label className="perfil-campo">
              <span>Iniciais do avatar</span>
              <input
                value={iniciaisEditadas}
                maxLength={3}
                onChange={(evento) =>
                  setIniciaisEditadas(
                    evento.target.value
                      .replace(/[^a-zA-ZÀ-ÿ]/g, "")
                      .slice(0, 3)
                      .toUpperCase()
                  )
                }
                placeholder="VC"
              />
            </label>

            <label className="perfil-campo">
              <span>Bio</span>
              <textarea
                value={bioEditada}
                maxLength={180}
                rows={4}
                onChange={(evento) =>
                  setBioEditada(evento.target.value)
                }
                placeholder="Conte um pouco sobre você..."
              />
              <small>
                {bioEditada.length}/180
              </small>
            </label>

            <div className="perfil-modal-acoes">
              <button
                type="button"
                className="perfil-modal-cancelar"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="perfil-modal-salvar"
                onClick={async () => {
                 const nomeFinal = nomeEditado.trim();

let usuarioFinal = usuarioEditado.trim();

if (!nomeFinal || !usuarioFinal) {
  setMensagem("Preencha seu nome e usuário.");
  return;
}

if (!usuarioFinal.startsWith("@")) {
  usuarioFinal = `@${usuarioFinal}`;
}

const bioFinal = bioEditada.trim();

const iniciaisFinal =
  iniciaisEditadas.trim() ||
  nomeFinal
    .split(/\s+/)
    .map((parte) => parte[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

                  try {
                    const { data: usuarioAuth, error: erroUsuario } =
                      await supabase.auth.getUser();

                    if (erroUsuario || !usuarioAuth.user) {
                      mostrarMensagem(
                        "Sua sessão expirou. Entre novamente no Avelune."
                      );
                      return;
                    }

                    const usernameBanco = usuarioFinal
                      .replace(/^@+/, "")
                      .trim()
                      .toLowerCase();

                    if (!usernameBanco) {
                      mostrarMensagem(
                        "Escolha um nome de usuário válido."
                      );
                      return;
                    }

                    if (!/^[a-z0-9._-]+$/.test(usernameBanco)) {
                      mostrarMensagem(
                        "O nome de usuário pode usar apenas letras, números, ponto, hífen e sublinhado."
                      );
                      return;
                    }

                    const { data: perfilSalvo, error: erroAtualizacao } =
                      await supabase
                        .from("profiles")
                        .update({
                          nome: nomeFinal,
                          username: usernameBanco,
                          bio: bioFinal,
                        })
                        .eq("id", usuarioAuth.user.id)
                        .select("nome, username, bio")
                        .maybeSingle();

                    if (erroAtualizacao) {
                      if (
                        erroAtualizacao.code === "23505" ||
                        erroAtualizacao.message
                          .toLowerCase()
                          .includes("duplicate")
                      ) {
                        mostrarMensagem(
                          "Esse nome de usuário já está em uso."
                        );
                      } else {
                        console.error(
                          "Erro ao atualizar perfil:",
                          erroAtualizacao
                        );
                        mostrarMensagem(
                          "Não foi possível salvar seu perfil."
                        );
                      }
                      return;
                    }

                    if (!perfilSalvo) {
                      console.error(
                        "O perfil não foi retornado após a atualização."
                      );
                      mostrarMensagem(
                        "Nenhuma alteração foi gravada. Tente novamente."
                      );
                      return;
                    }

                    const perfilAtualizado = {
                      nome: nomeFinal,
                      usuario: `@${usernameBanco}`,
                      bio: bioFinal,
                      iniciais: iniciaisFinal,
                      foto: fotoPerfilEditada,
                    };

                    try {
                      localStorage.setItem(
                        "avelune-perfil",
                        JSON.stringify(perfilAtualizado)
                      );
                    } catch {
                      // O Supabase continua sendo a fonte principal.
                    }

                    setNomePerfil(nomeFinal);
                    setUsuarioPerfil(`@${usernameBanco}`);
                    setBioPerfil(bioFinal);
                    setIniciaisPerfil(iniciaisFinal);
                    setFotoPerfil(fotoPerfilEditada);
                    setEditando(false);
                    mostrarMensagem(
                      "Perfil atualizado com sucesso."
                    );
                  } catch (erroDesconhecido) {
                    console.error(
                      "Erro inesperado ao salvar perfil:",
                      erroDesconhecido
                    );
                    mostrarMensagem(
                      "Não foi possível salvar seu perfil."
                    );
                  }
                }}
              >
                Salvar alterações
              </button>
            </div>
          </section>
        </div>
      )}

      {perfilPublico && (
        <div
          className="perfil-modal-fundo perfil-modal-fundo-publico"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              setPerfilPublico(null);
            }
          }}
        >
          <section className="perfil-modal perfil-modal-publico" role="dialog" aria-modal="true">
            <div className="perfil-modal-topo">
              <div>
                <p className="perfil-kicker">PERFIL PÚBLICO</p>
                <h2>Perfil de {perfilPublico.nome}</h2>
              </div>
              <button type="button" className="perfil-modal-fechar" onClick={() => setPerfilPublico(null)} aria-label="Fechar perfil público">
                ×
              </button>
            </div>

            {carregandoPerfilPublico ? (
              <p className="perfil-detalhes-vazio">Carregando perfil...</p>
            ) : (
              <>
                <div className="perfil-publico-cabecalho">
                  <div className={`perfil-avatar-grande ${perfilPublico.avatar_url ? "perfil-avatar-grande--foto" : ""}`}>
                    {perfilPublico.avatar_url ? (
                      <img src={perfilPublico.avatar_url} alt={`Foto de perfil de ${perfilPublico.nome}`} />
                    ) : (
                      <span>{perfilPublico.nome.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="perfil-publico-identidade">
                    <h3>{perfilPublico.nome}</h3>
                    <p className="perfil-usuario">{perfilPublico.username.startsWith("@") ? perfilPublico.username : `@${perfilPublico.username}`}</p>
                    <p className="perfil-publico-bio">{perfilPublico.bio}</p>

                    <div className="perfil-publico-estatisticas">
                      <span><strong>{perfilPublico.totalPublicacoes}</strong> publicações</span>
                      <span><strong>{perfilPublico.totalSeguidores}</strong> seguidores</span>
                      <span><strong>{perfilPublico.totalSeguindo}</strong> seguindo</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`perfil-publico-seguir ${perfilPublico.seguindo ? "ativo" : ""}`}
                    onClick={() => void alternarSeguirPerfilPublico()}
                    disabled={processandoSeguirPerfilPublico}
                  >
                    {processandoSeguirPerfilPublico ? "..." : perfilPublico.seguindo ? "Seguindo" : "Seguir"}
                  </button>
                </div>

                <div className="perfil-publico-separador" />

                <div className="perfil-publico-publicacoes">
                  <div className="perfil-publico-publicacoes-topo">
                    <p className="perfil-kicker">PUBLICAÇÕES</p>
                    <span>{publicacoesPerfilPublico.length}</span>
                  </div>

                  {publicacoesPerfilPublico.length === 0 ? (
                    <p className="perfil-detalhes-vazio">Esta pessoa ainda não publicou nada.</p>
                  ) : (
                    publicacoesPerfilPublico.map((publicacao) => (
                      <article className="perfil-publico-publicacao" key={publicacao.id}>
                        <div className="perfil-publico-publicacao-topo">
                          <strong>{perfilPublico.nome}</strong>
                          <span>{publicacao.tempo}</span>
                        </div>

                        <p>{publicacao.texto}</p>

                        {publicacao.foto && (
                          <img
                            className="perfil-publico-publicacao-foto"
                            src={publicacao.foto}
                            alt="Imagem da publicação"
                          />
                        )}

                        {publicacao.livro && (
                          <div className="perfil-publico-publicacao-livro">
                            <strong>{publicacao.livro}</strong>
                            {publicacao.autor && <span>{publicacao.autor}</span>}
                            {publicacao.avaliacao && (
                              <span>{"★".repeat(Math.max(0, Math.min(5, publicacao.avaliacao)))}{"☆".repeat(5 - Math.max(0, Math.min(5, publicacao.avaliacao)))}</span>
                            )}
                          </div>
                        )}

                        <div className="perfil-publico-publicacao-interacoes">
                          <span>♡ {publicacao.curtidas}</span>
                          <span>◌ {publicacao.comentarios}</span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {janelaDetalhes && (
        <div
          className="perfil-modal-fundo"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              setJanelaDetalhes(null);
            }
          }}
        >
          <section className="perfil-modal perfil-modal-detalhes" role="dialog" aria-modal="true">
            <div className="perfil-modal-topo">
              <div>
                <p className="perfil-kicker">SUA JORNADA</p>
                <h2>{janelaDetalhes === "seguidores" ? "Pessoas que seguem você" : janelaDetalhes === "seguindo" ? "Pessoas que você segue" : "Minha estante"}</h2>
              </div>
              <button type="button" className="perfil-modal-fechar" onClick={() => setJanelaDetalhes(null)} aria-label="Fechar">
                ×
              </button>
            </div>

            {janelaDetalhes === "seguidores" || janelaDetalhes === "seguindo" ? (
              (janelaDetalhes === "seguidores" ? pessoasSeguidoras : pessoasSeguindo).length === 0 ? (
                <p className="perfil-detalhes-vazio">
                  {janelaDetalhes === "seguidores" ? "Ninguém segue você ainda." : "Você ainda não segue ninguém."}
                </p>
              ) : (
                <div className="perfil-lista-pessoas">
                  {(janelaDetalhes === "seguidores" ? pessoasSeguidoras : pessoasSeguindo).map((pessoa) => (
                    <button
                      type="button"
                      className="perfil-pessoa-item"
                      key={pessoa.id}
                      onClick={() => void abrirPerfilPublico(pessoa.id)}
                    >
                      <span className="perfil-avatar-post">
                        {pessoa.avatar_url ? <img src={pessoa.avatar_url} alt="" /> : "✦"}
                      </span>
                      <span className="perfil-pessoa-dados">
                        <strong>{pessoa.nome || "Leitor"}</strong>
                        <span>@{(pessoa.username || "leitor").replace(/^@+/, "")}</span>
                      </span>
                      <span className="perfil-pessoa-seta" aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              )
            ) : (
              livrosNaEstante.length === 0 ? (
                <p className="perfil-detalhes-vazio">Sua estante está vazia.</p>
              ) : (
                <div className="perfil-detalhes-estante">
                  {livrosNaEstante.map((livro) => {
                    const percentual = Math.min(100, Math.max(0, progressoLeitura[livro]?.percentual ?? 0));
                    return (
                      <div className="perfil-detalhe-livro" key={livro}>
                        <div>
                          <strong>{formatarNomeLivro(livro)}</strong>
                          <span>{percentual}% concluído</span>
                        </div>
                        <div className="perfil-progresso-barra">
                          <span style={{ width: `${percentual}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </section>
        </div>
      )}

      <footer className="perfil-rodape">
        <div>
          <strong>AVELUNE</strong>
          <span>
            Onde cada história encontra seu leitor.
          </span>
        </div>

        <span>✦</span>

        <p>© 2026 Avelune</p>
      </footer>

      {mensagem && (
        <div className="perfil-toast" role="status">
          {mensagem}
        </div>
      )}
    </main>
  );
}

export default Perfil;
