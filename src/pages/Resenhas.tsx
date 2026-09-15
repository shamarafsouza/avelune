import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./Resenhas.css";

type Pagina =
  | "inicio"
  | "biblioteca"
  | "explorar"
  | "comunidade"
  | "perfil"
  | "resenhas"
  | "auth-cadastro"
  | "auth-login";

type ResenhasProps = {
  onNavigate?: (pagina: Pagina) => void;
};

type Resenha = {
  id: string;
  livro: string;
  autor: string;
  genero: string;
  nota: number;
  titulo: string;
  texto: string;
  data: string;
};

const livros = [
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

const STORAGE_KEY = "avelune-resenhas";

function carregarResenhas(): Resenha[] {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) return [];
    const parsed = JSON.parse(salvo);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function Resenhas({ onNavigate }: ResenhasProps) {
  const [resenhas, setResenhas] = useState<Resenha[]>(carregarResenhas);
  const [selecionada, setSelecionada] = useState<Resenha | null>(null);
  const [criando, setCriando] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [menuAberto, setMenuAberto] = useState(false);

  const [livro, setLivro] = useState("");
  const [titulo, setTitulo] = useState("");
  const [nota, setNota] = useState(0);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resenhas));
  }, [resenhas]);

  const generos = useMemo(() => {
    return ["Todos", ...Array.from(new Set(livros.map((item) => item[2])))];
  }, []);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return resenhas.filter((item) => {
      const correspondeBusca =
        !termo ||
        item.livro.toLowerCase().includes(termo) ||
        item.autor.toLowerCase().includes(termo) ||
        item.titulo.toLowerCase().includes(termo) ||
        item.texto.toLowerCase().includes(termo);
      const correspondeGenero = filtro === "Todos" || item.genero === filtro;
      return correspondeBusca && correspondeGenero;
    });
  }, [busca, filtro, resenhas]);

  function navegar(pagina: Pagina) {
    setMenuAberto(false);
    onNavigate?.(pagina);
  }

  function limparFormulario() {
    setLivro("");
    setTitulo("");
    setNota(0);
    setTexto("");
  }

  function publicar(e: FormEvent) {
    e.preventDefault();
    if (!livro || !titulo.trim() || !texto.trim() || nota < 1) return;

    const escolhido = livros.find((item) => item[0] === livro);
    if (!escolhido) return;

    const nova: Resenha = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      livro: escolhido[0],
      autor: escolhido[1],
      genero: escolhido[2],
      nota,
      titulo: titulo.trim(),
      texto: texto.trim(),
      data: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    };

    setResenhas((atual) => [nova, ...atual]);
    limparFormulario();
    setCriando(false);
    setSelecionada(nova);
  }

  function excluir(id: string) {
    setResenhas((atual) => atual.filter((item) => item.id !== id));
    setSelecionada(null);
  }

  return (
    <main className="resenhas">
      <header className="resenhas-topo">
        <button className="resenhas-logo" onClick={() => navegar("inicio")}>
          AVELUNE
        </button>

        <nav className="resenhas-nav-desktop" aria-label="Navegação principal">
          <button onClick={() => navegar("biblioteca")}>Biblioteca</button>
          <button onClick={() => navegar("explorar")}>Explorar</button>
          <button className="ativo">Resenhas</button>
          <button onClick={() => navegar("comunidade")}>Comunidade</button>
          <button onClick={() => navegar("perfil")}>Perfil</button>
        </nav>

        <button
          className="resenhas-menu-botao"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
        >
          <span />
          <span />
          <span />
        </button>

        <button className="resenhas-voltar" onClick={() => navegar("biblioteca")}>
          ← Biblioteca
        </button>
      </header>

      {menuAberto && (
        <div className="resenhas-menu-mobile">
          <button onClick={() => navegar("biblioteca")}>Biblioteca</button>
          <button onClick={() => navegar("explorar")}>Explorar</button>
          <button className="ativo">Resenhas</button>
          <button onClick={() => navegar("comunidade")}>Comunidade</button>
          <button onClick={() => navegar("perfil")}>Perfil</button>
        </div>
      )}

      <section className="resenhas-hero">
        <span className="resenhas-eyebrow">PALAVRAS ENTRE PÁGINAS</span>
        <h1>
          Resenhas
          <em>que ficam.</em>
        </h1>
        <div className="resenhas-ornamento">
          <span />
          <strong>✦</strong>
          <span />
        </div>
        <p>
          Um espaço para transformar o que você sentiu durante uma leitura em
          palavras. Aqui entram as impressões, personagens, cenas e histórias
          que continuam vivas depois da última página.
        </p>
        <button className="resenhas-cta" onClick={() => setCriando(true)}>
          <span>ESCREVER UMA RESENHA</span>
          <strong>✦</strong>
        </button>
      </section>

      <section className="resenhas-corpo">
        <div className="resenhas-secao-cabecalho">
          <div>
            <span>01</span>
            <h2>Cartas da Avelune</h2>
            <p>
              Suas leituras podem ganhar um lugar permanente nesta biblioteca.
            </p>
          </div>
          <div className="resenhas-contagem">
            {resenhas.length.toString().padStart(2, "0")} resenhas
          </div>
        </div>

        {resenhas.length > 0 && (
          <div className="resenhas-ferramentas">
            <label className="resenhas-busca">
              <span>⌕</span>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por livro, autor ou palavra..."
              />
            </label>
            <div className="resenhas-filtros">
              {generos.map((genero) => (
                <button
                  key={genero}
                  className={filtro === genero ? "selecionado" : ""}
                  onClick={() => setFiltro(genero)}
                >
                  {genero}
                </button>
              ))}
            </div>
          </div>
        )}

        {resenhas.length === 0 ? (
          <div className="resenhas-vazio">
            <div className="resenhas-selo">✦</div>
            <span>O PRIMEIRO CAPÍTULO AINDA ESTÁ EM BRANCO</span>
            <h3>A próxima história pode ser a sua.</h3>
            <p>
              A Avelune ainda não publicou resenhas editoriais. Em vez de
              inventar opiniões, deixamos este espaço esperando por textos
              reais. Escreva uma resenha e ela ficará salva na sua biblioteca
              neste navegador.
            </p>
            <button onClick={() => setCriando(true)}>ESCREVER A PRIMEIRA →</button>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="resenhas-sem-resultado">
            <span>✦</span>
            <h3>Nenhuma resenha encontrada.</h3>
            <p>Tente outro termo ou remova o filtro.</p>
          </div>
        ) : (
          <div className="resenhas-grid">
            {filtradas.map((resenha, index) => (
              <article
                className="resenha-card"
                key={resenha.id}
                onClick={() => setSelecionada(resenha)}
              >
                <div className={`resenha-capa capa-${index % 4}`}>
                  <span className="capa-selo">AVELUNE</span>
                  <strong>{resenha.livro}</strong>
                  <small>{resenha.autor}</small>
                </div>
                <div className="resenha-info">
                  <div className="resenha-meta">
                    <span>{resenha.genero}</span>
                    <b>{"★".repeat(resenha.nota)}<i>{"★".repeat(5 - resenha.nota)}</i></b>
                  </div>
                  <h3>{resenha.titulo}</h3>
                  <p>{resenha.texto}</p>
                  <div className="resenha-rodape-card">
                    <span>{resenha.data}</span>
                    <button onClick={(e) => { e.stopPropagation(); setSelecionada(resenha); }}>
                      LER RESENHA →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="resenhas-manifesto">
        <span>✦</span>
        <p>
          “Alguns livros acabam quando a última página termina. Outros apenas
          começam ali.”
        </p>
      </section>

      <footer>
        <span>AVELUNE © 2026</span>
        <span>✦</span>
        <span>ONDE CADA HISTÓRIA ENCONTRA SEU LEITOR</span>
      </footer>

      {criando && (
        <div className="resenha-overlay" onMouseDown={() => setCriando(false)}>
          <form className="resenha-form" onSubmit={publicar} onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="fechar" onClick={() => setCriando(false)}>×</button>
            <span className="form-eyebrow">NOVA CARTA</span>
            <h2>Escreva sua resenha.</h2>
            <p className="form-intro">Conte o que a leitura deixou em você.</p>

            <label>
              Livro
              <select value={livro} onChange={(e) => setLivro(e.target.value)} required>
                <option value="">Selecione um livro da Biblioteca</option>
                {livros.map(([nome, autor]) => (
                  <option key={nome} value={nome}>{nome} — {autor}</option>
                ))}
              </select>
            </label>

            <label>
              Título da resenha
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Uma história que não consegui esquecer"
                maxLength={90}
                required
              />
            </label>

            <div className="nota-campo">
              <span>Sua nota</span>
              <div className="estrelas" aria-label="Escolha uma nota de 1 a 5">
                {[1, 2, 3, 4, 5].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    className={valor <= nota ? "ativo" : ""}
                    onClick={() => setNota(valor)}
                    aria-label={`${valor} estrelas`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <label>
              Sua resenha
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Fale sobre a leitura, os personagens, a atmosfera, o que funcionou para você..."
                rows={7}
                maxLength={1800}
                required
              />
            </label>

            <div className="form-acoes">
              <span>{texto.length}/1800</span>
              <button type="submit" disabled={!livro || !titulo.trim() || !texto.trim() || nota < 1}>
                PUBLICAR RESENHA ✦
              </button>
            </div>
          </form>
        </div>
      )}

      {selecionada && (
        <div className="resenha-overlay" onMouseDown={() => setSelecionada(null)}>
          <article className="resenha-leitura" onMouseDown={(e) => e.stopPropagation()}>
            <button className="fechar" onClick={() => setSelecionada(null)}>×</button>
            <span className="leitura-meta">{selecionada.genero} · {selecionada.data}</span>
            <h2>{selecionada.titulo}</h2>
            <h3>{selecionada.livro}</h3>
            <p className="leitura-autor">por {selecionada.autor}</p>
            <div className="leitura-estrelas">{"★".repeat(selecionada.nota)}<i>{"★".repeat(5 - selecionada.nota)}</i></div>
            <div className="leitura-linha" />
            <p className="leitura-texto">{selecionada.texto}</p>
            <div className="leitura-final">
              <span>UMA LEITURA GUARDADA NA AVELUNE</span>
              <button onClick={() => excluir(selecionada.id)}>EXCLUIR RESENHA</button>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

export default Resenhas;
