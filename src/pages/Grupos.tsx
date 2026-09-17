import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import "./Grupos.css";
import AveluneHeader from "../components/AveluneHeader";

type Pagina =
  | "inicio"
  | "biblioteca"
  | "comunidade"
  | "grupos"
  | "perfil"
  | "auth-cadastro"
  | "auth-login";

type Grupo = {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  simbolo: string;
  criador_id: string;
  livro_titulo: string | null;
  livro_autor: string | null;
  created_at: string;
  membros_count?: number;
};

type Mensagem = {
  id: string;
  grupo_id: string;
  usuario_id: string;
  texto: string;
  created_at: string;
};

type GruposProps = {
  onNavigate?: (pagina: Pagina) => void;
};

const coresDisponiveis = [
  { nome: "vinho", valor: "#722f45" },
  { nome: "ameixa", valor: "#5b3b6b" },
  { nome: "verde", valor: "#465d50" },
  { nome: "dourado", valor: "#a48650" },
  { nome: "azul", valor: "#465d78" },
];

const simbolosDisponiveis = [
  "✦",
  "✧",
  "☾",
  "♧",
  "❦",
  "✺",
  "⚜",
  "❧",
];

function Grupos({ onNavigate }: GruposProps) {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<Grupo | null>(
    null
  );

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [membros, setMembros] = useState<string[]>([]);

  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [erro, setErro] = useState("");

  const [modalCriar, setModalCriar] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cor, setCor] = useState("vinho");
  const [simbolo, setSimbolo] = useState("✦");
  const [livroTitulo, setLivroTitulo] = useState("");
  const [livroAutor, setLivroAutor] = useState("");

  const [criando, setCriando] = useState(false);

  const [textoMensagem, setTextoMensagem] = useState("");
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  const [entrando, setEntrando] = useState(false);

  const [busca, setBusca] = useState("");

  // ==========================================
  // USUÁRIO AUTENTICADO
  // ==========================================

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      setErro("Você precisa estar logado para acessar os grupos.");
      setCarregando(false);
      return;
    }

    setUsuarioId(data.user.id);

    await carregarGrupos();
  }

  // ==========================================
  // CARREGAR GRUPOS
  // ==========================================

  async function carregarGrupos() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("grupos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar grupos:", error);
      setErro("Não foi possível carregar os grupos.");
      setCarregando(false);
      return;
    }

    const gruposCarregados = (data ?? []) as Grupo[];

    // Busca a quantidade de membros de cada grupo.
    const gruposComMembros = await Promise.all(
      gruposCarregados.map(async (grupo) => {
        const { count } = await supabase
          .from("grupo_membros")
          .select("*", { count: "exact", head: true })
          .eq("grupo_id", grupo.id);

        return {
          ...grupo,
          membros_count: count ?? 0,
        };
      })
    );

    setGrupos(gruposComMembros);
    setCarregando(false);
  }

  // ==========================================
  // CRIAR GRUPO
  // ==========================================

  async function criarGrupo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usuarioId) {
      setErro("Você precisa estar logado.");
      return;
    }

    if (!nome.trim()) {
      setErro("Informe um nome para o grupo.");
      return;
    }

    setCriando(true);
    setErro("");

    const { data: grupoCriado, error } = await supabase
      .from("grupos")
      .insert({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        cor,
        simbolo,
        criador_id: usuarioId,
        livro_titulo: livroTitulo.trim() || null,
        livro_autor: livroAutor.trim() || null,
      })
      .select()
      .single();

    if (error || !grupoCriado) {
      console.error("Erro ao criar grupo:", error);
      setErro("Não foi possível criar o grupo.");
      setCriando(false);
      return;
    }

    // O criador já entra automaticamente como membro.
    const { error: erroMembro } = await supabase
      .from("grupo_membros")
      .insert({
        grupo_id: grupoCriado.id,
        usuario_id: usuarioId,
      });

    if (erroMembro) {
      console.error("Erro ao adicionar criador:", erroMembro);

      // O grupo foi criado, mas o criador não foi adicionado.
      // A página continua funcionando e o usuário pode tentar entrar.
    }

    limparFormulario();
    setModalCriar(false);

    await carregarGrupos();

    setCriando(false);
  }

  function limparFormulario() {
    setNome("");
    setDescricao("");
    setCor("vinho");
    setSimbolo("✦");
    setLivroTitulo("");
    setLivroAutor("");
  }

  // ==========================================
  // ENTRAR NO GRUPO
  // ==========================================

  async function entrarNoGrupo(grupo: Grupo) {
    if (!usuarioId) {
      setErro("Você precisa estar logado.");
      return;
    }

    setEntrando(true);
    setErro("");

    const { error } = await supabase
      .from("grupo_membros")
      .insert({
        grupo_id: grupo.id,
        usuario_id: usuarioId,
      });

    if (error && error.code !== "23505") {
      console.error("Erro ao entrar no grupo:", error);
      setErro("Não foi possível entrar no grupo.");
      setEntrando(false);
      return;
    }

    await carregarMembros(grupo.id);
    await carregarGrupos();

    setEntrando(false);
  }

  // ==========================================
  // SAIR DO GRUPO
  // ==========================================

  async function sairDoGrupo(grupo: Grupo) {
    if (!usuarioId) return;

    const confirmar = window.confirm(
      "Tem certeza que deseja sair deste grupo?"
    );

    if (!confirmar) return;

    setErro("");

    const { error } = await supabase
      .from("grupo_membros")
      .delete()
      .eq("grupo_id", grupo.id)
      .eq("usuario_id", usuarioId);

    if (error) {
      console.error("Erro ao sair do grupo:", error);
      setErro("Não foi possível sair do grupo.");
      return;
    }

    await carregarMembros(grupo.id);
    await carregarGrupos();
  }

  // ==========================================
  // ABRIR GRUPO
  // ==========================================

  async function abrirGrupo(grupo: Grupo) {
    setGrupoSelecionado(grupo);
    setMensagens([]);
    setMembros([]);
    setErro("");

    await Promise.all([
      carregarMensagens(grupo.id),
      carregarMembros(grupo.id),
    ]);
  }

  async function carregarMensagens(grupoId: string) {
    setCarregandoMensagens(true);

    const { data, error } = await supabase
      .from("grupo_mensagens")
      .select("*")
      .eq("grupo_id", grupoId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao carregar mensagens:", error);
      setErro("Não foi possível carregar as mensagens.");
      setCarregandoMensagens(false);
      return;
    }

    setMensagens((data ?? []) as Mensagem[]);
    setCarregandoMensagens(false);
  }

  async function carregarMembros(grupoId: string) {
    const { data, error } = await supabase
      .from("grupo_membros")
      .select("usuario_id")
      .eq("grupo_id", grupoId);

    if (error) {
      console.error("Erro ao carregar membros:", error);
      return;
    }

    setMembros((data ?? []).map((membro) => membro.usuario_id));
  }

  // ==========================================
// REMOVER MEMBRO (APENAS CRIADOR)
// ==========================================

async function removerMembro(membroId: string) {
  if (!usuarioId || !grupoSelecionado) return;

  if (grupoSelecionado.criador_id !== usuarioId) {
    setErro("Apenas o criador pode remover membros.");
    return;
  }

  if (membroId === grupoSelecionado.criador_id) {
    setErro("O criador não pode ser removido.");
    return;
  }

  const confirmar = window.confirm(
    "Tem certeza que deseja remover este membro?"
  );

  if (!confirmar) return;

  setErro("");

  const { error } = await supabase
    .from("grupo_membros")
    .delete()
    .eq("grupo_id", grupoSelecionado.id)
    .eq("usuario_id", membroId);

  if (error) {
    console.error("Erro ao remover membro:", error);
    setErro("Não foi possível remover o membro.");
    return;
  }

  await carregarMembros(grupoSelecionado.id);
  await carregarGrupos();
}

  // ==========================================
  // ENVIAR MENSAGEM
  // ==========================================

  async function enviarMensagem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usuarioId || !grupoSelecionado) return;

    if (!textoMensagem.trim()) return;

    if (!membros.includes(usuarioId)) {
      setErro("Você precisa ser membro para publicar mensagens.");
      return;
    }

    setEnviandoMensagem(true);
    setErro("");

    const { error } = await supabase
      .from("grupo_mensagens")
      .insert({
        grupo_id: grupoSelecionado.id,
        usuario_id: usuarioId,
        texto: textoMensagem.trim(),
      });

    if (error) {
      console.error("Erro ao enviar mensagem:", error);
      setErro("Não foi possível enviar a mensagem.");
      setEnviandoMensagem(false);
      return;
    }

    setTextoMensagem("");

    await carregarMensagens(grupoSelecionado.id);

    setEnviandoMensagem(false);
  }

  // ==========================================
  // EXCLUIR MENSAGEM
  // ==========================================

  async function excluirMensagem(mensagem: Mensagem) {
    if (!usuarioId || mensagem.usuario_id !== usuarioId) return;

    const confirmar = window.confirm("Excluir esta mensagem?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("grupo_mensagens")
      .delete()
      .eq("id", mensagem.id)
      .eq("usuario_id", usuarioId);

    if (error) {
      console.error("Erro ao excluir mensagem:", error);
      setErro("Não foi possível excluir a mensagem.");
      return;
    }

    if (grupoSelecionado) {
      await carregarMensagens(grupoSelecionado.id);
    }
  }

  // ==========================================
  // EXCLUIR GRUPO
  // ==========================================

  async function excluirGrupo(grupo: Grupo) {
    if (!usuarioId || grupo.criador_id !== usuarioId) return;

    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este grupo? Essa ação não pode ser desfeita."
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("grupos")
      .delete()
      .eq("id", grupo.id)
      .eq("criador_id", usuarioId);

    if (error) {
      console.error("Erro ao excluir grupo:", error);
      setErro("Não foi possível excluir o grupo.");
      return;
    }

    setGrupoSelecionado(null);
    await carregarGrupos();
  }

  // ==========================================
  // FUNÇÕES AUXILIARES
  // ==========================================

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function obterCor(corNome: string) {
    return (
      coresDisponiveis.find((cor) => cor.nome === corNome)?.valor ??
      "#722f45"
    );
  }

  function ehMembro() {
    return usuarioId ? membros.includes(usuarioId) : false;
  }

  function ehCriador() {
    return Boolean(
      usuarioId &&
        grupoSelecionado &&
        grupoSelecionado.criador_id === usuarioId
    );
  }

  const gruposFiltrados = grupos.filter((grupo) => {
    const termo = busca.toLowerCase();

    return (
      grupo.nome.toLowerCase().includes(termo) ||
      (grupo.descricao ?? "").toLowerCase().includes(termo) ||
      (grupo.livro_titulo ?? "").toLowerCase().includes(termo) ||
      (grupo.livro_autor ?? "").toLowerCase().includes(termo)
    );
  });

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  if (grupoSelecionado) {
return (
  <>
    <AveluneHeader
      paginaAtual="grupos"
      onNavigate={(pagina) => onNavigate?.(pagina)}
    />

    <main className="grupos-pagina grupos-detalhes">
        <header className="grupos-detalhes-header">
          <button
            type="button"
              onClick={() => onNavigate?.("biblioteca")}          >
            ⌂ Página inicial
          </button>

          <button
            type="button"
            className="grupos-voltar"
            onClick={() => {
              setGrupoSelecionado(null);
              setErro("");
            }}
          >
            ← Voltar aos grupos
          </button>

          <div className="grupos-detalhes-acoes">
            {ehCriador() && (
              <button
                type="button"
                className="grupo-excluir"
                onClick={() => excluirGrupo(grupoSelecionado)}
              >
                Excluir grupo
              </button>
            )}
          </div>
        </header>

        <section
          className="grupo-detalhes-hero"
          style={{
            borderTopColor: obterCor(grupoSelecionado.cor),
          }}
        >
          <div
            className="grupo-detalhes-simbolo"
            style={{
              backgroundColor: obterCor(grupoSelecionado.cor),
            }}
          >
            {grupoSelecionado.simbolo}
          </div>

          <div className="grupo-detalhes-info">
            <span className="grupos-eyebrow">Círculo literário</span>

            <h1>{grupoSelecionado.nome}</h1>

            {grupoSelecionado.descricao && (
              <p>{grupoSelecionado.descricao}</p>
            )}

            {grupoSelecionado.livro_titulo && (
              <div className="grupo-livro">
                <span className="grupo-livro-icone">📖</span>

                <div>
                  <strong>{grupoSelecionado.livro_titulo}</strong>

                  {grupoSelecionado.livro_autor && (
                    <small>{grupoSelecionado.livro_autor}</small>
                  )}
                </div>
              </div>
            )}

            <div className="grupo-detalhes-meta">
              <span>
                {membros.length}{" "}
                {membros.length === 1 ? "membro" : "membros"}
              </span>

              <span>•</span>

              <span>Criado em {formatarData(grupoSelecionado.created_at)}</span>
            </div>
          </div>
        </section>

        {ehCriador() && (
          <section className="grupo-gerenciar-membros">
            <h2>Gerenciar membros</h2>
            <p>Somente a criadora pode remover membros do grupo.</p>

            {membros.length === 0 ? (
              <p>Nenhum membro encontrado.</p>
            ) : (
              <div>
                {membros.map((membroId) => {
                  const ehDono = membroId === grupoSelecionado.criador_id;

                  return (
                    <div key={membroId}>
                      <span>
                        {ehDono
                          ? "Você (criadora)"
                          : `Leitor ${membroId.slice(0, 6)}`}
                      </span>

                      {!ehDono && (
                        <button
                          type="button"
                          onClick={() => removerMembro(membroId)}
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="grupo-discussao">
          <div className="grupo-discussao-header">
            <div>
              <span className="grupos-eyebrow">O círculo</span>
              <h2>Discussões</h2>
            </div>

            {!ehMembro() && (
              <button
                type="button"
                className="grupo-botao-principal"
                onClick={() => entrarNoGrupo(grupoSelecionado)}
                disabled={entrando}
              >
                {entrando ? "Entrando..." : "Participar do grupo"}
              </button>
            )}

            {ehMembro() && !ehCriador() && (
              <button
                type="button"
                className="grupo-botao-secundario"
                onClick={() => sairDoGrupo(grupoSelecionado)}
              >
                Sair do grupo
              </button>
            )}

            {ehCriador() && (
              <span className="grupo-criador-badge">Criador</span>
            )}
          </div>

          {erro && <div className="grupos-erro">{erro}</div>}

          <div className="grupo-mensagens">
            {carregandoMensagens ? (
              <div className="grupos-vazio">
                <p>Consultando os registros do círculo...</p>
              </div>
            ) : mensagens.length === 0 ? (
              <div className="grupos-vazio">
                <span>✧</span>
                <h3>O silêncio antecede a primeira palavra.</h3>
                <p>
                  Ainda não existem mensagens neste grupo. Seja a primeira
                  pessoa a iniciar uma conversa.
                </p>
              </div>
            ) : (
              mensagens.map((mensagem) => (
                <article
                  key={mensagem.id}
                  className={`grupo-mensagem ${
                    mensagem.usuario_id === usuarioId
                      ? "grupo-mensagem-propria"
                      : ""
                  }`}
                >
                  <div className="grupo-mensagem-topo">
                    <span className="grupo-mensagem-autor">
                      {mensagem.usuario_id === usuarioId
                        ? "Você"
                        : `Leitor ${mensagem.usuario_id.slice(0, 6)}`}
                    </span>

                    <time>{formatarData(mensagem.created_at)}</time>
                  </div>

                  <p>{mensagem.texto}</p>

                  {mensagem.usuario_id === usuarioId && (
                    <button
                      type="button"
                      className="grupo-mensagem-excluir"
                      onClick={() => excluirMensagem(mensagem)}
                    >
                      Excluir
                    </button>
                  )}
                </article>
              ))
            )}
          </div>

          {ehMembro() ? (
            <form
              className="grupo-form-mensagem"
              onSubmit={enviarMensagem}
            >
              <label htmlFor="texto-mensagem">Compartilhe seus pensamentos</label>

              <textarea
                id="texto-mensagem"
                value={textoMensagem}
                onChange={(event) => setTextoMensagem(event.target.value)}
                placeholder="Escreva algo para o círculo..."
                rows={4}
                maxLength={2000}
              />

              <div className="grupo-form-mensagem-footer">
                <span>{textoMensagem.length}/2000</span>

                <button
                  type="submit"
                  className="grupo-botao-principal"
                  disabled={
                    enviandoMensagem || !textoMensagem.trim()
                  }
                >
                  {enviandoMensagem ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grupo-restricao">
              <span>✦</span>
              <p>
                Entre neste grupo para participar das discussões e
                compartilhar suas leituras.
              </p>
            </div>
          )}
        </section>
       </main>
      </>
    );
  }

return (
  <>
    <AveluneHeader
      paginaAtual="grupos"
      onNavigate={(pagina) => onNavigate?.(pagina)}
    />

    <main className="grupos-pagina">
      <header className="grupos-header">
        <button
          type="button"
          onClick={() => onNavigate?.("biblioteca")}
        >
          ⌂ Página inicial
        </button>

        <div className="grupos-header-texto">
          <span className="grupos-eyebrow">Avelune · Comunidade</span>

          <h1>Círculos Literários</h1>

          <p>
            Encontre leitores, compartilhe teorias e construa espaços
            para conversar sobre as histórias que nos transformam.
          </p>
        </div>

        <button
          type="button"
          className="grupo-botao-principal"
          onClick={() => {
            setModalCriar(true);
            setErro("");
          }}
        >
          + Criar grupo
        </button>
      </header>

      {erro && <div className="grupos-erro">{erro}</div>}

      <section className="grupos-filtros">
        <label htmlFor="busca-grupos">Pesquisar círculos</label>

        <input
          id="busca-grupos"
          type="search"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Nome do grupo, livro ou autor..."
        />
      </section>

      {carregando ? (
        <div className="grupos-vazio">
          <span>✧</span>
          <p>Buscando os círculos literários...</p>
        </div>
      ) : gruposFiltrados.length === 0 ? (
        <div className="grupos-vazio">
          <span>❦</span>

          <h2>Nenhum círculo encontrado</h2>

          <p>
            {busca
              ? "Tente buscar por outro nome, livro ou autor."
              : "Seja a primeira pessoa a criar um espaço de leitura."}
          </p>

          {!busca && (
            <button
              type="button"
              className="grupo-botao-principal"
              onClick={() => setModalCriar(true)}
            >
              Criar meu grupo
            </button>
          )}
        </div>
      ) : (
        <section className="grupos-grid">
          {gruposFiltrados.map((grupo) => (
            <article
              key={grupo.id}
              className="grupo-card"
              style={{
                borderTopColor: obterCor(grupo.cor),
              }}
            >
              <div className="grupo-card-topo">
                <div
                  className="grupo-card-simbolo"
                  style={{
                    backgroundColor: obterCor(grupo.cor),
                  }}
                >
                  {grupo.simbolo}
                </div>

                <span className="grupo-card-data">
                  {formatarData(grupo.created_at)}
                </span>
              </div>

              <div className="grupo-card-conteudo">
                <h2>{grupo.nome}</h2>

                <p className="grupo-card-descricao">
                  {grupo.descricao ||
                    "Um círculo para compartilhar o amor pela leitura."}
                </p>

                {grupo.livro_titulo && (
                  <div className="grupo-card-livro">
                    <span>📖</span>

                    <div>
                      <strong>{grupo.livro_titulo}</strong>

                      {grupo.livro_autor && (
                        <small>{grupo.livro_autor}</small>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grupo-card-rodape">
                <span className="grupo-card-membros">
                  ♧ {grupo.membros_count ?? 0} membros
                </span>

                <button
                  type="button"
                  className="grupo-card-acessar"
                  onClick={() => abrirGrupo(grupo)}
                >
                  Entrar no círculo →
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* ==========================================
          MODAL DE CRIAÇÃO
      ========================================== */}

      {modalCriar && (
        <div
          className="grupos-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalCriar(false);
              setErro("");
            }
          }}
        >
          <section
            className="grupos-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-criar-titulo"
          >
            <div className="grupos-modal-header">
              <div>
                <span className="grupos-eyebrow">Novo círculo</span>

                <h2 id="modal-criar-titulo">Criar um grupo</h2>
              </div>

              <button
                type="button"
                className="grupos-modal-fechar"
                onClick={() => {
                  setModalCriar(false);
                  setErro("");
                }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <form className="grupos-form" onSubmit={criarGrupo}>
              <div className="grupo-form-campo">
                <label htmlFor="nome-grupo">Nome do grupo *</label>

                <input
                  id="nome-grupo"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Clube das páginas esquecidas"
                  maxLength={100}
                  required
                />
              </div>

              <div className="grupo-form-campo">
                <label htmlFor="descricao-grupo">Descrição</label>

                <textarea
                  id="descricao-grupo"
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Sobre o que será o seu círculo literário?"
                  rows={4}
                  maxLength={500}
                />
              </div>

              <div className="grupo-form-campo">
                <label>Escolha um símbolo</label>

                <div className="grupo-simbolos">
                  {simbolosDisponiveis.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={
                        simbolo === item
                          ? "grupo-simbolo-selecionado"
                          : ""
                      }
                      onClick={() => setSimbolo(item)}
                      aria-label={`Selecionar símbolo ${item}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grupo-form-campo">
                <label>Cor do grupo</label>

                <div className="grupo-cores">
                  {coresDisponiveis.map((item) => (
                    <button
                      key={item.nome}
                      type="button"
                      className={
                        cor === item.nome ? "grupo-cor-selecionada" : ""
                      }
                      onClick={() => setCor(item.nome)}
                      aria-label={`Selecionar cor ${item.nome}`}
                    >
                      <span
                        style={{
                          backgroundColor: item.valor,
                        }}
                      />

                      {item.nome}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grupo-form-separador">
                <span>Livro associado (opcional)</span>
              </div>

              <div className="grupo-form-campo">
                <label htmlFor="livro-titulo">Título do livro</label>

                <input
                  id="livro-titulo"
                  type="text"
                  value={livroTitulo}
                  onChange={(event) => setLivroTitulo(event.target.value)}
                  placeholder="Ex.: Flores para Algernon"
                  maxLength={200}
                />
              </div>

              <div className="grupo-form-campo">
                <label htmlFor="livro-autor">Autor</label>

                <input
                  id="livro-autor"
                  type="text"
                  value={livroAutor}
                  onChange={(event) => setLivroAutor(event.target.value)}
                  placeholder="Ex.: Daniel Keyes"
                  maxLength={150}
                />
              </div>

              {erro && <div className="grupos-erro">{erro}</div>}

              <div className="grupos-modal-footer">
                <button
                  type="button"
                  className="grupo-botao-secundario"
                  onClick={() => {
                    setModalCriar(false);
                    setErro("");
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="grupo-botao-principal"
                  disabled={criando}
                >
                  {criando ? "Criando..." : "Criar círculo"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  </>
);
}

export default Grupos;
