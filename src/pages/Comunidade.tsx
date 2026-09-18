import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import "./Comunidade.css";
import "./ComunidadeCapituloEditor.css";
import AveluneHeader from "../components/AveluneHeader";
import { useLivros } from "../hooks/useLivros";
import { supabase } from "../lib/supabase";

type Pagina =
  | "inicio"
  | "biblioteca"
  | "comunidade"
  | "grupos"
  | "perfil"
  | "auth-cadastro"
  | "auth-login";

type Filtro =
  | "para-voce"
  | "seguindo"
  | "recentes";

type Comentario = {
  id: number;
  usuario: string;
  texto: string;
};
type Personagem = {
  id: number;
  nome: string;
  faceClaim?: string;
  foto?: string;
  descricao?: string;
};

type Capitulo = {
  id: number;
  titulo: string;
  conteudo: string;
  publicado: boolean;
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
  gatilhos: string[];
  classificacao: string;
  capa?: string;
  personagens: Personagem[];
  autor: string;
  autorIniciais: string;
  curtidas: number;
  salva: boolean;
  capitulos: Capitulo[];
};

type AbaComunidade = "publicacoes" | "resenhas" | "historias";

const STORAGE_HISTORIAS = "avelune-comunidade-historias";

const GENEROS_HISTORIA = [
  "Fantasia", "Romance", "Dark Romance", "Mistério", "Terror", "Ficção", "Aventura",
];

const VIBES_RESENHA = [
  "Slow Burn", "Enemies to Lovers", "Dark Romance", "Morally Gray MC",
  "Angst", "Fluff", "Spice", "Plot Twist", "Final Feliz", "Final Trágico",
];
const TROPES_DARK_ROMANCE = [
  "Abuso",
  "Age Gap",
  "Age Gap Reverso",
  "Bully Romance",
  "Casamento Arranjado",
  "CEO",
  "Dark Romance",
  "Dark Taboo",
  "Hackers",
  "Máfia",
  "Possessivos",
  "Sequestro",
  "Serial Killer",
  "Sociedades Secretas",
  "Stalker",
  "Trisal",
  "Vilão fica com a garota",
];

const TROPES_CONTEMPORANEO = [
  "Bebê Secreto",
  "Cowboy",
  "Dark Academia",
  "Enemies to Lovers",
  "Escola/Faculdade",
  "Fake Dating",
  "Friends to Lovers",
  "Grumpy X Sunshine",
  "Guarda Costas",
  "Pais Solteiros",
  "Plus Size",
  "Professor X Aluna",
  "Rockstars",
];

const TROPES_FANTASIA = [
  "Alien Romance",
  "Demônios",
  "Faes e Feéricos",
  "Lobos e Shifters",
  "Mitologia",
  "Monster Romance",
  "Shifters",
  "Vampiros",
];

const GATILHOS = [
  "Abuso",
  "BDSM",
  "Blood Play",
  "CNC",
  "Exibicionismo",
  "Fear Play",
  "Kink",
  "Knife Play",
  "Mask Kink",
  "Pegging",
  "Praise Kink",
  "Role Play",
  "Submissão - Homens",
  "Voyeurismo",
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
type Publicacao = {
  id: number;
  usuario: string;
  iniciais: string;
  tempo: string;
  texto: string;
  livro?: string;
  autorLivro?: string;
  linkLivro?: string;
  avaliacao?: number;
  tags?: string[];
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
};

type ComunidadeProps = {
  onNavigate?: (pagina: Pagina) => void;
};

const STORAGE_POSTS =
  "avelune-comunidade-postagens";

const STORAGE_SALVOS =
  "avelune-comunidade-salvos";

const postagensIniciais: Publicacao[] = [];
function carregarPostagens(): Publicacao[] {
  try {
    const salvas =
      localStorage.getItem(STORAGE_POSTS);

    if (salvas) {
      const dados = JSON.parse(salvas);

      if (Array.isArray(dados)) {
        return dados;
      }
    }
  } catch {
    // Usa os dados iniciais.
  }

  return postagensIniciais;
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

function Comunidade({
  onNavigate,
}: ComunidadeProps) {

  const [usuarioAtual, setUsuarioAtual] = useState<any>(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      const { data } = await supabase.auth.getSession();

      if (!ativo) return;

      setUsuarioAtual(data.session?.user ?? null);
      setCarregandoAuth(false);
    }

    verificarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setUsuarioAtual(sessao?.user ?? null);
      setCarregandoAuth(false);
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);
  const [postagens, setPostagens] =
    useState<Publicacao[]>(
      carregarPostagens
    );

  const [abaComunidade, setAbaComunidade] = useState<AbaComunidade>("publicacoes");

  const [historias, setHistorias] = useState<Historia[]>(carregarHistorias);

  const { livros, carregando: livrosCarregando, erro: livrosErro } = useLivros();
  const [buscaLivroResenha, setBuscaLivroResenha] = useState("");
  const [subAbaResenha, setSubAbaResenha] = useState<"biblioteca" | "link">("biblioteca");
  const [linkLivroDigitado, setLinkLivroDigitado] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORIAS, JSON.stringify(historias));
    } catch {
      // sem ação
    }
  }, [historias]);

  const [seletorLivroAberto, setSeletorLivroAberto] = useState(false);
  const seletorLivroRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!seletorLivroAberto) return;
  function aoClicarFora(evento: MouseEvent) {
    if (seletorLivroRef.current && !seletorLivroRef.current.contains(evento.target as Node)) {
      setSeletorLivroAberto(false);
    }
  }
  document.addEventListener("mousedown", aoClicarFora);
  return () => document.removeEventListener("mousedown", aoClicarFora);
}, [seletorLivroAberto]);

  // modal de criação
  const [modalHistoriaAberto, setModalHistoriaAberto] = useState(false);
  const [historiaEditandoId, setHistoriaEditandoId] = useState<number | null>(null);
  const [tituloH, setTituloH] = useState("");
  const [sinopseH, setSinopseH] = useState("");
  const [tipoH, setTipoH] = useState<"fanfic" | "original">("fanfic");
  const [livroInspiracaoH, setLivroInspiracaoH] = useState("");
  const [comentarioInspiracaoH, setComentarioInspiracaoH] = useState("");
  const [generosH, setGenerosH] = useState<string[]>([]);
  const [tropesH, setTropesH] = useState<string[]>([]);
  const [gatilhosH, setGatilhosH] = useState<string[]>([]);
  const [classificacaoH, setClassificacaoH] = useState("Livre");
  const [capaH, setCapaH] = useState("");
  const [personagensH, setPersonagensH] = useState<Personagem[]>([]);
  const [novoPersonagemNome, setNovoPersonagemNome] = useState("");
  const [novoPersonagemFaceClaim, setNovoPersonagemFaceClaim] = useState("");
  const [novoPersonagemDescricao, setNovoPersonagemDescricao] = useState("");
  const [historiaAberta, setHistoriaAberta] = useState<Historia | null>(null);
  const [capituloDepoisTitulo, setCapituloDepoisTitulo] = useState("");
  const [capituloDepoisConteudo, setCapituloDepoisConteudo] = useState("");
  const editorCapituloRef = useRef<HTMLDivElement | null>(null);

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
  function alternarGatilhoH(gatilho: string) {
    setGatilhosH((atual) =>
      atual.includes(gatilho)
        ? atual.filter((g) => g !== gatilho)
        : [...atual, gatilho]
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
    setGatilhosH([]);
    setClassificacaoH("Livre");
    setCapaH("");
    setPersonagensH([]);
  }

  function executarComandoEditor(comando: string, valor?: string) {
    editorCapituloRef.current?.focus();
    document.execCommand(comando, false, valor);
    setCapituloDepoisConteudo(editorCapituloRef.current?.innerHTML ?? "");
  }

  function atualizarConteudoCapitulo() {
    setCapituloDepoisConteudo(editorCapituloRef.current?.innerHTML ?? "");
  }

  function limparHtmlCapitulo(html: string) {
    if (typeof window === "undefined") return html;

    const documento = new DOMParser().parseFromString(html, "text/html");
    const tagsPermitidas = new Set([
      "B", "STRONG", "I", "EM", "U", "S", "P", "BR", "H1", "H2",
      "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "DIV", "SPAN", "FONT",
    ]);

    documento.body.querySelectorAll("*").forEach((elemento) => {
      if (!tagsPermitidas.has(elemento.tagName)) {
        elemento.replaceWith(...Array.from(elemento.childNodes));
        return;
      }

      Array.from(elemento.attributes).forEach((atributo) => {
        const nome = atributo.name.toLowerCase();
        let permitido = false;

        if (elemento.tagName === "FONT" && ["face", "size", "color"].includes(nome)) {
          permitido = true;
        }

        if (["align"].includes(nome) && ["left", "center", "right", "justify"].includes(atributo.value.toLowerCase())) {
          permitido = true;
        }

        if (nome === "style") {
          const estilosPermitidos = atributo.value
            .split(";")
            .map((regra) => regra.trim())
            .filter((regra) => {
              const [propriedade, valor] = regra.split(":").map((parte) => parte.trim().toLowerCase());
              if (!propriedade || !valor) return false;

              if (propriedade === "text-align") {
                return ["left", "center", "right", "justify"].includes(valor);
              }

              if (propriedade === "text-indent" || propriedade === "margin-left" || propriedade === "margin-right") {
                return /^\d+(?:\.\d+)?(?:px|em|rem|%)$/.test(valor);
              }

              if (propriedade === "line-height") {
                return /^(?:\d+(?:\.\d+)?|\d+(?:\.\d+)?(?:px|em|rem))$/.test(valor);
              }

              return false;
            });

          if (estilosPermitidos.length > 0) {
            elemento.setAttribute("style", estilosPermitidos.join("; "));
            permitido = true;
          } else {
            elemento.removeAttribute("style");
          }
        }

        if (!permitido && nome !== "style") elemento.removeAttribute(nome);
      });
    });

    return documento.body.innerHTML;
  }

  function adicionarCapituloDepois() {
    if (!historiaAberta) return;

    const titulo = capituloDepoisTitulo.trim();
    const htmlBruto = editorCapituloRef.current?.innerHTML ?? capituloDepoisConteudo;
    const conteudo = limparHtmlCapitulo(htmlBruto);
    const textoSemMarcacao = editorCapituloRef.current?.innerText.trim() ??
      conteudo.replace(/<[^>]*>/g, "").trim();

    if (!titulo || !textoSemMarcacao) {
      mostrarMensagem("Preencha o título e o conteúdo do capítulo.");
      return;
    }

    const novoCapitulo: Capitulo = {
      id: Date.now(),
      titulo,
      conteudo,
      publicado: true,
    };

    setHistorias((atuais) =>
      atuais.map((historia) =>
        historia.id === historiaAberta.id
          ? { ...historia, capitulos: [...historia.capitulos, novoCapitulo] }
          : historia
      )
    );

    setHistoriaAberta((atual) =>
      atual
        ? { ...atual, capitulos: [...atual.capitulos, novoCapitulo] }
        : atual
    );

    setCapituloDepoisTitulo("");
    setCapituloDepoisConteudo("");
    if (editorCapituloRef.current) editorCapituloRef.current.innerHTML = "";
    mostrarMensagem("Capítulo adicionado à história.");
  }

  function editarHistoria(historia: Historia) {
    setHistoriaEditandoId(historia.id);
    setTituloH(historia.titulo);
    setSinopseH(historia.sinopse);
    setTipoH(historia.tipo);
    setLivroInspiracaoH(historia.livroInspiracao ?? "");
    setComentarioInspiracaoH(historia.comentarioInspiracao ?? "");
    setGenerosH(historia.generos);
    setTropesH(historia.tropes);
    setGatilhosH(historia.gatilhos);
    setClassificacaoH(historia.classificacao);
    setCapaH(historia.capa ?? "");
    setPersonagensH(historia.personagens);
    setHistoriaAberta(null);
    setModalHistoriaAberto(true);
  }

  function publicarHistoria() {
    if (!exigirConta()) return;

    if (!tituloH.trim()) {
      mostrarMensagem("Dê um título para sua história.");
      return;
    }

    if (historiaEditandoId !== null) {
      setHistorias((atuais) =>
        atuais.map((historia) =>
          historia.id === historiaEditandoId
            ? {
                ...historia,
                titulo: tituloH.trim(),
                sinopse: sinopseH,
                tipo: tipoH,
                livroInspiracao: livroInspiracaoH,
                comentarioInspiracao: comentarioInspiracaoH,
                generos: generosH,
                tropes: tropesH,
                gatilhos: gatilhosH,
                classificacao: classificacaoH,
                capa: capaH,
                personagens: personagensH,
              }
            : historia
        )
      );
      limparFormularioHistoria();
      setHistoriaEditandoId(null);
      setModalHistoriaAberto(false);
      mostrarMensagem("Sua história foi atualizada.");
      return;
    }

    const nova: Historia = {
      id: Date.now(),
      titulo: tituloH.trim(),
      sinopse: sinopseH,
      tipo: tipoH,
      livroInspiracao: livroInspiracaoH,
      comentarioInspiracao: comentarioInspiracaoH,
      generos: generosH,
      tropes: tropesH,
      gatilhos: gatilhosH,
      classificacao: classificacaoH,
      capa: capaH,
      personagens: personagensH,
      autor: "Você",
      autorIniciais: "VC",
      curtidas: 0,
      salva: false,
      capitulos: [],
    };

    setHistorias((atual) => [nova, ...atual]);
    limparFormularioHistoria();
    setHistoriaEditandoId(null);
    setModalHistoriaAberto(false);
    mostrarMensagem("Sua história foi publicada.");
  }

  const [filtro, setFiltro] =
    useState<Filtro>("para-voce");

  const [texto, setTexto] =
    useState("");

  const [livroDigitado, setLivroDigitado] =
    useState("");

  const [autorDigitado, setAutorDigitado] =
    useState("");

  const [avaliacaoDigitada, setAvaliacaoDigitada] =
    useState(5);

  const [tagsResenha, setTagsResenha] =
    useState<string[]>([]);

  function alternarTagResenha(tag: string) {
    setTagsResenha((atual) =>
      atual.includes(tag) ? atual.filter((t) => t !== tag) : [...atual, tag]
    );
  }

  const [modoResenha, setModoResenha] =
    useState(false);

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

  const inputImagemRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_POSTS,
        JSON.stringify(postagens)
      );
    } catch {
      setMensagem(
        "A postagem foi criada, mas a imagem não pôde ser salva no navegador."
      );
    }
  }, [postagens]);

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

  function estaAutenticado() {
  return usuarioAtual !== null;
  }

  function exigirConta() {
    if (estaAutenticado()) {
      return true;
    }

    setMostrarAvisoConta(true);
    return false;
  }

  const visitante = !estaAutenticado();

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

  // DIVIDE O FEED ENTRE PUBLICAÇÕES E RESENHAS
  const feedPublicacoes = useMemo(
    () => feed.filter((post) => !post.livro),
    [feed]
  );

  const feedResenhas = useMemo(
    () => feed.filter((post) => Boolean(post.livro)),
    [feed]
  );

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
    mostrarMensagem(
      "Modo resenha ativado. Adicione o livro, sua nota e conte como foi a leitura."
    );
  }

  function limparCompositor() {
    setTexto("");
    setLivroDigitado("");
    setAutorDigitado("");
    setLinkLivroDigitado("");
    setAvaliacaoDigitada(5);
    setFotoSelecionada("");
    setModoResenha(false);
    setTagsResenha([]);
  }

  function publicar() {
    if (!exigirConta()) {
      return;
    }

    const textoLimpo = texto.trim();
    const livroLimpo = livroDigitado.trim();
    const autorLimpo = autorDigitado.trim();
    const linkLivroLimpo = linkLivroDigitado.trim();

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

    if (modoResenha && !livroLimpo) {
      mostrarMensagem(
        "Informe qual livro você está resenhando."
      );
      return;
    }

    const novaPostagem: Publicacao = {
      id: Date.now(),
      usuario: "Você",
      iniciais: "VC",
      tempo: "agora",
      texto:
        textoLimpo ||
        "Minha nova leitura no Avelune.",
      livro: livroLimpo || undefined,
      autorLivro:
        autorLimpo || undefined,
      linkLivro:
        linkLivroLimpo || undefined,
          avaliacao:
        livroLimpo
          ? avaliacaoDigitada
          : undefined,
      tags:
        modoResenha && tagsResenha.length > 0
          ? tagsResenha
          : undefined,
      foto: fotoSelecionada || undefined,
      curtidas: 0,
      comentarios: 0,
      curtido: false,
      salva: false,
      seguindo: true,
      origemUsuario: true,
      comentariosLista: [],
    };

    setPostagens((atual) => [
      novaPostagem,
      ...atual,
    ]);

    limparCompositor();
    mostrarMensagem(
      "Sua publicação foi adicionada à comunidade."
    );
  }

  function alternarCurtida(id: number) {
    if (!exigirConta()) {
      return;
    }

    setPostagens((atual) =>
      atual.map((post) => {
        if (post.id !== id) {
          return post;
        }

        return {
          ...post,
          curtido: !post.curtido,
          curtidas: post.curtido
            ? Math.max(
              0,
              post.curtidas - 1
            )
            : post.curtidas + 1,
        };
      })
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

  function adicionarComentario(id: number) {
    if (!exigirConta()) {
      return;
    }

    const novoTexto =
      comentarioDigitado[id]?.trim();

    if (!novoTexto) {
      return;
    }

    setPostagens((atual) =>
      atual.map((post) => {
        if (post.id !== id) {
          return post;
        }

        const comentariosExistentes =
          post.comentariosLista ?? [];

        return {
          ...post,
          comentarios:
            post.comentarios + 1,
          comentariosLista: [
            ...comentariosExistentes,
            {
              id: Date.now(),
              usuario: "Você",
              texto: novoTexto,
            },
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

  function renderPost(post: Publicacao) {
    const comentarios = post.comentariosLista ?? [];
    const primeiroComentario = comentarios[0];

    return (
      <article className="comunidade-post" key={post.id}>
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
                        className={`comunidade-post-foto comunidade-post-foto--arte ${post.cor ?? "simples"
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
                          {post.linkLivro && (
                            <a
                              href={post.linkLivro}
                              target="_blank"
                              rel="noreferrer"
                              className="comunidade-link-livro"
                            >
                              VER LIVRO ↗
                            </a>
                          )}
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

                    {post.tags && post.tags.length > 0 && (
                      <div className="comunidade-post-tags">
                        {post.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
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
  }

  const destaquesReais = [...postagens].sort((a, b) => b.curtidas - a.curtidas).slice(0, 3);

  const leitoresReais = Array.from(new Map(postagens.map((post) => [post.usuario, { usuario: post.usuario, iniciais: post.iniciais, seguindo: post.seguindo ?? false }])).values()).slice(0, 3);

  const contagemHashtags = new Map<string, number>();
  postagens.forEach((post) => {
    const hashtags = post.texto.match(/#[\wÀ-ÿ]+/g) ?? [];
    hashtags.forEach((hashtag) => {
      const normalizada = hashtag.toLowerCase();
      contagemHashtags.set(normalizada, (contagemHashtags.get(normalizada) ?? 0) + 1);
    });
  });
  const tendenciasReais = Array.from(contagemHashtags.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <main className="comunidade">
      <div className="comunidade-particulas">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <AveluneHeader
        paginaAtual="comunidade"
        onNavigate={(pagina) => onNavigate?.(pagina)}
      />

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

        <div className="comunidade-abas-principais">
          <button type="button" className={abaComunidade === "publicacoes" ? "ativo" : ""} onClick={() => setAbaComunidade("publicacoes")}>
            PUBLICAÇÕES
          </button>
          <button type="button" className={abaComunidade === "resenhas" ? "ativo" : ""} onClick={() => setAbaComunidade("resenhas")}>
            RESENHAS
          </button>
          <button type="button" className={abaComunidade === "historias" ? "ativo" : ""} onClick={() => setAbaComunidade("historias")}>
            HISTÓRIAS
          </button>
        </div>

        <div className="comunidade-layout">
          <section className="comunidade-feed">
            {abaComunidade === "publicacoes" && (
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
             {!carregandoAuth && usuarioAtual && (
      
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

                    <input
                      type="url"
                      value={linkLivroDigitado}
                      onChange={(evento) =>
                        setLinkLivroDigitado(evento.target.value)
                      }
                      placeholder="Link do livro (opcional)"
                      maxLength={500}
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
                                indice < avaliacaoDigitada
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

                                      <div className="comunidade-resenha-vibes">
                      <span>VIBE DESSA LEITURA</span>
                      <div className="comunidade-resenha-vibes-lista">
                        {VIBES_RESENHA.map((tag) => (
                          <button
                            type="button"
                            key={tag}
                            className={
                              tagsResenha.includes(tag) ? "ativo" : ""
                            }
                            onClick={() => alternarTagResenha(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
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
                      title="Criar resenha de um livro"
                      className={
                        modoResenha
                          ? "selecionado"
                          : ""
                      }
                      onClick={ativarResenha}
                    >
                      ♧
                    </button>

                    <button
                      type="button"
                      aria-label="Adicionar imagem"
                      title="Adicionar foto"
                      onClick={abrirImagem}
                    >
                      ◫
                    </button>

                    <button
                      type="button"
                      aria-label="Adicionar citação"
                      title="Inserir citação"
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
            )}

            {mensagem && (
              <div
                role="status"
                className="comunidade-mensagem"
              >
                {mensagem}
              </div>
            )}

            {feedPublicacoes.length === 0 ? (
              <div className="comunidade-post">
                <p className="comunidade-post-texto">
                  Você ainda não segue nenhum leitor.
                  Quando começar a acompanhar pessoas,
                  as publicações delas aparecerão aqui.
                </p>
              </div>
            ) : (
              feedPublicacoes.map((post) => renderPost(post))
            )}
              </>
            )}

            {abaComunidade === "resenhas" && (
              <div className="comunidade-resenhas-area">
                <section className="comunidade-livros-resenha">
                  <div className="comunidade-secao-cabecalho">
                    <div>
                      <span>✦</span>
                      <div>
                        <small>ESCOLHA COMO COMEÇAR</small>
                        <h2>Escreva uma resenha</h2>
                      </div>
                    </div>
                    <p>Escolha um livro da Biblioteca ou informe o link de qualquer livro.</p>
                  </div>

                  <div className="comunidade-submenu-resenha" role="tablist" aria-label="Origem do livro">
                    <button
                      type="button"
                      className={subAbaResenha === "biblioteca" ? "ativo" : ""}
                      onClick={() => setSubAbaResenha("biblioteca")}
                    >
                      DA BIBLIOTECA
                    </button>
                    <button
                      type="button"
                      className={subAbaResenha === "link" ? "ativo" : ""}
                      onClick={() => setSubAbaResenha("link")}
                    >
                      USAR LINK
                    </button>
                  </div>

                    {subAbaResenha === "biblioteca" ? (
  <div className="comunidade-seletor-livro" ref={seletorLivroRef}>
    <button
      type="button"
      className={`comunidade-seletor-livro-botao ${seletorLivroAberto ? "aberto" : ""}`}
      onClick={() => setSeletorLivroAberto((atual) => !atual)}
    >
      <span className="comunidade-seletor-placeholder">
        Selecionar livro da biblioteca...
      </span>
      <span className="comunidade-seletor-livro-seta">
        {seletorLivroAberto ? "▲" : "▼"}
      </span>
    </button>

    {seletorLivroAberto && (
      <div className="comunidade-seletor-livro-painel">
        <input
          className="comunidade-seletor-livro-busca"
          value={buscaLivroResenha}
          onChange={(evento) => setBuscaLivroResenha(evento.target.value)}
          placeholder="Buscar livro ou autor..."
          aria-label="Buscar livro para fazer uma resenha"
          autoFocus
        />

        {livrosCarregando ? (
          <p className="comunidade-seletor-livro-vazio">Carregando livros...</p>
        ) : livrosErro ? (
          <p className="comunidade-seletor-livro-vazio">{livrosErro}</p>
        ) : (
          <div className="comunidade-seletor-livro-lista">
            {livros
              .filter((livro) => {
                const termo = buscaLivroResenha.trim().toLowerCase();
                return (
                  !termo ||
                  livro.titulo.toLowerCase().includes(termo) ||
                  livro.autor.toLowerCase().includes(termo)
                );
              })
              .map((livro) => (
                <button
                  type="button"
                  className="comunidade-seletor-livro-item"
                  key={livro.titulo}
                  onClick={() => {
                    if (!exigirConta()) return;
                    setLivroDigitado(livro.titulo);
                    setAutorDigitado(livro.autor);
                    setLinkLivroDigitado("");
                    setModoResenha(true);
                    setSeletorLivroAberto(false);
                    setAbaComunidade("publicacoes");
                    mostrarMensagem(`Livro selecionado: ${livro.titulo}`);
                  }}
                >
                  <strong>{livro.titulo}</strong>
                  <small>{livro.autor} · {livro.genero}</small>
                </button>
              ))}

            {livros.filter((livro) => {
              const termo = buscaLivroResenha.trim().toLowerCase();
              return (
                !termo ||
                livro.titulo.toLowerCase().includes(termo) ||
                livro.autor.toLowerCase().includes(termo)
              );
            }).length === 0 && (
              <p className="comunidade-seletor-livro-vazio">Nenhum livro encontrado.</p>
            )}
          </div>
        )}
      </div>
    )}
  </div>
) : (
                    <div className="comunidade-resenha-link-form">
                      <label>Nome do livro *
                        <input
                          value={livroDigitado}
                          onChange={(evento) => setLivroDigitado(evento.target.value)}
                          placeholder="Digite o nome do livro"
                          maxLength={150}
                        />
                      </label>
                      <label>Autor
                        <input
                          value={autorDigitado}
                          onChange={(evento) => setAutorDigitado(evento.target.value)}
                          placeholder="Nome do autor"
                          maxLength={120}
                        />
                      </label>
                      <label>Link do livro *
                        <input
                          type="url"
                          value={linkLivroDigitado}
                          onChange={(evento) => setLinkLivroDigitado(evento.target.value)}
                          placeholder="https://..."
                          required
                        />
                      </label>
                      <button
                        type="button"
                        className="comunidade-usar-livro-link"
                        onClick={() => {
                          if (!exigirConta()) return;
                          if (!livroDigitado.trim() || !linkLivroDigitado.trim()) {
                            mostrarMensagem("Informe o nome e o link do livro.");
                            return;
                          }
                          setModoResenha(true);
                          setAbaComunidade("publicacoes");
                          mostrarMensagem("Livro por link selecionado. Complete sua resenha.");
                        }}
                      >
                        CONTINUAR COM ESTE LIVRO →
                      </button>
                    </div>
                  )}
                </section>

                <div className="comunidade-resenhas-publicadas">
                  <div className="comunidade-secao-cabecalho">
                    <div>
                      <span>02</span>
                      <h2>Resenhas da comunidade</h2>
                    </div>
                  </div>
                {feedResenhas.length === 0 ? (
                  <div className="comunidade-post">
                    <p className="comunidade-post-texto">Nenhuma resenha por aqui ainda.</p>
                  </div>
                ) : (
                  feedResenhas.map((post) => renderPost(post))
                )}
                </div>
              </div>
            )}
            {abaComunidade === "historias" && (
              <div className="comunidade-historias">
                {!carregandoAuth && usuarioAtual && (
                  <button
                    type="button"
                    className="comunidade-escrever-historia"
                    onClick={() => setModalHistoriaAberto(true)}
                    style={{ position: "relative", zIndex: 100001, pointerEvents: "auto", cursor: "pointer" }}
                  >
                    + ESCREVER UMA HISTÓRIA
                  </button>
                )}

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
              <div className="comunidade-card-titulo"><span>✦</span><div><span>EM DESTAQUE</span><strong>Leitores da semana</strong></div></div>
              {destaquesReais.length === 0 ? <p className="comunidade-sidebar-vazio">Os destaques aparecerão quando houver interações reais.</p> : <div className="comunidade-destaques-lista">{destaquesReais.map((post) => <div key={post.id} className="comunidade-destaque"><div className="comunidade-destaque-avatar">{post.iniciais}</div><div className="comunidade-destaque-dados"><strong>@{post.usuario}</strong><span>{post.curtidas} {post.curtidas === 1 ? "curtida" : "curtidas"}</span></div></div>)}</div>}
            </div>
            <div className="comunidade-card comunidade-tendencias">
              <div className="comunidade-card-titulo"><span>⌁</span><div><span>AGORA NA COMUNIDADE</span><strong>Tendências</strong></div></div>
              {tendenciasReais.length === 0 ? <p className="comunidade-sidebar-vazio">As tendências aparecerão conforme os leitores utilizarem hashtags.</p> : <div className="comunidade-tendencias-lista">{tendenciasReais.map(([hashtag, quantidade]) => <div key={hashtag} className="comunidade-tendencia-item"><strong>{hashtag}</strong><span>{quantidade} {quantidade === 1 ? "publicação" : "publicações"}</span></div>)}</div>}
            </div>
            <div className="comunidade-card">
              <div className="comunidade-card-titulo"><span>☾</span><div><span>DESCUBRA</span><strong>Leitores para seguir</strong></div></div>
              {leitoresReais.length === 0 ? <p className="comunidade-sidebar-vazio">Novos leitores aparecerão aqui quando começarem a publicar.</p> : <div className="comunidade-leitores-lista">{leitoresReais.map((leitor) => <div key={leitor.usuario} className="comunidade-leitor"><div className="comunidade-avatar mini">{leitor.iniciais}</div><div><strong>@{leitor.usuario}</strong><span>Leitor da comunidade</span></div><button type="button" onClick={() => { if (!exigirConta()) return; mostrarMensagem("O sistema de seguidores será conectado ao perfil do usuário."); }}>{leitor.seguindo ? "SEGUINDO" : "SEGUIR"}</button></div>)}</div>}
            </div>
          </aside>
        </div>

        {modalHistoriaAberto && (
          <div
            className="comunidade-historia-modal-fundo"
            onClick={() => setModalHistoriaAberto(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
              pointerEvents: "auto",
            }}
          >
            <div
              className="comunidade-historia-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                zIndex: 100000,
                pointerEvents: "auto",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <button
                type="button"
                className="comunidade-historia-modal-fechar"
                onClick={() => setModalHistoriaAberto(false)}
              >
                ×
              </button>

              <h2>{historiaEditandoId !== null ? "Editar história" : "Nova história"}</h2>

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

             <label>Tropes — Dark Romance</label>
<div className="comunidade-historia-tags-selecao">
  {TROPES_DARK_ROMANCE.map((trope) => (
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

<label>Tropes — Romance Contemporâneo</label>
<div className="comunidade-historia-tags-selecao">
  {TROPES_CONTEMPORANEO.map((trope) => (
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

<label>Tropes — Fantasia e Distopia</label>
<div className="comunidade-historia-tags-selecao">
  {TROPES_FANTASIA.map((trope) => (
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

              <label>Gatilhos de conteúdo</label>

<div className="comunidade-historia-tags-selecao">
  {GATILHOS.map((gatilho) => (
    <button
      key={gatilho}
      type="button"
      className={
        gatilhosH.includes(gatilho)
          ? "selecionado"
          : ""
      }
      onClick={() => alternarGatilhoH(gatilho)}
    >
      {gatilho}
    </button>
  ))}
</div>

              <label>Capa da história</label>
              <input
                type="file"
                accept="image/*"
                onChange={(evento: ChangeEvent<HTMLInputElement>) => {
                  const arquivo = evento.target.files?.[0];
                  if (!arquivo) return;

                  const leitor = new FileReader();
                  leitor.onload = () => {
                    if (typeof leitor.result === "string") {
                      setCapaH(leitor.result);
                    }
                  };
                  leitor.readAsDataURL(arquivo);
                }}
              />

              {capaH && (
                <img
                  src={capaH}
                  alt="Prévia da capa"
                  style={{ width: "140px", maxHeight: "200px", objectFit: "cover" }}
                />
              )}

              <p style={{ marginTop: "1rem", opacity: 0.75 }}>
                Você poderá adicionar os capítulos depois que a história for publicada.
              </p>

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
                {historiaEditandoId !== null ? "SALVAR ALTERAÇÕES" : "PUBLICAR"}
              </button>
            </div>
          </div>
        )}

        {historiaAberta && (
          <div
            className="comunidade-historia-modal-fundo"
            onClick={() => setHistoriaAberta(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
              background: "rgba(0,0,0,0.78)",
              padding: "1rem",
            }}
          >
            <div
              className="comunidade-historia-modal"
              onClick={(evento) => evento.stopPropagation()}
              style={{
                position: "relative",
                zIndex: 100001,
                width: "min(760px, 100%)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <button
                type="button"
                className="comunidade-historia-modal-fechar"
                onClick={() => setHistoriaAberta(null)}
              >
                ×
              </button>

              <h2>{historiaAberta.titulo}</h2>
              <p>{historiaAberta.sinopse}</p>

              {usuarioAtual && historiaAberta.autor === "Você" && (
                <button
                  type="button"
                  onClick={() => editarHistoria(historiaAberta)}
                >
                  ✎ EDITAR HISTÓRIA
                </button>
              )}

              <h3>Capítulos publicados</h3>
              {historiaAberta.capitulos.length === 0 ? (
                <p>Ainda não há capítulos publicados.</p>
              ) : (
                <div>
                  {historiaAberta.capitulos.map((capitulo, indice) => (
                    <article key={capitulo.id} style={{ marginBottom: "1rem" }}>
                      <strong>{indice + 1}. {capitulo.titulo}</strong>
                      {/<[a-z][\s\S]*>/i.test(capitulo.conteudo) ? (
                        <div
                          className="capitulo-conteudo-formatado"
                          dangerouslySetInnerHTML={{ __html: limparHtmlCapitulo(capitulo.conteudo) }}
                        />
                      ) : (
                        <p style={{ whiteSpace: "pre-wrap" }}>{capitulo.conteudo}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {usuarioAtual && (
                <>
                  <h3>Adicionar novo capítulo</h3>
                  <input
                    value={capituloDepoisTitulo}
                    onChange={(evento) => setCapituloDepoisTitulo(evento.target.value)}
                    placeholder="Título do capítulo"
                  />
                  <div className="capitulo-editor">
                    <div className="capitulo-editor-ferramentas" role="toolbar" aria-label="Formatação do capítulo">
                      <select
                        className="capitulo-editor-select"
                        defaultValue="Arial"
                        aria-label="Fonte"
                        onChange={(evento) => executarComandoEditor("fontName", evento.target.value)}
                      >
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Courier New">Courier New</option>
                      </select>

                      <select
                        className="capitulo-editor-select capitulo-editor-tamanho"
                        defaultValue="3"
                        aria-label="Tamanho da fonte"
                        onChange={(evento) => executarComandoEditor("fontSize", evento.target.value)}
                      >
                        <option value="1">Muito pequena</option>
                        <option value="2">Pequena</option>
                        <option value="3">Normal</option>
                        <option value="4">Grande</option>
                        <option value="5">Muito grande</option>
                        <option value="6">Título</option>
                        <option value="7">Título grande</option>
                      </select>

                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("bold")} aria-label="Negrito"><strong>B</strong></button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("italic")} aria-label="Itálico"><em>I</em></button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("underline")} aria-label="Sublinhado"><u>U</u></button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("strikeThrough")} aria-label="Tachado"><s>S</s></button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("insertUnorderedList")} aria-label="Lista com marcadores">☷</button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("insertOrderedList")} aria-label="Lista numerada">☷¹</button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("justifyLeft")} aria-label="Alinhar à esquerda">≡</button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("justifyCenter")} aria-label="Centralizar">☰</button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("justifyRight")} aria-label="Alinhar à direita">≡›</button>
                      <button type="button" className="capitulo-editor-botao capitulo-editor-botao-destaque" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("justifyFull")} aria-label="Texto justificado">☷</button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("indent")} aria-label="Aumentar recuo">⇥</button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("outdent")} aria-label="Diminuir recuo">⇤</button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("formatBlock", "p")} aria-label="Novo parágrafo">¶</button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("formatBlock", "blockquote")} aria-label="Citação">❝</button>
                      <button type="button" className="capitulo-editor-botao" onMouseDown={(evento) => evento.preventDefault()} onClick={() => executarComandoEditor("removeFormat")} aria-label="Limpar formatação">Tx</button>
                    </div>

                    <div
                      ref={editorCapituloRef}
                      className="capitulo-editor-area"
                      contentEditable
                      role="textbox"
                      aria-multiline="true"
                      data-placeholder="Escreva o conteúdo do capítulo..."
                      suppressContentEditableWarning
                      onInput={atualizarConteudoCapitulo}
                    />
                  </div>

                  <button type="button" className="comunidade-capitulo-publicar" onClick={adicionarCapituloDepois}>
                    <span>＋</span> PUBLICAR CAPÍTULO
                  </button>
                </>
              )}
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
