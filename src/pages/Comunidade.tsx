import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./Comunidade.css";

type Pagina =
  | "inicio"
  | "biblioteca"
  | "comunidade"
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
};

type ComunidadeProps = {
  onNavigate?: (pagina: Pagina) => void;
};

const STORAGE_POSTS =
  "avelune-comunidade-postagens";

const STORAGE_SALVOS =
  "avelune-comunidade-salvos";

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
  const [postagens, setPostagens] =
    useState<Publicacao[]>(
      carregarPostagens
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
    try {
      return localStorage.getItem(
        "avelune-usuario-logado"
      ) === "true";
    } catch {
      return false;
    }
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
  }

  function publicar() {
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
      avaliacao:
        livroLimpo
          ? avaliacaoDigitada
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
            className="ativo"
            onClick={() =>
              onNavigate?.("comunidade")
            }
          >
            Comunidade
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.("perfil")
            }
          >
            Perfil
          </button>
        </nav>

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

              <div className="comunidade-leitor">
                <div className="comunidade-avatar mini">
                  NE
                </div>

                <div>
                  <strong>
                    Noah Evernight
                  </strong>
                  <span>
                    Fantasia · Ficção
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!exigirConta()) return;

                    setPostagens((atual) =>
                      atual.map((post) =>
                        post.usuario ===
                        "Noah Evernight"
                          ? {
                              ...post,
                              seguindo:
                                !post.seguindo,
                            }
                          : post
                      )
                    );

                    mostrarMensagem(
                      "Preferência de acompanhamento atualizada."
                    );
                  }}
                >
                  SEGUIR
                </button>
              </div>

              <div className="comunidade-leitor">
                <div className="comunidade-avatar mini">
                  AW
                </div>

                <div>
                  <strong>
                    Amelia Whitmore
                  </strong>
                  <span>
                    Romance · Mistério
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!exigirConta()) return;

                    mostrarMensagem(
                      "Você começará a seguir Amelia quando a conta estiver conectada."
                    );
                  }}
                >
                  SEGUIR
                </button>
              </div>
            </div>
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
