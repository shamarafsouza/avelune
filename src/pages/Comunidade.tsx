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
  | "resenhas"
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
  spoiler?: boolean;
  spoilerRevelado?: boolean;
};

type ComunidadeProps = {
  onNavigate?: (pagina: Pagina) => void;
};

const STORAGE_SALVOS =
  "avelune-comunidade-salvos";

const postagensIniciais: Publicacao[] = [];

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
  spoiler: boolean;
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

  const [modoResenha, setModoResenha] =
    useState(false);

  const [marcarSpoiler, setMarcarSpoiler] =
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

  const [autenticado, setAutenticado] =
    useState(false);

  const [menuAberto, setMenuAberto] = useState(false);

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

      const { data, error } = await supabase
        .from("publicacoes")
        .select(
          "id, usuario_id, texto, livro, autor_livro, avaliacao, foto_url, curtidas, comentarios, created_at, spoiler"
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
            curtidas: curtidasPorPublicacao.get(publicacao.id) ?? 0,
            comentarios: comentariosDaPublicacao.length,
            curtido: idsCurtidos.has(publicacao.id),
            salva: false,
            seguindo: false,
            origemUsuario:
              publicacao.usuario_id === usuarioAtual.user.id,
            comentariosLista: comentariosDaPublicacao,
            spoiler: Boolean(publicacao.spoiler),
            spoilerRevelado: false,
          };
        });

      if (montado) {
        setPostagens(convertidas);
      }
    }

    carregarPublicacoes();

    return () => {
      montado = false;
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
    setMarcarSpoiler(false);
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

    if (modoResenha && !livroLimpo) {
      mostrarMensagem(
        "Informe qual livro você está resenhando."
      );
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
          texto:
            textoLimpo ||
            "Minha nova leitura no Avelune.",
          livro: livroLimpo || null,
          autor_livro: autorLimpo || null,
          avaliacao: livroLimpo
            ? avaliacaoDigitada
            : null,
          foto_url: fotoUrl,
          spoiler: marcarSpoiler,
        })
        .select(
          "id, usuario_id, texto, livro, autor_livro, avaliacao, foto_url, curtidas, comentarios, created_at, spoiler"
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
      curtidas: 0,
      comentarios: 0,
      curtido: false,
      salva: false,
      seguindo: true,
      origemUsuario: true,
      comentariosLista: [],
      spoiler: marcarSpoiler,
      spoilerRevelado: false,
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

        <nav className="comunidade-nav" aria-label="Navegação principal">
          <button type="button" onClick={() => onNavigate?.("biblioteca")}>Biblioteca</button>
          <button type="button" onClick={() => onNavigate?.("explorar")}>Explorar</button>
          <button type="button" onClick={() => onNavigate?.("resenhas")}>Resenhas</button>
          <button type="button" className="ativo" onClick={() => onNavigate?.("comunidade")}>Comunidade</button>
          <button type="button" onClick={() => onNavigate?.("perfil")}>Perfil</button>
        </nav>

        <button
          type="button"
          className={`comunidade-menu-mobile ${menuAberto ? "aberto" : ""}`}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((atual) => !atual)}
        >
          <span />
          <span />
          <span />
        </button>

        {menuAberto && (
          <div className="comunidade-menu-dropdown">
            <button type="button" onClick={() => { setMenuAberto(false); onNavigate?.("biblioteca"); }}>Biblioteca</button>
            <button type="button" onClick={() => { setMenuAberto(false); onNavigate?.("explorar"); }}>Explorar</button>
            <button type="button" onClick={() => { setMenuAberto(false); onNavigate?.("resenhas"); }}>Resenhas</button>
            <button type="button" className="ativo" onClick={() => setMenuAberto(false)}>Comunidade</button>
            <button type="button" onClick={() => { setMenuAberto(false); onNavigate?.("perfil"); }}>Perfil</button>
          </div>
        )}

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

                <label className="comunidade-spoiler-opcao">
                  <input
                    type="checkbox"
                    checked={marcarSpoiler}
                    onChange={(evento) =>
                      setMarcarSpoiler(evento.target.checked)
                    }
                  />
                  <span>Marcar publicação como spoiler</span>
                </label>

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
                      onClick={ativarResenha}
                    >
                      ♧
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

                    {post.spoiler && !post.spoilerRevelado ? (
                      <div className="comunidade-spoiler-midia">
                        {post.foto ? (
                          <img src={post.foto} alt="Conteúdo protegido por spoiler" />
                        ) : (
                          <div className={`comunidade-post-foto comunidade-post-foto--arte ${post.cor ?? "simples"}`}>
                            <div className="comunidade-foto-luz" />
                            <span>{post.simbolo ?? "✦"}</span>
                            {post.livro && <strong>{post.livro}</strong>}
                            {post.autorLivro && <small>{post.autorLivro}</small>}
                          </div>
                        )}
                        <div className="comunidade-spoiler-midia-overlay">
                          <span>✦</span>
                          <strong>Contém spoiler</strong>
                          <button type="button" onClick={() => setPostagens((atual) => atual.map((item) => item.id === post.id ? { ...item, spoilerRevelado: true } : item))}>REVELAR SPOILER ✦</button>
                        </div>
                      </div>
                    ) : post.foto ? (
                      <div className="comunidade-post-foto">
                        <img src={post.foto} alt={`Publicação de ${post.usuario}`} />
                      </div>
                    ) : (
                      <div className={`comunidade-post-foto comunidade-post-foto--arte ${post.cor ?? "simples"}`}>
                        <div className="comunidade-foto-luz" />
                        <span>{post.simbolo ?? "✦"}</span>
                        {post.livro && <strong>{post.livro}</strong>}
                        {post.autorLivro && <small>{post.autorLivro}</small>}
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

                    {post.spoiler && !post.spoilerRevelado ? (
                      <div className="comunidade-spoiler-bloqueio">
                        <span className="comunidade-spoiler-brilho">✦</span>
                        <strong>Contém spoiler</strong>
                        <p>Esta publicação esconde uma parte da leitura.</p>
                        <button
                          type="button"
                          onClick={() =>
                            setPostagens((atual) =>
                              atual.map((item) =>
                                item.id === post.id
                                  ? { ...item, spoilerRevelado: true }
                                  : item
                              )
                            )
                          }
                        >
                          REVELAR SPOILER ✦
                        </button>
                      </div>
                    ) : (
                      <div className="comunidade-post-legenda">
                        <strong>
                          {post.usuario}
                        </strong>{" "}
                        {post.texto}
                        {post.spoiler && (
                          <span className="comunidade-spoiler-revelado"> · spoiler revelado</span>
                        )}
                      </div>
                    )}

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
          </section>

          <aside className="comunidade-sidebar">
            {postagens.length > 0 && (
              <>
                <div className="comunidade-card">
                  <div className="comunidade-card-titulo">
                    <span>✦</span>
                    <div>
                      <span>EM DESTAQUE</span>
                      <strong>Leitores da semana</strong>
                    </div>
                  </div>
                  {[...new Map(postagens.map((post) => [post.usuario, post])).values()]
                    .slice(0, 3)
                    .map((post) => (
                      <div className="comunidade-destaque" key={post.usuario}>
                        <div className="comunidade-avatar pequeno">
                          {post.iniciais}
                        </div>
                        <div className="comunidade-destaque-dados">
                          <strong>{post.usuario}</strong>
                          <span>{postagens.filter((item) => item.usuario === post.usuario).length} publicação(ões)</span>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="comunidade-card comunidade-tendencias">
                  <div className="comunidade-card-titulo">
                    <span>⌁</span>
                    <div>
                      <span>AGORA NA COMUNIDADE</span>
                      <strong>Livros em conversa</strong>
                    </div>
                  </div>
                  {[...new Set(postagens.map((post) => post.livro).filter(Boolean))]
                    .slice(0, 3)
                    .map((livro) => (
                      <div className="comunidade-sidebar-link comunidade-sidebar-link--estatico" key={livro}>
                        <span>{livro}</span>
                        <small>{postagens.filter((post) => post.livro === livro).length} publicação(ões)</small>
                      </div>
                    ))}
                </div>
              </>
            )}

            {postagens.length === 0 && (
              <div className="comunidade-card comunidade-card-vazio">
                <span className="comunidade-vazio-brilho">✦</span>
                <span>O salão ainda está silencioso</span>
                <strong>Quando leitores reais publicarem, eles aparecerão aqui.</strong>
              </div>
            )}
          </aside>
        </div>

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
