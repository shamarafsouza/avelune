import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import { supabase } from "../lib/supabase";
import "./Perfil.css";

type Pagina =
  | "inicio"
  | "biblioteca"
  | "explorar"
  | "comunidade"
  | "perfil"
  | "auth-cadastro"
  | "auth-login";

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

  type StatusLeitura = "quero-ler" | "lendo" | "lido";

  type Leitura = {
    titulo: string;
    autor: string;
    genero: string;
    status: StatusLeitura;
    paginaAtual: number;
    totalPaginas: number;
    dataInicio?: string;
    dataFim?: string;
    emocional?: boolean;
  };

  const LIVROS_AVELUNE = [
    ["GÊNESIS | \"JUDAS\" PELOS OLHOS DELE", "Larissa Abreu", "Romance"],
    ["Judas (Volume 1)", "Larissa Abreu", "Romance"],
    ["A Hipótese do Amor: Capítulo Extra", "Ali Hazelwood", "Romance"],
    ["OBLÍVIO", "Leonor Carvalho", "Romance"],
    ["VULTUS", "Leonor Carvalho", "Romance"],
    ["INCIPIT", "Leonor Carvalho", "Romance"],
    ["EXÍMIO — ROSTOS VAZIOS — LIVRO 3", "Leonor Carvalho", "Romance"],
    ["O Acordo", "Elle Kennedy", "Romance"],
    ["O Erro", "Elle Kennedy", "Romance"],
    ["O Jogo", "Elle Kennedy", "Romance"],
    ["Box - Amores Improváveis (Nova Edição)", "Elle Kennedy", "Romance"],
    ["INDOMÁVEL", "Zoe X", "Dark Romance"],
    ["INCONSEQUENTE", "Zoe X", "Dark Romance"],
    ["IMPROVÁVEL", "Zoe X", "Dark Romance"],
    ["INVULNERÁVEL", "Zoe X", "Dark Romance"],
    ["IMORAL", "Zoe X", "Dark Romance"],
    ["BAD PRINCE", "Zoe X", "Dark Romance"],
    ["UNDER YOUR SKIN", "Zoe X", "Dark Romance"],
    ["BAILANDO NO INFERNO", "Zoe X", "Dark Romance"],
    ["Maldição de Amor", "Zoe X", "Romance"],
    ["A Corte das Sombras", "Elena Beaumont", "Fantasia"],
    ["O Jardim das Estrelas", "Clara Whitmore", "Fantasia"],
    ["Entre Mundos", "Adrian Blackwood", "Fantasia"],
    ["A Última Lua", "Victoria Ashford", "Romance"],
    ["O Reino Esquecido", "Arthur Evernight", "Fantasia"],
    ["Cartas Para a Lua", "Isabelle Laurent", "Romance"],
    ["A Casa das Chaves", "Nathaniel Crow", "Mistério"],
    ["Depois do Crepúsculo", "Evelyn Rose", "Romance"],
  ] as const;

  const STORAGE_LEITURAS = "avelune-leituras";
  const STORAGE_META = "avelune-meta-leitura";

  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [metaAnual, setMetaAnual] = useState(24);
  const [mostrarLeituraForm, setMostrarLeituraForm] = useState(false);
  const [livroSelecionadoLeitura, setLivroSelecionadoLeitura] = useState("");
  const [statusEdicao, setStatusEdicao] = useState<StatusLeitura>("lendo");
  const [paginaAtualEdicao, setPaginaAtualEdicao] = useState(0);
  const [totalPaginasEdicao, setTotalPaginasEdicao] = useState(0);
  const [emocionalEdicao, setEmocionalEdicao] = useState(false);

  const [nomePerfil, setNomePerfil] = useState("Você");
  const [usuarioPerfil, setUsuarioPerfil] =
    useState("@aventureiro");
  const [bioPerfil, setBioPerfil] = useState(
    "Entre páginas, mundos e histórias.\nSempre procurando o próximo livro que vai deixar uma marca."
  );
  const [iniciaisPerfil, setIniciaisPerfil] =
    useState("VC");

  const [nomeEditado, setNomeEditado] =
    useState("Você");
  const [usuarioEditado, setUsuarioEditado] =
    useState("@aventureiro");
  const [bioEditada, setBioEditada] = useState(
    "Entre páginas, mundos e histórias.\nSempre procurando o próximo livro que vai deixar uma marca."
  );
  const [iniciaisEditadas, setIniciaisEditadas] =
    useState("VC");

  const [fotoPerfil, setFotoPerfil] =
    useState("");

  const [fotoPerfilEditada, setFotoPerfilEditada] =
    useState("");

  const inputGaleriaRef =
    useRef<HTMLInputElement>(null);

  const inputCameraRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarPerfilDoSupabase() {
      try {
        const { data: usuarioAuth, error: erroUsuario } =
          await supabase.auth.getUser();

        if (erroUsuario || !usuarioAuth.user || !ativo) {
          return;
        }

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
    let ativo = true;

    async function carregarLeituras() {
      try {
        const local = localStorage.getItem(STORAGE_LEITURAS);
        const metaLocal = localStorage.getItem(STORAGE_META);

        if (local) {
          const dados = JSON.parse(local);
          if (Array.isArray(dados) && ativo) setLeituras(dados);
        }
        if (metaLocal) {
          const meta = Number(metaLocal);
          if (Number.isFinite(meta) && meta > 0 && ativo) setMetaAnual(meta);
        }

        const { data: sessao } = await supabase.auth.getSession();
        const usuario = sessao.session?.user;
        if (!usuario || !ativo) return;

        const [resultadoLeituras, resultadoMeta] = await Promise.all([
          supabase
            .from("leituras")
            .select("titulo, autor, genero, status, pagina_atual, total_paginas, data_inicio, data_fim, emocional")
            .eq("usuario_id", usuario.id)
            .order("updated_at", { ascending: false }),
          supabase
            .from("metas_leitura")
            .select("meta_livros")
            .eq("usuario_id", usuario.id)
            .eq("ano", new Date().getFullYear())
            .maybeSingle(),
        ]);

        if (resultadoLeituras.error) {
          console.warn("Tabela de leituras ainda não disponível; usando registro local.");
        } else if (ativo && resultadoLeituras.data) {
          setLeituras(
            resultadoLeituras.data.map((item) => ({
              titulo: item.titulo,
              autor: item.autor,
              genero: item.genero,
              status: item.status as StatusLeitura,
              paginaAtual: Number(item.pagina_atual) || 0,
              totalPaginas: Number(item.total_paginas) || 0,
              dataInicio: item.data_inicio ?? undefined,
              dataFim: item.data_fim ?? undefined,
              emocional: Boolean(item.emocional),
            }))
          );
        }

        if (!resultadoMeta.error && resultadoMeta.data && ativo) {
          setMetaAnual(Number(resultadoMeta.data.meta_livros) || 24);
        }
      } catch {
        // O registro local continua funcionando mesmo sem a tabela no Supabase.
      }
    }

    void carregarLeituras();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_LEITURAS, JSON.stringify(leituras));
  }, [leituras]);

  useEffect(() => {
    localStorage.setItem(STORAGE_META, String(metaAnual));
  }, [metaAnual]);

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

  const livrosLidos = useMemo(
    () => leituras.filter((item) => item.status === "lido"),
    [leituras]
  );

  const livrosLendo = useMemo(
    () => leituras.filter((item) => item.status === "lendo"),
    [leituras]
  );

  const livroAtual = livrosLendo[0] ?? null;

  const leiturasTBR = useMemo(() => {
    const tbrRegistrada = leituras.filter((item) => item.status === "quero-ler");
    const extras = queroLer
      .filter((titulo) => !leituras.some((item) => item.titulo === titulo))
      .map((titulo) => {
        const livro = LIVROS_AVELUNE.find((item) => item[0] === titulo);
        return livro ? {
          titulo: livro[0], autor: livro[1], genero: livro[2], status: "quero-ler" as const, paginaAtual: 0, totalPaginas: 0,
        } : null;
      })
      .filter(Boolean) as Leitura[];
    return [...tbrRegistrada, ...extras];
  }, [leituras, queroLer]);

  const progressoAtual = livroAtual && livroAtual.totalPaginas > 0
    ? Math.min(100, Math.round((livroAtual.paginaAtual / livroAtual.totalPaginas) * 100))
    : 0;

  const progressoMeta = metaAnual > 0
    ? Math.min(100, Math.round((livrosLidos.length / metaAnual) * 100))
    : 0;

  const generoMaisLido = useMemo(() => {
    const contagem = livrosLidos.reduce<Record<string, number>>((acc, item) => {
      acc[item.genero] = (acc[item.genero] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Ainda descobrindo";
  }, [livrosLidos]);

  const autorMaisLido = useMemo(() => {
    const contagem = livrosLidos.reduce<Record<string, number>>((acc, item) => {
      acc[item.autor] = (acc[item.autor] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Ainda descobrindo";
  }, [livrosLidos]);

  const livroQueDestruiu = livrosLidos.find((item) => item.emocional)?.titulo ?? "Ainda não marcado";

  function abrirFormularioLeitura(titulo = "") {
    const existente = leituras.find((item) => item.titulo === titulo);
    setLivroSelecionadoLeitura(titulo);
    setStatusEdicao(existente?.status ?? "lendo");
    setPaginaAtualEdicao(existente?.paginaAtual ?? 0);
    setTotalPaginasEdicao(existente?.totalPaginas ?? 0);
    setEmocionalEdicao(Boolean(existente?.emocional));
    setMostrarLeituraForm(true);
  }

  async function salvarLeitura() {
    const livro = LIVROS_AVELUNE.find((item) => item[0] === livroSelecionadoLeitura);
    if (!livro) {
      mostrarMensagem("Escolha um livro para registrar a leitura.");
      return;
    }

    const existente = leituras.find((item) => item.titulo === livro[0]);
    const agora = new Date().toISOString();
    const atualizada: Leitura = {
      titulo: livro[0],
      autor: livro[1],
      genero: livro[2],
      status: statusEdicao,
      paginaAtual: Math.max(0, paginaAtualEdicao),
      totalPaginas: Math.max(0, totalPaginasEdicao),
      dataInicio: existente?.dataInicio ?? (statusEdicao !== "quero-ler" ? agora : undefined),
      dataFim: statusEdicao === "lido" ? (existente?.dataFim ?? agora) : undefined,
      emocional: statusEdicao === "lido" ? emocionalEdicao : false,
    };

    setLeituras((atuais) =>
      existente
        ? atuais.map((item) => item.titulo === livro[0] ? atualizada : item)
        : [...atuais, atualizada]
    );

    if (statusEdicao === "quero-ler") {
      setQueroLer((atuais) => atuais.includes(livro[0]) ? atuais : [...atuais, livro[0]]);
    } else {
      setQueroLer((atuais) => atuais.filter((item) => item !== livro[0]));
    }

    try {
      const { data: sessao } = await supabase.auth.getSession();
      const usuario = sessao.session?.user;

      if (usuario) {
        const { error } = await supabase.from("leituras").upsert({
          usuario_id: usuario.id,
          titulo: atualizada.titulo,
          autor: atualizada.autor,
          genero: atualizada.genero,
          status: atualizada.status,
          pagina_atual: atualizada.paginaAtual,
          total_paginas: atualizada.totalPaginas,
          data_inicio: atualizada.dataInicio ?? null,
          data_fim: atualizada.dataFim ?? null,
          emocional: atualizada.emocional ?? false,
        }, { onConflict: "usuario_id,titulo" });

        if (error) console.warn("Não foi possível sincronizar a leitura no Supabase; ela permanece salva neste navegador.");

        const { error: erroMeta } = await supabase.from("metas_leitura").upsert({
          usuario_id: usuario.id,
          ano: new Date().getFullYear(),
          meta_livros: metaAnual,
        }, { onConflict: "usuario_id,ano" });

        if (erroMeta) console.warn("Meta anual salva apenas localmente.");
      }
    } catch {
      // O localStorage é o fallback.
    }

    setMostrarLeituraForm(false);
    mostrarMensagem("Sua leitura foi atualizada.");
  }

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

  function abrirEdicaoPerfil() {
    setNomeEditado(nomePerfil);
    setUsuarioEditado(usuarioPerfil);
    setBioEditada(bioPerfil);
    setIniciaisEditadas(iniciaisPerfil);
    setFotoPerfilEditada(fotoPerfil);
    setEditando(true);
  }

  return (
    <main className="perfil">
      <header className="perfil-topo">
        <button
          className="perfil-logo"
          type="button"
          onClick={() => navegar("inicio")}
          aria-label="Voltar para o início"
        >
          AVELUNE
        </button>

        <nav className="perfil-nav">
          <button type="button" onClick={() => navegar("biblioteca")}>Biblioteca</button>
          <button type="button" onClick={() => navegar("explorar")}>Explorar</button>
          <button type="button" onClick={() => navegar("comunidade")}>Comunidade</button>
          <button type="button" className="ativo" onClick={() => navegar("perfil")}>Perfil</button>
        </nav>

        <div className="perfil-acoes-topo">
          <button
            type="button"
            className="perfil-icone"
            onClick={() =>
              mostrarMensagem(
                "A busca do Avelune será integrada em breve."
              )
            }
            aria-label="Pesquisar"
          >
            ⌕
          </button>

          <button
            type="button"
            className={`perfil-avatar-mini ${
              fotoPerfil
                ? "perfil-avatar-mini--foto"
                : ""
            }`}
            onClick={() => navegar("perfil")}
            aria-label="Abrir seu perfil"
          >
            {fotoPerfil ? (
              <img
                src={fotoPerfil}
                alt=""
              />
            ) : (
              iniciais
            )}
          </button>
        </div>
      </header>

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
              <div>
                <strong>{publicacoes.length}</strong>
                <span>publicações</span>
              </div>

              <div>
                <strong>{totalSeguidores}</strong>
                <span>seguidores</span>
              </div>

              <div>
                <strong>{totalSeguindo}</strong>
                <span>seguindo</span>
              </div>

              <div>
                <strong>
                  {livrosNaEstante.length}
                </strong>
                <span>na estante</span>
              </div>
            </div>
          </div>
        </section>

        <section className="perfil-literario">
          <div className="perfil-secao-titulo">
            <div>
              <p className="perfil-kicker">SEU CAMINHO ENTRE PÁGINAS</p>
              <h2>Vida literária</h2>
            </div>
            <button type="button" className="perfil-registrar-leitura" onClick={() => abrirFormularioLeitura()}>＋ REGISTRAR LEITURA</button>
          </div>

          <div className="perfil-literario-grid">
            <article className="perfil-painel-literario perfil-leitura-atual">
              <div className="perfil-painel-legenda"><span>ESTANTE ATIVA</span><span>EM LEITURA</span></div>
              {livroAtual ? (
                <div className="perfil-leitura-corpo">
                  <div className="perfil-capa-atual"><span>✦</span><strong>{livroAtual.titulo}</strong><small>{livroAtual.autor}</small></div>
                  <div className="perfil-leitura-info">
                    <p className="perfil-kicker">LIVRO ATUAL</p>
                    <h3>{livroAtual.titulo}</h3>
                    <p className="perfil-autor-atual">{livroAtual.autor}</p>
                    <div className="perfil-progresso-topo"><span>{progressoAtual}% concluído</span><span>{livroAtual.paginaAtual} / {livroAtual.totalPaginas || "—"} pág.</span></div>
                    <div className="perfil-progresso-trilho"><span style={{ width: `${progressoAtual}%` }} /></div>
                    <p className="perfil-frase-progresso">{progressoAtual >= 85 ? "Reta final 🔥" : progressoAtual >= 50 ? "Metade do caminho 🕯️" : "A história está apenas começando 🕯️"}</p>
                    <button type="button" className="perfil-acao-leitura" onClick={() => abrirFormularioLeitura(livroAtual.titulo)}>ATUALIZAR PROGRESSO</button>
                  </div>
                </div>
              ) : (
                <div className="perfil-literario-vazio"><span>☾</span><strong>Nenhuma leitura em andamento</strong><p>Escolha um livro e registre sua primeira leitura.</p><button type="button" className="perfil-acao-leitura" onClick={() => abrirFormularioLeitura()}>COMEÇAR UMA LEITURA</button></div>
              )}
            </article>

            <article className="perfil-painel-literario perfil-meta">
              <div className="perfil-painel-legenda"><span>GRIMÓRIO DE 2026</span><span>✧</span></div>
              <div className="perfil-meta-centro">
                <div className="perfil-selo-meta"><span>{livrosLidos.length}</span><small>de {metaAnual}</small></div>
                <p className="perfil-kicker">META ANUAL</p>
                <h3>As páginas que ainda<br />aguardam você.</h3>
                <div className="perfil-meta-barra"><span style={{ width: `${progressoMeta}%` }} /></div>
                <p className="perfil-meta-legenda">{metaAnual - livrosLidos.length > 0 ? `Faltam ${metaAnual - livrosLidos.length} livros para completar seu grimório.` : "Seu grimório anual está completo. ✦"}</p>
                <label className="perfil-meta-editor"><span>Meta anual</span><input type="number" min={1} max={200} value={metaAnual} onChange={(evento) => setMetaAnual(Math.max(1, Number(evento.target.value) || 1))} /></label>
                <div className="perfil-selos">{Array.from({ length: Math.min(metaAnual, 8) }, (_, indice) => <span key={indice} className={indice < livrosLidos.length ? "conquistado" : ""}>✦</span>)}</div>
              </div>
            </article>
          </div>

          <article className="perfil-painel-literario perfil-proxima-leitura">
            <div className="perfil-painel-legenda"><span>PRÓXIMA LEITURA</span><span>ESTANTE TBR</span></div>
            {leiturasTBR.length > 0 ? (
              <div className="perfil-tbr-lista">{leiturasTBR.slice(0, 5).map((livro) => <button key={livro.titulo} type="button" onClick={() => abrirFormularioLeitura(livro.titulo)}><span>✦</span><div><strong>{livro.titulo}</strong><small>{livro.autor}</small></div><b>→</b></button>)}</div>
            ) : (
              <div className="perfil-literario-vazio"><span>◇</span><strong>Sua TBR está vazia</strong><p>Adicione livros à sua estante pela Biblioteca.</p><button type="button" className="perfil-acao-leitura" onClick={() => navegar("biblioteca")}>ABRIR BIBLIOTECA</button></div>
            )}
          </article>

          <div className="perfil-estatisticas-literarias">
            <article><span className="perfil-stat-ornamento">☾</span><p>GÊNERO MAIS LIDO</p><strong>{generoMaisLido}</strong><small>{livrosLidos.length ? "mais presente nas suas leituras" : "suas estatísticas aparecerão aqui"}</small></article>
            <article><span className="perfil-stat-ornamento">✦</span><p>AUTOR DO ANO</p><strong>{autorMaisLido}</strong><small>{livrosLidos.length ? "mais presente nas suas leituras" : "suas estatísticas aparecerão aqui"}</small></article>
            <article><span className="perfil-stat-ornamento">♡</span><p>O QUE TE DESTRUIU</p><strong>{livroQueDestruiu}</strong><small>{livrosLidos.length ? "marcado por você" : "marque uma leitura quando doer"}</small></article>
          </div>

          {mostrarLeituraForm && (
            <div className="perfil-leitura-modal-fundo" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setMostrarLeituraForm(false); }}>
              <section className="perfil-leitura-modal" role="dialog" aria-modal="true" aria-labelledby="perfil-leitura-titulo">
                <div className="perfil-modal-topo"><div><p className="perfil-kicker">DIÁRIO DE LEITURA</p><h2 id="perfil-leitura-titulo">Registrar leitura</h2></div><button type="button" className="perfil-modal-fechar" onClick={() => setMostrarLeituraForm(false)}>×</button></div>
                <label className="perfil-campo"><span>Livro</span><select value={livroSelecionadoLeitura} onChange={(evento) => { const titulo = evento.target.value; setLivroSelecionadoLeitura(titulo); const existente = leituras.find((item) => item.titulo === titulo); setStatusEdicao(existente?.status ?? "lendo"); setPaginaAtualEdicao(existente?.paginaAtual ?? 0); setTotalPaginasEdicao(existente?.totalPaginas ?? 0); setEmocionalEdicao(Boolean(existente?.emocional)); }}><option value="">Escolha um livro</option>{LIVROS_AVELUNE.map((livro) => <option key={livro[0]} value={livro[0]}>{livro[0]}</option>)}</select></label>
                <label className="perfil-campo"><span>Status</span><select value={statusEdicao} onChange={(evento) => setStatusEdicao(evento.target.value as StatusLeitura)}><option value="quero-ler">Quero ler</option><option value="lendo">Lendo</option><option value="lido">Lido</option></select></label>
                {statusEdicao !== "quero-ler" && <div className="perfil-leitura-numeros"><label className="perfil-campo"><span>Página atual</span><input type="number" min={0} value={paginaAtualEdicao} onChange={(evento) => setPaginaAtualEdicao(Number(evento.target.value))} /></label><label className="perfil-campo"><span>Total de páginas</span><input type="number" min={0} value={totalPaginasEdicao} onChange={(evento) => setTotalPaginasEdicao(Number(evento.target.value))} /></label></div>}
                {statusEdicao === "lido" && <label className="perfil-check-literario"><input type="checkbox" checked={emocionalEdicao} onChange={(evento) => setEmocionalEdicao(evento.target.checked)} /><span>Esse livro me destruiu emocionalmente 😂</span></label>}
                <div className="perfil-modal-acoes"><button type="button" className="perfil-modal-cancelar" onClick={() => setMostrarLeituraForm(false)}>Cancelar</button><button type="button" className="perfil-modal-salvar" onClick={salvarLeitura}>Salvar leitura</button></div>
              </section>
            </div>
          )}
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

                      <button
                        type="button"
                        className="perfil-menu"
                        onClick={() =>
                          mostrarMensagem(
                            "Mais opções estarão disponíveis em breve."
                          )
                        }
                        aria-label="Mais opções"
                      >
                        •••
                      </button>
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
                  const nomeFinal =
                    nomeEditado.trim() || "Você";

                  let usuarioFinal =
                    usuarioEditado.trim();

                  if (!usuarioFinal) {
                    usuarioFinal = "@aventureiro";
                  }

                  if (!usuarioFinal.startsWith("@")) {
                    usuarioFinal = `@${usuarioFinal}`;
                  }

                  const bioFinal =
                    bioEditada.trim() ||
                    "Entre páginas, mundos e histórias.";

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

                    const { error: erroAtualizacao } =
                      await supabase
                        .from("profiles")
                        .update({
                          nome: nomeFinal,
                          username: usernameBanco,
                          bio: bioFinal,
                        })
                        .eq("id", usuarioAuth.user.id);

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
