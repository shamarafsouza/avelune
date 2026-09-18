import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import { supabase } from "../lib/supabase";
import "./Comunidade.css";

type Pagina =
  | "inicio"
  | "biblioteca"
  | "explorar"
  | "comunidade"
  | "perfil"
  | "auth-cadastro"
  | "auth-login";

type Filtro =
  | "para-voce"
  | "seguindo"
  | "recentes";

type AbaComunidade = "publicacoes" | "resenhas" | "historias";

type Comentario = {
  id: number;
  usuario: string;
  texto: string;
};

type Publicacao = {
  id: number;
  usuario: string;
  iniciais: string;
  tempo: string;
  texto: string;
  livro?: string;
  autorLivro?: string;
  avaliacao?: number;
  cor?: string;
  simbolo?: string;
  foto?: string;
  curtidas: number;
  comentarios: number;
  curtido: boolean;
  salva: boolean;
  seguindo?: boolean;
  origemUsuario?: boolean;
  comentariosLista?: Comentario[];
  tipo?: "post" | "resenha" | "progresso";
  paginaAtual?: number;
  paginaTotal?: number;
};

type Personagem = {
  id: number;
  nome: string;
  faceClaim?: string;
  foto?: string;
  descricao?: string;
};

type Historia = {
  id: number;
  titulo: string;
  sinopse: string;
  tipo: "fanfic" | "original";
  livroInspiracao?: string;
  comentarioInspiracao?: string;
  generos: string[];
  tropes: string[];
  classificacao: string;
  capa?: string;
  personagens: Personagem[];
  autor: string;
  autorIniciais: string;
  curtidas: number;
  salva: boolean;
  capitulos: { id: number; titulo: string }[];
};


type ComunidadeProps = {
  onNavigate?: (pagina: Pagina) => void;
};

const STORAGE_SALVOS =
  "avelune-comunidade-salvos";

const STORAGE_HISTORIAS = "avelune-comunidade-historias";

const GENEROS_HISTORIA = [
  "Fantasia", "Romance", "Dark Romance", "Mistério", "Terror", "Ficção", "Aventura",
];

const TROPES_SUGERIDOS = [
  "Enemies to Lovers", "Slow Burn", "Found Family", "Segunda Chance", "Amigos de Infância",
];

const CLASSIFICACOES = ["Livre", "12", "14", "16", "18"];

function carregarHistorias(): Historia[] {
  try {
    const salvas = localStorage.getItem(STORAGE_HISTORIAS);
    if (salvas) {
      const dados = JSON.parse(salvas);
      if (Array.isArray(dados)) return dados;
    }
  } catch {
    // usa vazio
  }
  return [];
}

const postagensIniciais: Publicacao[] = [
  {
    id: 1,
    usuario: "Luna Valmont",
    iniciais: "LV",
    tempo: "há 18 min",
    texto:
      "Terminei A Corte das Sombras e ainda estou tentando processar tudo. A atmosfera desse livro é simplesmente maravilhosa. Preciso conversar com alguém sobre esse final.",
    livro: "A Corte das Sombras",
    autorLivro: "Elena Beaumont",
    avaliacao: 5,
    cor: "vinho",
    simbolo: "✦",
    curtidas: 128,
    comentarios: 24,
    curtido: false,
    salva: false,
    seguindo: true,
    comentariosLista: [
      {
        id: 101,
        usuario: "Clara Moon",
        texto:
          "SIM! O final me deixou olhando para o teto por uns dez minutos.",
      },
      {
        id: 102,
        usuario: "Noah Evernight",
        texto:
          "Essa é definitivamente uma leitura que merece uma releitura.",
      },
    ],
  },
  {
    id: 2,
    usuario: "Arthur Black",
    iniciais: "AB",
    tempo: "há 42 min",
    texto:
      "O Jardim das Estrelas tem aquela sensação rara de livro que parece existir fora do tempo. Cada capítulo parece uma pequena lembrança.",
    livro: "O Jardim das Estrelas",
    autorLivro: "Clara Whitmore",
    avaliacao: 4,
    cor: "azul",
    simbolo: "✧",
    curtidas: 94,
    comentarios: 16,
    curtido: false,
    salva: false,
    seguindo: false,
    comentariosLista: [
      {
        id: 201,
        usuario: "Luna Valmont",
        texto:
          "Você descreveu exatamente a sensação que eu tive lendo.",
      },
    ],
  },
  {
    id: 3,
    usuario: "Clara Moon",
    iniciais: "CM",
    tempo: "há 1 h",
    texto:
      "Pergunta séria para a comunidade: qual livro vocês gostariam de esquecer só para poder ler pela primeira vez novamente?",
    curtidas: 76,
    comentarios: 31,
    curtido: false,
    salva: false,
    seguindo: true,
    comentariosLista: [
      {
        id: 301,
        usuario: "Arthur Black",
        texto:
          "Entre Mundos. Sem pensar duas vezes.",
      },
      {
        id: 302,
        usuario: "Luna Valmont",
        texto:
          "A Corte das Sombras. Eu queria sentir aquele impacto de novo.",
      },
    ],
  },
  {
    id: 4,
    usuario: "Noah Evernight",
    iniciais: "NE",
    tempo: "há 2 h",
    texto:
      "Comecei Entre Mundos sem grandes expectativas e agora não consigo parar. A ideia de atravessar realidades diferentes é muito bem construída.",
    livro: "Entre Mundos",
    autorLivro: "Adrian Blackwood",
    avaliacao: 5,
    cor: "roxo",
    simbolo: "◇",
    curtidas: 61,
    comentarios: 11,
    curtido: false,
    salva: false,
    seguindo: false,
    comentariosLista: [
      {
        id: 401,
        usuario: "Clara Moon",
        texto:
          "Esse livro me pegou completamente de surpresa também.",
      },
    ],
  },
];

function dataUrlParaBlob(dataUrl: string): Blob {
  const partes = dataUrl.split(",");
  const tipo = partes[0].match(/data:(.*?);base64/)?.[1] ||
    "image/jpeg";

  const binario = atob(partes[1]);
  const bytes = new Uint8Array(binario.length);

  for (let indice = 0; indice < binario.length; indice += 1) {
    bytes[indice] = binario.charCodeAt(indice);
  }

  return new Blob([bytes], { type: tipo });
}

function redimensionarImagem(
  arquivo: File
): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = new Image();

      imagem.onload = () => {
        const limite = 1200;
        const escala = Math.min(
          1,
          limite /
            Math.max(imagem.width, imagem.height)
        );

        const largura = Math.max(
          1,
          Math.round(imagem.width * escala)
        );

        const altura = Math.max(
          1,
          Math.round(imagem.height * escala)
        );

        const canvas =
          document.createElement("canvas");

        canvas.width = largura;
        canvas.height = altura;

        const contexto =
          canvas.getContext("2d");

        if (!contexto) {
          reject(
            new Error(
              "Não foi possível preparar a imagem."
            )
          );
          return;
        }

        contexto.drawImage(
          imagem,
          0,
          0,
          largura,
          altura
        );

        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.82
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

type PublicacaoBanco = {
  id: number;
  usuario_id: string;
  texto: string;
  livro: string | null;
  autor_livro: string | null;
  avaliacao: number | null;
  foto_url: string | null;
  curtidas: number;
  comentarios: number;
  created_at: string;
  tipo?: "post" | "resenha" | "progresso" | null;
  pagina_atual?: number | null;
  pagina_total?: number | null;
};

type ComentarioBanco = {
  id: number;
  publicacao_id: number;
  usuario_id: string;
  texto: string;
  created_at: string;
};

function formatarTempo(data: string) {
  const diferenca = Math.max(
    0,
    Date.now() - new Date(data).getTime()
  );
  const minutos = Math.floor(diferenca / 60000);

  if (minutos < 1) {
    return "agora";
  }

  if (minutos < 60) {
    return `há ${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);

  if (horas < 24) {
    return `há ${horas} h`;
  }

  const dias = Math.floor(horas / 24);
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

function Comunidade({
  onNavigate,
}: ComunidadeProps) {
  const [postagens, setPostagens] =
    useState<Publicacao[]>(
      postagensIniciais
    );

  const [historias, setHistorias] = useState<Historia[]>(carregarHistorias);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORIAS, JSON.stringify(historias));
    } catch {
      // sem ação
    }
  }, [historias]);

  // modal de criação
  const [modalHistoriaAberto, setModalHistoriaAberto] = useState(false);
  const [tituloH, setTituloH] = useState("");
  const [sinopseH, setSinopseH] = useState("");
  const [tipoH, setTipoH] = useState<"fanfic" | "original">("fanfic");
  const [livroInspiracaoH, setLivroInspiracaoH] = useState("");
  const [comentarioInspiracaoH, setComentarioInspiracaoH] = useState("");
  const [generosH, setGenerosH] = useState<string[]>([]);
  const [tropesH, setTropesH] = useState<string[]>([]);
  const [classificacaoH, setClassificacaoH] = useState("Livre");
  const [capaH, setCapaH] = useState("");
  const [personagensH, setPersonagensH] = useState<Personagem[]>([]);
  const [novoPersonagemNome, setNovoPersonagemNome] = useState("");
  const [novoPersonagemFaceClaim, setNovoPersonagemFaceClaim] = useState("");
  const [novoPersonagemDescricao, setNovoPersonagemDescricao] = useState("");
  const [, setHistoriaAberta] = useState<Historia | null>(null);

  function alternarGeneroH(genero: string) {
    setGenerosH((atual) =>
      atual.includes(genero) ? atual.filter((g) => g !== genero) : [...atual, genero]
    );
  }

  function alternarTropeH(trope: string) {
    setTropesH((atual) =>
      atual.includes(trope) ? atual.filter((t) => t !== trope) : [...atual, trope]
    );
  }

  function adicionarPersonagem() {
    if (!novoPersonagemNome.trim()) return;
    setPersonagensH((atual) => [
      ...atual,
      {
        id: Date.now(),
        nome: novoPersonagemNome.trim(),
        faceClaim: novoPersonagemFaceClaim.trim() || undefined,
        descricao: novoPersonagemDescricao.trim() || undefined,
      },
    ]);
    setNovoPersonagemNome("");
    setNovoPersonagemFaceClaim("");
    setNovoPersonagemDescricao("");
  }

  function removerPersonagem(id: number) {
    setPersonagensH((atual) => atual.filter((p) => p.id !== id));
  }

  function limparFormularioHistoria() {
    setTituloH("");
    setSinopseH("");
    setTipoH("fanfic");
    setLivroInspiracaoH("");
    setComentarioInspiracaoH("");
    setGenerosH([]);
    setTropesH([]);
    setClassificacaoH("Livre");
    setCapaH("");
    setPersonagensH([]);
  }

  function publicarHistoria() {
    if (!exigirConta()) return;

    if (!tituloH.trim()) {
      mostrarMensagem("Dê um título para sua história.");
      return;
    }

    const nova: Historia = {
      id: Date.now(),
      titulo: tituloH.trim(),
      sinopse: sinopseH.trim(),
      tipo: tipoH,
      livroInspiracao: livroInspiracaoH.trim() || undefined,
      comentarioInspiracao: comentarioInspiracaoH.trim() || undefined,
      generos: generosH,
      tropes: tropesH,
      classificacao: classificacaoH,
      capa: capaH || undefined,
      personagens: personagensH,
      autor: "Você",
      autorIniciais: "VC",
      curtidas: 0,
      salva: false,
      capitulos: [{ id: Date.now(), titulo: "01 — O começo" }],
    };

    setHistorias((atual) => [nova, ...atual]);
    limparFormularioHistoria();
    setModalHistoriaAberto(false);
    mostrarMensagem("Sua história foi publicada.");
  }


  const [filtro, setFiltro] =
    useState<Filtro>("para-voce");

  const [abaComunidade, setAbaComunidade] =
    useState<AbaComunidade>("publicacoes");

  const [texto, setTexto] =
    useState("");

  const [livroDigitado, setLivroDigitado] =
    useState("");

  const [autorDigitado, setAutorDigitado] =
    useState("");

  const [avaliacaoDigitada, setAvaliacaoDigitada] =
    useState(5);

  const [modoResenha, setModoResenha] =
    useState(false);

  const [modoProgresso, setModoProgresso] =
    useState(false);

  const [paginaAtualDigitada, setPaginaAtualDigitada] =
    useState(0);

  const [paginaTotalDigitada, setPaginaTotalDigitada] =
    useState(0);

  const [capituloDigitado, setCapituloDigitado] =
    useState("");

  const [fotoSelecionada, setFotoSelecionada] =
    useState("");

  const [comentariosAbertos, setComentariosAbertos] =
    useState<number | null>(null);

  const [comentarioDigitado, setComentarioDigitado] =
    useState<Record<number, string>>({});

  const [mensagem, setMensagem] =
    useState("");

  const [mostrarAvisoConta, setMostrarAvisoConta] =
    useState(false);

  const [autenticado, setAutenticado] =
    useState(false);

  const [seguindoIds, setSeguindoIds] =
    useState<Set<string>>(new Set());

  const [leitoresParaSeguir, setLeitoresParaSeguir] =
    useState<
      {
        id: string;
        nome: string;
        username: string;
        iniciais: string;
      }[]
    >([]);

  const inputImagemRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    const salvos = postagens
      .filter((post) => post.salva)
      .map((post) => post.id);

    try {
      localStorage.setItem(
        STORAGE_SALVOS,
        JSON.stringify(salvos)
      );
    } catch {
      // Sem ação.
    }
  }, [postagens]);

  useEffect(() => {
    let montado = true;

    async function carregarSessao() {
      const { data } =
        await supabase.auth.getSession();

      if (montado) {
        setAutenticado(Boolean(data.session));
      }
    }

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        setAutenticado(Boolean(session));
      }
    );

    return () => {
      montado = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let montado = true;

    async function carregarPublicacoes() {
      if (!autenticado) {
        if (montado) {
          setPostagens(postagensIniciais);
        }
        return;
      }

      const { data: usuarioAtual } =
        await supabase.auth.getUser();

      if (!usuarioAtual.user) {
        if (montado) {
          setPostagens([]);
        }
        return;
      }

      const { data: seguidores, error: erroSeguidores } =
        await supabase
          .from("seguidores")
          .select("seguido_id")
          .eq("seguidor_id", usuarioAtual.user.id);

      if (erroSeguidores) {
        setMensagem(
          "Não foi possível carregar quem você segue."
        );
      }

      const idsSeguindo = new Set<string>(
        (seguidores ?? []).map(
          (item: { seguido_id: string }) => item.seguido_id
        )
      );

      const { data: perfisParaSeguir } = await supabase
        .from("profiles")
        .select("id, nome, username")
        .neq("id", usuarioAtual.user.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (montado) {
        setSeguindoIds(idsSeguindo);
        setLeitoresParaSeguir(
          (perfisParaSeguir ?? []).map(
            (perfil: {
              id: string;
              nome: string | null;
              username: string;
            }) => {
              const nome =
                perfil.nome || perfil.username || "Leitor";

              return {
                id: perfil.id,
                nome,
                username: perfil.username,
                iniciais:
                  nome
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((parte: string) => parte[0])
                    .join("")
                    .toUpperCase() || "LE",
              };
            }
          )
        );
      }

      const { data, error } = await supabase
        .from("publicacoes")
        .select(
          "id, usuario_id, texto, livro, autor_livro, avaliacao, foto_url, curtidas, comentarios, created_at, tipo, pagina_atual, pagina_total"
        )
        .order("created_at", { ascending: false });

      if (!montado) {
        return;
      }

      if (error) {
        setMensagem(
          "Não foi possível carregar as publicações da comunidade."
        );
        return;
      }

      const publicacoes =
        (data ?? []) as PublicacaoBanco[];

      if (publicacoes.length === 0) {
        setPostagens([]);
        return;
      }

      const idsPublicacoes = publicacoes.map(
        (publicacao) => publicacao.id
      );

      const idsUsuarios = [
        ...new Set(
          publicacoes.map(
            (publicacao) => publicacao.usuario_id
          )
        ),
      ];

      const [resultadoPerfis, resultadoCurtidas, resultadoComentarios] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, nome, username")
            .in("id", idsUsuarios),
          supabase
            .from("curtidas")
            .select("publicacao_id, usuario_id")
            .in("publicacao_id", idsPublicacoes),
          supabase
            .from("comentarios")
            .select("id, publicacao_id, usuario_id, texto, created_at")
            .in("publicacao_id", idsPublicacoes)
            .order("created_at", { ascending: true }),
        ]);

      const mapaPerfis = new Map(
        (resultadoPerfis.data ?? []).map(
          (perfil: {
            id: string;
            nome: string | null;
            username: string;
          }) => [perfil.id, perfil]
        )
      );

      const idsCurtidos = new Set(
        (resultadoCurtidas.data ?? [])
          .filter(
            (curtida: {
              publicacao_id: number;
              usuario_id: string;
            }) =>
              curtida.usuario_id ===
              usuarioAtual.user.id
          )
          .map(
            (curtida: { publicacao_id: number }) =>
              curtida.publicacao_id
          )
      );

      const curtidasPorPublicacao = new Map<number, number>();

      (resultadoCurtidas.data ?? []).forEach(
        (curtida: { publicacao_id: number }) => {
          curtidasPorPublicacao.set(
            curtida.publicacao_id,
            (curtidasPorPublicacao.get(curtida.publicacao_id) ?? 0) + 1
          );
        }
      );

      const comentariosBanco =
        (resultadoComentarios.data ?? []) as ComentarioBanco[];

      const idsUsuariosComentarios = [
        ...new Set(
          comentariosBanco.map(
            (comentario) => comentario.usuario_id
          )
        ),
      ];

      let mapaPerfisComentarios = mapaPerfis;

      if (idsUsuariosComentarios.length > 0) {
        const { data: perfisComentarios } = await supabase
          .from("profiles")
          .select("id, nome, username")
          .in("id", idsUsuariosComentarios);

        mapaPerfisComentarios = new Map(
          (perfisComentarios ?? []).map(
            (perfil: {
              id: string;
              nome: string | null;
              username: string;
            }) => [perfil.id, perfil]
          )
        );

        mapaPerfis.forEach((perfil, id) => {
          if (!mapaPerfisComentarios.has(id)) {
            mapaPerfisComentarios.set(id, perfil);
          }
        });
      }

      const comentariosPorPublicacao = new Map<
        number,
        Comentario[]
      >();

      comentariosBanco.forEach((comentario) => {
        const perfil = mapaPerfisComentarios.get(
          comentario.usuario_id
        );
        const nome =
          perfil?.nome ||
          perfil?.username ||
          "Leitor";

        const lista =
          comentariosPorPublicacao.get(
            comentario.publicacao_id
          ) ?? [];

        lista.push({
          id: comentario.id,
          usuario: nome,
          texto: comentario.texto,
        });

        comentariosPorPublicacao.set(
          comentario.publicacao_id,
          lista
        );
      });

      const convertidas: Publicacao[] =
        publicacoes.map((publicacao) => {
          const perfil = mapaPerfis.get(
            publicacao.usuario_id
          );
          const nome =
            perfil?.nome ||
            perfil?.username ||
            "Leitor";
          const comentariosDaPublicacao =
            comentariosPorPublicacao.get(publicacao.id) ?? [];

          return {
            id: publicacao.id,
            usuario: nome,
            iniciais: nome
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((parte: string) => parte[0])
              .join("")
              .toUpperCase() || "LE",
            tempo: formatarTempo(
              publicacao.created_at
            ),
            texto: publicacao.texto,
            livro: publicacao.livro ?? undefined,
            autorLivro:
              publicacao.autor_livro ?? undefined,
            avaliacao:
              publicacao.avaliacao ?? undefined,
            foto: publicacao.foto_url ?? undefined,
            tipo: publicacao.tipo ?? "post",
            paginaAtual: publicacao.pagina_atual ?? undefined,
            paginaTotal: publicacao.pagina_total ?? undefined,
            curtidas: curtidasPorPublicacao.get(publicacao.id) ?? 0,
            comentarios: comentariosDaPublicacao.length,
            curtido: idsCurtidos.has(publicacao.id),
            salva: false,
            seguindo: idsSeguindo.has(publicacao.usuario_id),
            origemUsuario:
              publicacao.usuario_id === usuarioAtual.user.id,
            comentariosLista: comentariosDaPublicacao,
          };
        });

      if (montado) {
        setPostagens(convertidas);
      }
    }

    carregarPublicacoes();

    const canalPublicacoes = supabase
      .channel("comunidade-publicacoes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "publicacoes",
        },
        () => {
          if (montado) {
            carregarPublicacoes();
          }
        }
      )
      .subscribe();

    return () => {
      montado = false;
      supabase.removeChannel(canalPublicacoes);
    };
  }, [autenticado]);

  function exigirConta() {
    if (autenticado) {
      return true;
    }

    setMostrarAvisoConta(true);
    return false;
  }

  const visitante = !autenticado;

  const postagensVisiveis = useMemo(() => {
    if (!visitante) {
      return postagens;
    }

    return postagens.filter(
      (post) =>
        post.usuario !== "Você" &&
        !post.origemUsuario
    );
  }, [postagens, visitante]);

  const feed = useMemo(() => {
    if (filtro === "seguindo") {
      return postagensVisiveis.filter(
        (post) => post.seguindo
      );
    }

    if (filtro === "recentes") {
      return [...postagensVisiveis].reverse();
    }

    return postagensVisiveis;
  }, [filtro, postagensVisiveis]);

  function mostrarMensagem(textoMensagem: string) {
    setMensagem(textoMensagem);

    window.setTimeout(() => {
      setMensagem("");
    }, 3000);
  }

  function abrirImagem() {
    if (!exigirConta()) {
      return;
    }

    inputImagemRef.current?.click();
  }

  async function selecionarImagem(
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = evento.target.files?.[0];

    if (!arquivo) {
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
      mostrarMensagem(
        "Escolha uma imagem JPG, PNG, WEBP ou outro formato de imagem."
      );
      return;
    }

    if (arquivo.size > 8 * 1024 * 1024) {
      mostrarMensagem(
        "A imagem precisa ter no máximo 8 MB."
      );
      return;
    }

    try {
      const imagem =
        await redimensionarImagem(arquivo);

      setFotoSelecionada(imagem);
      mostrarMensagem(
        "Foto adicionada à sua resenha."
      );
    } catch {
      mostrarMensagem(
        "Não foi possível carregar essa imagem."
      );
    }

    evento.target.value = "";
  }

  function ativarResenha() {
    if (!exigirConta()) {
      return;
    }

    setModoResenha(true);
    setModoProgresso(false);
    mostrarMensagem(
      "Modo resenha ativado. Adicione o livro, sua nota e conte como foi a leitura."
    );
  }

  function limparCompositor() {
    setTexto("");
    setLivroDigitado("");
    setAutorDigitado("");
    setAvaliacaoDigitada(5);
    setFotoSelecionada("");
    setModoResenha(false);
    setModoProgresso(false);
    setPaginaAtualDigitada(0);
    setPaginaTotalDigitada(0);
    setCapituloDigitado("");
  }

  async function publicar() {
    if (!exigirConta()) {
      return;
    }

    const textoLimpo = texto.trim();
    const livroLimpo = livroDigitado.trim();
    const autorLimpo = autorDigitado.trim();

    if (
      !textoLimpo &&
      !fotoSelecionada &&
      !livroLimpo
    ) {
      mostrarMensagem(
        "Adicione uma foto, escreva uma resenha ou informe um livro."
      );
      return;
    }

    if ((modoResenha || modoProgresso) && !livroLimpo) {
      mostrarMensagem(
        "Informe qual livro está relacionado à publicação."
      );
      return;
    }

    if (modoProgresso && paginaTotalDigitada <= 0) {
      mostrarMensagem("Informe o total de páginas do livro.");
      return;
    }

    if (modoProgresso && paginaAtualDigitada > paginaTotalDigitada) {
      mostrarMensagem("A página atual não pode ser maior que o total.");
      return;
    }

    const { data: usuarioAuth, error: erroUsuario } =
      await supabase.auth.getUser();

    if (erroUsuario || !usuarioAuth.user) {
      mostrarMensagem(
        "Sua sessão expirou. Entre novamente para publicar."
      );
      return;
    }

    let fotoUrl: string | null = null;

    if (fotoSelecionada) {
      const arquivoFoto = dataUrlParaBlob(
        fotoSelecionada
      );

      const caminhoFoto =
        `${usuarioAuth.user.id}/${Date.now()}.jpg`;

      const { error: erroUpload } =
        await supabase.storage
          .from("comunidade")
          .upload(caminhoFoto, arquivoFoto, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: false,
          });

      if (erroUpload) {
        mostrarMensagem(
          "Não foi possível enviar a foto. Tente novamente."
        );
        return;
      }

      const { data: urlPublica } =
        supabase.storage
          .from("comunidade")
          .getPublicUrl(caminhoFoto);

      fotoUrl = urlPublica.publicUrl;
    }

    const { data: novaPublicacao, error } =
      await supabase
        .from("publicacoes")
        .insert({
          usuario_id: usuarioAuth.user.id,
          texto: modoProgresso && capituloDigitado.trim()
            ? `${capituloDigitado.trim()} — ${textoLimpo || "Estou avançando nesta leitura."}`
            : textoLimpo || "Minha nova leitura no Avelune.",
          livro: livroLimpo || null,
          autor_livro: autorLimpo || null,
          avaliacao: modoResenha && livroLimpo
            ? avaliacaoDigitada
            : null,
          foto_url: fotoUrl,
          tipo: modoProgresso ? "progresso" : modoResenha ? "resenha" : "post",
          pagina_atual: modoProgresso ? paginaAtualDigitada : null,
          pagina_total: modoProgresso ? paginaTotalDigitada : null,
        })
        .select(
          "id, usuario_id, texto, livro, autor_livro, avaliacao, foto_url, curtidas, comentarios, created_at, tipo, pagina_atual, pagina_total"
        )
        .single();

    if (error || !novaPublicacao) {
      mostrarMensagem(
        "Não foi possível publicar sua resenha. Tente novamente."
      );
      return;
    }

    const { data: perfil } = await supabase
      .from("profiles")
      .select("id, nome, username")
      .eq("id", usuarioAuth.user.id)
      .maybeSingle();

    const nome =
      perfil?.nome ||
      perfil?.username ||
      "Você";

    const postagemCriada: Publicacao = {
      id: novaPublicacao.id,
      usuario: nome,
      iniciais: nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte: string) => parte[0])
        .join("")
        .toUpperCase() || "VC",
      tempo: "agora",
      texto: novaPublicacao.texto,
      livro: novaPublicacao.livro ?? undefined,
      autorLivro:
        novaPublicacao.autor_livro ?? undefined,
      avaliacao:
        novaPublicacao.avaliacao ?? undefined,
      foto: novaPublicacao.foto_url ?? undefined,
      tipo: modoProgresso ? "progresso" : modoResenha ? "resenha" : "post",
      paginaAtual: modoProgresso ? paginaAtualDigitada : undefined,
      paginaTotal: modoProgresso ? paginaTotalDigitada : undefined,
      curtidas: 0,
      comentarios: 0,
      curtido: false,
      salva: false,
      seguindo: true,
      origemUsuario: true,
      comentariosLista: [],
    };

    setPostagens((atual) => [
      postagemCriada,
      ...atual,
    ]);

    limparCompositor();
    mostrarMensagem(
      "Sua publicação foi salva na comunidade."
    );
  }

  async function alternarCurtida(id: number) {
    if (!exigirConta()) {
      return;
    }

    const { data: usuarioAuth, error: erroUsuario } =
      await supabase.auth.getUser();

    if (erroUsuario || !usuarioAuth.user) {
      mostrarMensagem(
        "Sua sessão expirou. Entre novamente para continuar."
      );
      return;
    }

    const post = postagens.find(
      (item) => item.id === id
    );

    if (!post) {
      return;
    }

    if (post.curtido) {
      const { error } = await supabase
        .from("curtidas")
        .delete()
        .eq("publicacao_id", id)
        .eq("usuario_id", usuarioAuth.user.id);

      if (error) {
        mostrarMensagem(
          "Não foi possível remover sua curtida."
        );
        return;
      }
    } else {
      const { error } = await supabase
        .from("curtidas")
        .insert({
          publicacao_id: id,
          usuario_id: usuarioAuth.user.id,
        });

      if (error && error.code !== "23505") {
        mostrarMensagem(
          "Não foi possível registrar sua curtida."
        );
        return;
      }
    }

    const { count } = await supabase
      .from("curtidas")
      .select("id", { count: "exact", head: true })
      .eq("publicacao_id", id);

    setPostagens((atual) =>
      atual.map((item) =>
        item.id === id
          ? {
              ...item,
              curtido: !post.curtido,
              curtidas: count ?? 0,
            }
          : item
      )
    );
  }

  function alternarSalvo(id: number) {
    if (!exigirConta()) {
      return;
    }

    setPostagens((atual) =>
      atual.map((post) =>
        post.id === id
          ? {
              ...post,
              salva: !post.salva,
            }
          : post
      )
    );
  }

  function alternarComentarios(id: number) {
    if (!exigirConta()) {
      return;
    }

    setComentariosAbertos((atual) =>
      atual === id ? null : id
    );
  }

  async function adicionarComentario(id: number) {
    if (!exigirConta()) {
      return;
    }

    const novoTexto =
      comentarioDigitado[id]?.trim();

    if (!novoTexto) {
      return;
    }

    if (novoTexto.length > 1000) {
      mostrarMensagem(
        "O comentário pode ter no máximo 1000 caracteres."
      );
      return;
    }

    const { data: usuarioAuth, error: erroUsuario } =
      await supabase.auth.getUser();

    if (erroUsuario || !usuarioAuth.user) {
      mostrarMensagem(
        "Sua sessão expirou. Entre novamente para comentar."
      );
      return;
    }

    const { data: novoComentario, error } =
      await supabase
        .from("comentarios")
        .insert({
          publicacao_id: id,
          usuario_id: usuarioAuth.user.id,
          texto: novoTexto,
        })
        .select(
          "id, publicacao_id, usuario_id, texto, created_at"
        )
        .single();

    if (error || !novoComentario) {
      mostrarMensagem(
        "Não foi possível publicar seu comentário."
      );
      return;
    }

    const { data: perfil } = await supabase
      .from("profiles")
      .select("id, nome, username")
      .eq("id", usuarioAuth.user.id)
      .maybeSingle();

    const nome =
      perfil?.nome ||
      perfil?.username ||
      "Você";

    const comentario: Comentario = {
      id: novoComentario.id,
      usuario: nome,
      texto: novoComentario.texto,
    };

    const { count } = await supabase
      .from("comentarios")
      .select("id", { count: "exact", head: true })
      .eq("publicacao_id", id);

    setPostagens((atual) =>
      atual.map((post) => {
        if (post.id !== id) {
          return post;
        }

        return {
          ...post,
          comentarios: count ?? post.comentarios + 1,
          comentariosLista: [
            ...(post.comentariosLista ?? []),
            comentario,
          ],
        };
      })
    );

    setComentarioDigitado((atual) => ({
      ...atual,
      [id]: "",
    }));

    setComentariosAbertos(id);
  }

  function atualizarComentario(
    id: number,
    valor: string
  ) {
    setComentarioDigitado((atual) => ({
      ...atual,
      [id]: valor,
    }));
  }

  async function alternarSeguir(id: string) {
    if (!exigirConta()) {
      return;
    }

    const { data: usuarioAuth, error: erroUsuario } =
      await supabase.auth.getUser();

    if (erroUsuario || !usuarioAuth.user) {
      mostrarMensagem(
        "Sua sessão expirou. Entre novamente para continuar."
      );
      return;
    }

    if (usuarioAuth.user.id === id) {
      return;
    }

    const estaSeguindo = seguindoIds.has(id);

    if (estaSeguindo) {
      const { error } = await supabase
        .from("seguidores")
        .delete()
        .eq("seguidor_id", usuarioAuth.user.id)
        .eq("seguido_id", id);

      if (error) {
        mostrarMensagem(
          "Não foi possível deixar de seguir este leitor."
        );
        return;
      }
    } else {
      const { error } = await supabase
        .from("seguidores")
        .insert({
          seguidor_id: usuarioAuth.user.id,
          seguido_id: id,
        });

      if (error && error.code !== "23505") {
        mostrarMensagem(
          "Não foi possível seguir este leitor."
        );
        return;
      }
    }

    const novoEstado = new Set(seguindoIds);

    if (estaSeguindo) {
      novoEstado.delete(id);
    } else {
      novoEstado.add(id);
    }

    setSeguindoIds(novoEstado);

    const leitor = leitoresParaSeguir.find(
      (item) => item.id === id
    );

    if (leitor) {
      setPostagens((atual) =>
        atual.map((post) =>
          post.usuario === leitor.nome
            ? {
                ...post,
                seguindo: !estaSeguindo,
              }
            : post
        )
      );
    }

    mostrarMensagem(
      estaSeguindo
        ? "Você deixou de seguir este leitor."
        : "Você começou a seguir este leitor."
    );
  }

  function renderEstrelas(
    avaliacao: number
  ) {
    return Array.from(
      { length: 5 },
      (_, indice) => (
        <span
          key={indice}
          className={
            indice < avaliacao
              ? "preenchida"
              : ""
          }
        >
          ★
        </span>
      )
    );
  }

  return (
    <main className="comunidade">
      <div className="comunidade-particulas">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <header className="comunidade-topo">
        <button
          type="button"
          className="comunidade-logo"
          onClick={() =>
            onNavigate?.("inicio")
          }
          aria-label="Voltar para o início"
        >
          AVELUNE
        </button>

        <nav className="comunidade-nav">
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
            onClick={() =>
              onNavigate?.("explorar")
            }
          >
            Explorar
          </button>

          <button
            type="button"
            className="ativo"
            onClick={() =>
              onNavigate?.("comunidade")
            }
          >
            Comunidade
          </button>
        </nav>

        <div className="comunidade-acoes">
          <button
            type="button"
            className="comunidade-icone"
            aria-label="Pesquisar"
            onClick={() =>
              mostrarMensagem(
                "A busca da comunidade ficará disponível em breve."
              )
            }
          >
            ⌕
          </button>

          <button
            type="button"
            className="comunidade-perfil"
            aria-label={
              visitante
                ? "Entrar no Avelune"
                : "Abrir seu perfil"
            }
            onClick={() =>
              onNavigate?.(
                visitante
                  ? "auth-login"
                  : "perfil"
              )
            }
          >
            {visitante ? "ENTRAR" : "VC"}
          </button>
        </div>
      </header>

      <section className="comunidade-conteudo">
        <div className="comunidade-introducao">
          <span>UM LUGAR PARA LEITORES</span>

          <h1>Comunidade</h1>

          <p>
            Compartilhe leituras, encontre pessoas
            que amam as mesmas histórias e descubra
            novos mundos através de quem lê com você.
          </p>
        </div>

        <div className="comunidade-layout">
          <section className="comunidade-feed">
            <div className="comunidade-abas">
              <button
                type="button"
                className={abaComunidade === "publicacoes" ? "ativo" : ""}
                onClick={() => setAbaComunidade("publicacoes")}
              >
                PUBLICAÇÕES
              </button>
              <button
                type="button"
                className={abaComunidade === "resenhas" ? "ativo" : ""}
                onClick={() => setAbaComunidade("resenhas")}
              >
                RESENHAS
              </button>
              <button
                type="button"
                className={abaComunidade === "historias" ? "ativo" : ""}
                onClick={() => setAbaComunidade("historias")}
              >
                HISTÓRIAS
              </button>
            </div>

            {abaComunidade !== "historias" && (
              <>
            <div className="comunidade-feed-topo">
              <div className="comunidade-filtros">
                <button
                  type="button"
                  className={
                    filtro === "para-voce"
                      ? "ativo"
                      : ""
                  }
                  onClick={() =>
                    setFiltro("para-voce")
                  }
                >
                  PARA VOCÊ
                </button>

                <button
                  type="button"
                  className={
                    filtro === "seguindo"
                      ? "ativo"
                      : ""
                  }
                  onClick={() =>
                    setFiltro("seguindo")
                  }
                >
                  SEGUINDO
                </button>

                <button
                  type="button"
                  className={
                    filtro === "recentes"
                      ? "ativo"
                      : ""
                  }
                  onClick={() =>
                    setFiltro("recentes")
                  }
                >
                  RECENTES
                </button>
              </div>

              <span className="comunidade-feed-ornamento">
                ✦
              </span>
            </div>

            <div className="comunidade-publicar">
              <div className="comunidade-avatar pequeno comunidade-avatar-visitante">
                ◌
              </div>

              <div className="comunidade-publicar-corpo">
                <textarea
                  value={texto}
                  readOnly={visitante}
                  onClick={() => {
                    if (visitante) {
                      exigirConta();
                    }
                  }}
                  onFocus={() => {
                    if (visitante) {
                      exigirConta();
                    }
                  }}
                  onChange={(evento) => {
                    if (!visitante) {
                      setTexto(evento.target.value);
                    }
                  }}
                  placeholder={
                    modoResenha
                      ? "Conte como foi sua leitura..."
                      : "Compartilhe uma leitura, uma foto ou o que está pensando..."
                  }
                  maxLength={1000}
                />

                {modoResenha && (
                  <div className="comunidade-resenha-campos">
                    <input
                      value={livroDigitado}
                      onChange={(evento) =>
                        setLivroDigitado(
                          evento.target.value
                        )
                      }
                      placeholder="Nome do livro *"
                      maxLength={100}
                    />

                    <input
                      value={autorDigitado}
                      onChange={(evento) =>
                        setAutorDigitado(
                          evento.target.value
                        )
                      }
                      placeholder="Autor"
                      maxLength={100}
                    />

                    <div className="comunidade-nota">
                      <span>MINHA NOTA</span>

                      <div>
                        {Array.from(
                          { length: 5 },
                          (_, indice) => (
                            <button
                              type="button"
                              key={indice}
                              className={
                                indice <
                                avaliacaoDigitada
                                  ? "ativa"
                                  : ""
                              }
                              onClick={() =>
                                setAvaliacaoDigitada(
                                  indice + 1
                                )
                              }
                              aria-label={`${indice + 1} estrelas`}
                            >
                              ★
                            </button>
                          )
                        )}
                      </div>

                      <strong>
                        {avaliacaoDigitada}/5
                      </strong>
                    </div>
                  </div>
                )}

                {modoProgresso && (
                  <div className="comunidade-progresso-campos">
                    <input
                      value={livroDigitado}
                      onChange={(evento) => setLivroDigitado(evento.target.value)}
                      placeholder="Nome do livro *"
                      maxLength={100}
                    />

                    <input
                      value={capituloDigitado}
                      onChange={(evento) => setCapituloDigitado(evento.target.value)}
                      placeholder="Capítulo atual (ex.: Capítulo 12)"
                      maxLength={100}
                    />

                    <div className="comunidade-progresso-numeros">
                      <label>
                        Página atual
                        <input
                          type="number"
                          min={0}
                          value={paginaAtualDigitada}
                          onChange={(evento) => setPaginaAtualDigitada(Math.max(0, Number(evento.target.value) || 0))}
                        />
                      </label>

                      <label>
                        Total de páginas
                        <input
                          type="number"
                          min={1}
                          value={paginaTotalDigitada || ""}
                          onChange={(evento) => setPaginaTotalDigitada(Math.max(0, Number(evento.target.value) || 0))}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {fotoSelecionada && (
                  <div className="comunidade-preview-foto">
                    <img
                      src={fotoSelecionada}
                      alt="Prévia da foto da publicação"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setFotoSelecionada("")
                      }
                      aria-label="Remover foto"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="comunidade-publicar-rodape">
                  <div>
                    <button
                      type="button"
                      aria-label="Criar resenha"
                      className={
                        modoResenha
                          ? "selecionado"
                          : ""
                      }
                      onClick={() => {
                        if (!exigirConta()) return;
                        setModoResenha((atual) => !atual);
                        setModoProgresso(false);
                      }}
                    >
                      ♧
                    </button>

                    <button
                      type="button"
                      aria-label="Publicar progresso de leitura"
                      className={modoProgresso ? "selecionado" : ""}
                      onClick={() => {
                        if (!exigirConta()) return;
                        setModoProgresso((atual) => !atual);
                        setModoResenha(false);
                      }}
                    >
                      ◷
                    </button>

                    <button
                      type="button"
                      aria-label="Adicionar imagem"
                      onClick={abrirImagem}
                    >
                      ◫
                    </button>

                    <button
                      type="button"
                      aria-label="Adicionar citação"
                      onClick={() => {
                        if (!exigirConta()) {
                          return;
                        }

                        setTexto((atual) =>
                          atual
                            ? `${atual}\n\n“ ”`
                            : "“ ”"
                        );
                      }}
                    >
                      ❝
                    </button>

                    <input
                      ref={inputImagemRef}
                      type="file"
                      accept="image/*"
                      onChange={selecionarImagem}
                      hidden
                    />
                  </div>

                  <div className="comunidade-publicar-botoes">
                    {modoResenha && (
                      <button
                        type="button"
                        className="comunidade-cancelar-resenha"
                        onClick={limparCompositor}
                      >
                        CANCELAR
                      </button>
                    )}

                    <button
                      type="button"
                      className="comunidade-publicar-botao"
                      onClick={publicar}
                    >
                      PUBLICAR
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {mensagem && (
              <div
                role="status"
                className="comunidade-mensagem"
              >
                {mensagem}
              </div>
            )}

            {feed.length === 0 ? (
              <div className="comunidade-post">
                <p className="comunidade-post-texto">
                  Você ainda não segue nenhum leitor.
                  Quando começar a acompanhar pessoas,
                  as publicações delas aparecerão aqui.
                </p>
              </div>
            ) : (
              feed.map((post) => {
                const comentarios =
                  post.comentariosLista ?? [];

                const primeiroComentario =
                  comentarios[0];

                return (
                  <article
                    className="comunidade-post"
                    key={post.id}
                  >
                    <div className="comunidade-post-cabecalho">
                      <div className="comunidade-avatar">
                        {post.iniciais}
                      </div>

                      <div className="comunidade-post-usuario">
                        <strong>
                          {post.usuario}
                        </strong>
                        <span>{post.tempo}</span>
                      </div>

                      <button
                        type="button"
                        className="comunidade-post-menu"
                        aria-label="Mais opções"
                        onClick={() =>
                          mostrarMensagem(
                            "As opções desta publicação serão adicionadas depois."
                          )
                        }
                      >
                        ···
                      </button>
                    </div>

                    {post.foto ? (
                      <div className="comunidade-post-foto">
                        <img
                          src={post.foto}
                          alt={`Publicação de ${post.usuario}`}
                        />
                      </div>
                    ) : (
                      <div
                        className={`comunidade-post-foto comunidade-post-foto--arte ${
                          post.cor ?? "simples"
                        }`}
                      >
                        <div className="comunidade-foto-luz" />
                        <span>
                          {post.simbolo ?? "✦"}
                        </span>
                        {post.livro && (
                          <strong>
                            {post.livro}
                          </strong>
                        )}
                        {post.autorLivro && (
                          <small>
                            {post.autorLivro}
                          </small>
                        )}
                      </div>
                    )}

                    {post.tipo === "progresso" && (
                      <div className="comunidade-post-progresso">
                        <span>PROGRESSO DE LEITURA</span>
                        {post.livro && <strong>{post.livro}</strong>}
                        {post.paginaTotal && (
                          <>
                            <div className="comunidade-progresso-barra">
                              <span
                                style={{
                                  width: `${Math.min(100, Math.round(((post.paginaAtual ?? 0) / post.paginaTotal) * 100))}%`,
                                }}
                              />
                            </div>
                            <small>
                              Página {post.paginaAtual ?? 0} de {post.paginaTotal} · {Math.min(100, Math.round(((post.paginaAtual ?? 0) / post.paginaTotal) * 100))}%
                            </small>
                          </>
                        )}
                      </div>
                    )}

                    <div className="comunidade-post-acoes">
                      <div>
                        <button
                          type="button"
                          className={
                            post.curtido
                              ? "ativo"
                              : ""
                          }
                          onClick={() =>
                            alternarCurtida(
                              post.id
                            )
                          }
                          aria-label="Curtir"
                        >
                          <span>
                            {post.curtido
                              ? "♥"
                              : "♡"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            alternarComentarios(
                              post.id
                            )
                          }
                          aria-label="Comentários"
                        >
                          <span>◌</span>
                        </button>

                        <button
                          type="button"
                          className={
                            post.salva
                              ? "ativo-salvo"
                              : ""
                          }
                          onClick={() =>
                            alternarSalvo(
                              post.id
                            )
                          }
                          aria-label="Salvar"
                        >
                          <span>
                            {post.salva
                              ? "◆"
                              : "◇"}
                          </span>
                        </button>
                      </div>

                      <button
                        type="button"
                        className="compartilhar"
                        onClick={() =>
                          mostrarMensagem(
                            "Compartilhamento ficará disponível quando o sistema de usuários estiver conectado."
                          )
                        }
                        aria-label="Compartilhar"
                      >
                        <span>↗</span>
                      </button>
                    </div>

                    <div className="comunidade-post-curtidas">
                      {post.curtidas}{" "}
                      {post.curtidas === 1
                        ? "curtida"
                        : "curtidas"}
                    </div>

                    <div className="comunidade-post-legenda">
                      <strong>
                        {post.usuario}
                      </strong>{" "}
                      {post.texto}
                    </div>

                    {post.livro && (
                      <div className="comunidade-resenha-livro">
                        <div>
                          <span>
                            RESENHA · LIVRO
                          </span>
                          <strong>
                            {post.livro}
                          </strong>
                          <small>
                            {post.autorLivro ||
                              "Autor não informado"}
                          </small>
                        </div>

                        {post.avaliacao && (
                          <div className="comunidade-avaliacao">
                            <div>
                              {renderEstrelas(
                                post.avaliacao
                              )}
                            </div>
                            <strong>
                              {post.avaliacao}.0
                            </strong>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            onNavigate?.(
                              "biblioteca"
                            )
                          }
                        >
                          VER LIVRO →
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      className="comunidade-ver-comentarios"
                      onClick={() =>
                        alternarComentarios(
                          post.id
                        )
                      }
                    >
                      {post.comentarios > 0
                        ? `Ver todos os ${post.comentarios} comentários`
                        : "Adicionar comentário"}
                    </button>

                    {primeiroComentario &&
                      comentariosAbertos !==
                        post.id && (
                        <div className="comunidade-comentario-preview">
                          <div className="comunidade-avatar mini">
                            {primeiroComentario.usuario
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <p>
                            <strong>
                              {
                                primeiroComentario.usuario
                              }
                            </strong>{" "}
                            {
                              primeiroComentario.texto
                            }
                          </p>
                        </div>
                      )}

                    {comentariosAbertos ===
                      post.id && (
                      <div className="comunidade-comentarios-abertos">
                        {comentarios.length > 0 &&
                          comentarios.map(
                            (comentario) => (
                              <p
                                key={
                                  comentario.id
                                }
                              >
                                <strong>
                                  {
                                    comentario.usuario
                                  }
                                </strong>{" "}
                                {comentario.texto}
                              </p>
                            )
                          )}

                        <div className="comunidade-comentario-form">
                          <div className="comunidade-avatar mini">
                            VC
                          </div>

                          <input
                            value={
                              comentarioDigitado[
                                post.id
                              ] ?? ""
                            }
                            onChange={(evento) =>
                              atualizarComentario(
                                post.id,
                                evento.target.value
                              )
                            }
                            onKeyDown={(evento) => {
                              if (
                                evento.key ===
                                "Enter"
                              ) {
                                evento.preventDefault();
                                adicionarComentario(
                                  post.id
                                );
                              }
                            }}
                            placeholder="Adicione um comentário..."
                            maxLength={500}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              adicionarComentario(
                                post.id
                              )
                            }
                          >
                            ENVIAR
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
            </>
            )}

            {abaComunidade === "historias" && (
              <div className="comunidade-historias">
                <button
                  type="button"
                  className="comunidade-escrever-historia"
                  onClick={() => {
                    if (!exigirConta()) return;
                    setModalHistoriaAberto(true);
                  }}
                >
                  + ESCREVER UMA HISTÓRIA
                </button>

                {historias.length === 0 ? (
                  <div className="comunidade-post">
                    <p className="comunidade-post-texto">
                      Nenhuma história publicada ainda. Que tal ser a primeira?
                    </p>
                  </div>
                ) : (
                  <div className="comunidade-historias-grade">
                    {historias.map((historia) => (
                      <button
                        type="button"
                        key={historia.id}
                        className="comunidade-historia-card"
                        onClick={() => setHistoriaAberta(historia)}
                      >
                        <div className="comunidade-historia-capa">
                          {historia.capa ? (
                            <img src={historia.capa} alt={`Capa de ${historia.titulo}`} />
                          ) : (
                            <span>✦</span>
                          )}
                        </div>
                        <strong>{historia.titulo}</strong>
                        <small>por @{historia.autor}</small>
                        <span className="comunidade-historia-tags">
                          {historia.generos.slice(0, 2).join(" • ")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="comunidade-sidebar">
            <div className="comunidade-card">
              <div className="comunidade-card-titulo">
                <span>✦</span>
                <div>
                  <span>EM DESTAQUE</span>
                  <strong>
                    Leitores da semana
                  </strong>
                </div>
              </div>

              <div className="comunidade-destaque">
                <div className="comunidade-avatar pequeno">
                  LV
                </div>

                <div className="comunidade-destaque-dados">
                  <strong>
                    Luna Valmont
                  </strong>
                  <span>
                    128 curtidas recebidas
                  </span>
                </div>
              </div>

              <div className="comunidade-destaque">
                <div className="comunidade-avatar pequeno">
                  CM
                </div>

                <div className="comunidade-destaque-dados">
                  <strong>
                    Clara Moon
                  </strong>
                  <span>
                    107 interações
                  </span>
                </div>
              </div>

              <div className="comunidade-destaque">
                <div className="comunidade-avatar pequeno">
                  AB
                </div>

                <div className="comunidade-destaque-dados">
                  <strong>
                    Arthur Black
                  </strong>
                  <span>
                    94 curtidas recebidas
                  </span>
                </div>
              </div>
            </div>

            <div className="comunidade-card comunidade-tendencias">
              <div className="comunidade-card-titulo">
                <span>⌁</span>
                <div>
                  <span>
                    AGORA NA COMUNIDADE
                  </span>
                  <strong>
                    Tendências
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="comunidade-sidebar-link"
                onClick={() => {
                  if (!exigirConta()) return;
                  setTexto(
                    "Estou lendo A Corte das Sombras e..."
                  );
                }}
              >
                <span>
                  #ACortedasSombras
                </span>
                <small>
                  128 publicações
                </small>
              </button>

              <button
                type="button"
                className="comunidade-sidebar-link"
                onClick={() => {
                  if (!exigirConta()) return;
                  setTexto(
                    "Qual foi o último livro que..."
                  );
                }}
              >
                <span>
                  #LeituraDoMomento
                </span>
                <small>
                  86 publicações
                </small>
              </button>

              <button
                type="button"
                className="comunidade-sidebar-link"
                onClick={() => {
                  if (!exigirConta()) return;
                  setTexto(
                    "Minha próxima leitura será..."
                  );
                }}
              >
                <span>
                  #ProximaLeitura
                </span>
                <small>
                  54 publicações
                </small>
              </button>
            </div>

            <div className="comunidade-card">
              <div className="comunidade-card-titulo">
                <span>☾</span>
                <div>
                  <span>DESCUBRA</span>
                  <strong>
                    Leitores para seguir
                  </strong>
                </div>
              </div>

              {leitoresParaSeguir.length === 0 ? (
                <p className="comunidade-sidebar-vazio">
                  Não há novos leitores para sugerir no momento.
                </p>
              ) : (
                leitoresParaSeguir.slice(0, 3).map((leitor) => {
                  const estaSeguindo = seguindoIds.has(leitor.id);

                  return (
                    <div
                      className="comunidade-leitor"
                      key={leitor.id}
                    >
                      <div className="comunidade-avatar mini">
                        {leitor.iniciais}
                      </div>

                      <div>
                        <strong>{leitor.nome}</strong>
                        <span>@{leitor.username}</span>
                      </div>

                      <button
                        type="button"
                        className={
                          estaSeguindo
                            ? "seguindo"
                            : ""
                        }
                        onClick={() =>
                          alternarSeguir(leitor.id)
                        }
                      >
                        {estaSeguindo
                          ? "SEGUINDO"
                          : "SEGUIR"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </div>

        {modalHistoriaAberto && (
          <div className="comunidade-historia-modal-fundo" onClick={() => setModalHistoriaAberto(false)}>
            <div className="comunidade-historia-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="comunidade-historia-modal-fechar"
                onClick={() => setModalHistoriaAberto(false)}
              >
                ×
              </button>

              <h2>Nova história</h2>

              <label>Título</label>
              <input value={tituloH} onChange={(e) => setTituloH(e.target.value)} />

              <label>Sinopse</label>
              <textarea value={sinopseH} onChange={(e) => setSinopseH(e.target.value)} />

              <label>Tipo</label>
              <div className="comunidade-historia-radio">
                <button
                  type="button"
                  className={tipoH === "fanfic" ? "ativo" : ""}
                  onClick={() => setTipoH("fanfic")}
                >
                  Fanfic
                </button>
                <button
                  type="button"
                  className={tipoH === "original" ? "ativo" : ""}
                  onClick={() => setTipoH("original")}
                >
                  História original
                </button>
              </div>

              {tipoH === "fanfic" && (
                <>
                  <label>Livro que inspirou</label>
                  <input
                    value={livroInspiracaoH}
                    onChange={(e) => setLivroInspiracaoH(e.target.value)}
                    placeholder="Buscar livro no Avelune..."
                  />
                  <label>Essa história é inspirada em</label>
                  <textarea
                    value={comentarioInspiracaoH}
                    onChange={(e) => setComentarioInspiracaoH(e.target.value)}
                  />
                </>
              )}

              <label>Gêneros</label>
              <div className="comunidade-historia-tags-selecao">
                {GENEROS_HISTORIA.map((genero) => (
                  <button
                    type="button"
                    key={genero}
                    className={generosH.includes(genero) ? "ativo" : ""}
                    onClick={() => alternarGeneroH(genero)}
                  >
                    {genero}
                  </button>
                ))}
              </div>

              <label>Tropes</label>
              <div className="comunidade-historia-tags-selecao">
                {TROPES_SUGERIDOS.map((trope) => (
                  <button
                    type="button"
                    key={trope}
                    className={tropesH.includes(trope) ? "ativo" : ""}
                    onClick={() => alternarTropeH(trope)}
                  >
                    {trope}
                  </button>
                ))}
              </div>

              <label>Classificação</label>
              <div className="comunidade-historia-tags-selecao">
                {CLASSIFICACOES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={classificacaoH === c ? "ativo" : ""}
                    onClick={() => setClassificacaoH(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <label>Elenco imaginado</label>
              <div className="comunidade-historia-personagens-lista">
                {personagensH.map((p) => (
                  <div key={p.id} className="comunidade-historia-personagem-chip">
                    <strong>{p.nome}</strong>
                    {p.faceClaim && <small>Face claim: {p.faceClaim}</small>}
                    <button type="button" onClick={() => removerPersonagem(p.id)}>×</button>
                  </div>
                ))}
              </div>

              <div className="comunidade-historia-novo-personagem">
                <input
                  value={novoPersonagemNome}
                  onChange={(e) => setNovoPersonagemNome(e.target.value)}
                  placeholder="Nome do personagem"
                />
                <input
                  value={novoPersonagemFaceClaim}
                  onChange={(e) => setNovoPersonagemFaceClaim(e.target.value)}
                  placeholder="Inspirado visualmente em..."
                />
                <button type="button" onClick={adicionarPersonagem}>+ ADICIONAR PERSONAGEM</button>
              </div>

              <button type="button" className="comunidade-historia-publicar" onClick={publicarHistoria}>
                PUBLICAR
              </button>
            </div>
          </div>
        )}

        {mostrarAvisoConta && (
          <div
            className="comunidade-conta-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="comunidade-conta-titulo"
          >
            <div className="comunidade-conta-modal">
              <button
                type="button"
                className="comunidade-conta-fechar"
                onClick={() => setMostrarAvisoConta(false)}
                aria-label="Fechar aviso"
              >
                ×
              </button>

              <span className="comunidade-conta-simbolo">✦</span>

              <span className="comunidade-conta-legenda">
                UM LUGAR PARA LEITORES
              </span>

              <h2 id="comunidade-conta-titulo">
                Crie sua conta para participar.
              </h2>

              <p>
                Para publicar fotos, escrever resenhas,
                curtir e conversar com outros leitores,
                você precisa ter uma conta no Avelune.
              </p>

              <button
                type="button"
                className="comunidade-conta-botao"
                onClick={() => {
                  setMostrarAvisoConta(false);
                  onNavigate?.("auth-cadastro");
                }}
              >
                CRIAR MINHA CONTA <span>→</span>
              </button>

              <button
                type="button"
                className="comunidade-conta-voltar"
                onClick={() => setMostrarAvisoConta(false)}
              >
                CONTINUAR LENDO
              </button>
            </div>
          </div>
        )}

        <footer className="comunidade-rodape">
          <span>AVELUNE</span>
          <span>
            UM LUGAR PARA QUEM AMA HISTÓRIAS
          </span>
          <span>✦</span>
        </footer>
      </section>
    </main>
  );
}

export default Comunidade;
