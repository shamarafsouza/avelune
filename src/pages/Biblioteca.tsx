import { useEffect, useMemo, useState } from "react";
import "./Biblioteca.css";

type Livro = {
  titulo: string;
  autor: string;
  genero: string;
  avaliacao: string;
  cor: string;
  simbolo: string;
  sinopse: string;
  amazonUrl?: string;
  real?: boolean;
  capaUrl?: string;
};

type FiltroBiblioteca =
  | "todos"
  | "estante"
  | "favoritos";

type BibliotecaProps = {
  onNavigate?: (
    pagina:
      | "inicio"
      | "biblioteca"
      | "explorar"
      | "resenhas"
      | "comunidade"
      | "perfil"
  ) => void;
};

function Biblioteca({
  onNavigate,
}: BibliotecaProps) {
  const categorias = [
    "Todos",
    "Fantasia",
    "Romance",
    "Mistério",
    "Terror",
    "Ficção",
    "Aventura",
    "Dark Romance",
  ];

  const livros: Livro[] = [
    {
      titulo:
        'GÊNESIS | "JUDAS" PELOS OLHOS DELE (7 Livro 4)',
      autor: "Larissa Abreu",
      genero: "Dark Romance",
      avaliacao: "4.8",
      cor: "vinho",
      simbolo: "✦",
      sinopse:
        "O quarto livro da série 7 apresenta a história de Judas pelo olhar de Daemon DeMarco, revelando outra perspectiva para acontecimentos marcantes da série e aprofundando os personagens.",
      amazonUrl: "https://link.amazon/B01Uh05k5",
      real: true,
      capaUrl:
        "https://martinsfontespaulista.vteximg.com.br/arquivos/ids/1797288-1000-1000/1208530.jpg.jpg?v=639156667423300000",
    },
    {
      titulo: "Judas (Volume 1)",
      autor: "Larissa Abreu",
      genero: "Dark Romance",
      avaliacao: "4.8",
      cor: "vinho",
      simbolo: "♜",
      sinopse:
        "Um romance sombrio envolvendo Daemon DeMarco, um padre recém-formado, uma freira e uma história marcada por obsessão, pecado, segredos e escolhas perigosas.",
      amazonUrl: "https://link.amazon/B01ukdF95",
      real: true,
      capaUrl:
        "https://martinsfontespaulista.vteximg.com.br/arquivos/ids/1683347-1000-1000/1129812.jpg?v=638987228589930000",
    },
    {
      titulo: "A Hipótese do Amor: Capítulo Extra",
      autor: "Ali Hazelwood",
      genero: "Romance",
      avaliacao: "4.7",
      cor: "rosa",
      simbolo: "♡",
      sinopse:
        "Um capítulo extra de A Hipótese do Amor contado pelo ponto de vista de Adam, trazendo uma nova perspectiva para a história de Olive e Adam.",
      amazonUrl: "https://www.amazon.com.br/hip%C3%B3tese-amor-Capi%CC%81tulo-Extra-ebook/dp/B0BDP8T4BM?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=1KV1BJVZ0FY2U&dib=eyJ2IjoiMSJ9.o0Mtpe9H1FLBG25JIi2_xYOK65_DzHsUsOn8NILQywILq8naBeGfZTlh7ymotF8uGnXZr0_0LNI1TVm5G5DPq3c4b7ApFYem81pDpTZHf023jzHRc42viUuETIq0nZ3gP7rCItTxSUaLbWDQnnu1xkKaikvAdrBPDE6IdAAJaVIFWaf10uhg2rUv5cEJId_tfyfvYk4Dg0IGvtHw3XsP2i3sfK_e4Wtp7tI9Vytnc3qSP94pZWfnFLD_hoV3olFcsEbeaX8eDmIlVksooWB2i05PlcYYKiXuzfbPFeemN5A.ykvaddkmod-hsqHsDVoU0Pml6i4xAYisrq89Yxye3sU&dib_tag=se&keywords=livros&qid=1789387230&sprefix=livro%2Caps%2C210&sr=8-10&linkCode=ll2&tag=avelune03-20&linkId=1bc5a9f80401a6c87d602a495c724c18&ref_=as_li_ss_tl",
      real: true,
      capaUrl:
        "https://m.media-amazon.com/images/P/B0BDP8T4BM.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "OBLÍVIO",
      autor: "Leonor Carvalho",
      genero: "Dark Romance",
      avaliacao: "4.3",
      cor: "roxo",
      simbolo: "♜",
      sinopse:
        "Segundo livro de Rostos Vazios, acompanhando Cole Van Doren e Kayleen Cullbert em uma história de dark romance, inimigos a amantes, convivência forçada e found family.",
      amazonUrl: "https://www.amazon.com.br/OBL%C3%8DVIO-Leonor-Carvalho-ebook/dp/B0D99T94BY?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=32MPV8PTZSZCY&dib=eyJ2IjoiMSJ9.RaRStC0txXuwXs9f5nfdEL3lP5Y3_WyRkd9SSPJqqbILmf3QqhqawGVfgP7UWfWIknkZ609oSDb-zlqFNO51eiiUXLx3gyvP-s30El_b3-7xx-OoeamAcPxXNYASYHG5zhYhrcijdqoWuxX0yUokg-U76NYhW_QHzUC1BfL_T70dNwr828Wc4j1OK6a8s52lUXr-uWNV1OI-3zihpZ7MH8jvSJYKzD7WG_lfZcjYq4JkjlcXj2vDNbJp7Jx7j4jBY5eVoo0GA7lCd7DnJRd6SlqUyD6ZWoDh1rAwfzH33uY._PgLQPRXXPLQmGFdZg6mHqYaQnr4KgDicgBYdxjlyas&dib_tag=se&keywords=leonor+carvalho&qid=1789389330&sprefix=leonor+carvalho%2Caps%2C227&sr=8-4&linkCode=ll2&tag=avelune03-20&linkId=2b07ae92a85200a343bb3eb13ef5e083&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0D99T94BY.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "VULTUS",
      autor: "Leonor Carvalho",
      genero: "Dark Romance",
      avaliacao: "3.8",
      cor: "vinho",
      simbolo: "✦",
      sinopse:
        "Uma obra de Leonor Carvalho marcada pelo tom intenso e sombrio característico de suas histórias de romance.",
      amazonUrl: "https://www.amazon.com.br/VULTUS-Leonor-Carvalho-ebook/dp/B0H323GG94?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=32MPV8PTZSZCY&dib=eyJ2IjoiMSJ9.RaRStC0txXuwXs9f5nfdEL3lP5Y3_WyRkd9SSPJqqbILmf3QqhqawGVfgP7UWfWIknkZ609oSDb-zlqFNO51eiiUXLx3gyvP-s30El_b3-7xx-OoeamAcPxXNYASYHG5zhYhrcijdqoWuxX0yUokg-U76NYhW_QHzUC1BfL_T70dNwr828Wc4j1OK6a8s52lUXr-uWNV1OI-3zihpZ7MH8jvSJYKzD7WG_lfZcjYq4JkjlcXj2vDNbJp7Jx7j4jBY5eVoo0GA7lCd7DnJRd6SlqUyD6ZWoDh1rAwfzH33uY._PgLQPRXXPLQmGFdZg6mHqYaQnr4KgDicgBYdxjlyas&dib_tag=se&keywords=leonor+carvalho&qid=1789389330&sprefix=leonor+carvalho%2Caps%2C227&sr=8-3&linkCode=ll2&tag=avelune03-20&linkId=87fd96a545c8ad1e71c560c92ab56c24&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0H323GG94.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "INCIPIT",
      autor: "Leonor Carvalho",
      genero: "Dark Romance",
      avaliacao: "3.9",
      cor: "azul",
      simbolo: "◇",
      sinopse:
        "Primeiro livro de Rostos Vazios, acompanhando Dante Faulkner e Emília Gray em uma história de segunda chance, ódio e amor, traição e found family.",
      amazonUrl: "https://www.amazon.com.br/INCIPIT-Leonor-Carvalho-ebook/dp/B0C8PJ9729?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=32MPV8PTZSZCY&dib=eyJ2IjoiMSJ9.RaRStC0txUwxXs9f5nfdEL3lP5Y3_WyRkd9SSPJqqbILmf3QqhqawGVfgP7UWfWIknkZ609oSDb-zlqFNO51eiiUXLx3gyvP-s30El_b3-7xx-OoeamAcPxXNYASYHG5zhYhrcijdqoWuxX0yUokg-U76NYhW_QHzUC1BfL_T70dNwr828Wc4j1OK6a8s52lUXr-uWNV1OI-3zihpZ7MH8jvSJYKzD7WG_lfZcjYq4JkjlcXj2vDNbJp7Jx7j4jBY5eVoo0GA7lCd7DnJRd6SlqUyD6ZWoDh1rAwfzH33uY._PgLQPRXXPLQmGFdZg6mHqYaQnr4KgDicgBYdxjlyas&dib_tag=se&keywords=leonor+carvalho&qid=1789389330&sprefix=leonor+carvalho%2Caps%2C227&sr=8-2&linkCode=ll2&tag=avelune03-20&linkId=57a48281a991b46beb99074da3817e60&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0C8PJ9729.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "EXÍMIO — ROSTOS VAZIOS — LIVRO 3",
      autor: "Leonor Carvalho",
      genero: "Dark Romance",
      avaliacao: "3.1",
      cor: "verde",
      simbolo: "♢",
      sinopse:
        "Terceiro volume de Rostos Vazios, com Asher Hawthorn e Arya Li Huang em uma história de romance proibido, segunda chance, antigos amigos, slow burn e found family.",
      amazonUrl: "https://www.amazon.com.br/EX%C3%8DMIO-ROSTOS-VAZIOS-Livro-3-ebook/dp/B0G4KRYZHX?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=32MPV8PTZSZCY&dib=eyJ2IjoiMSJ9.RaRStC0txUwxXs9f5nfdEL3lP5Y3_WyRkd9SSPJqqbILmf3QqhqawGVfgP7UWfWIknkZ609oSDb-zlqFNO51eiiUXLx3gyvP-s30El_b3-7xx-OoeamAcPxXNYASYHG5zhYhrcijdqoWuxX0yUokg-U76NYhW_QHzUC1BfL_T70dNwr828Wc4j1OK6a8s52lUXr-uWNV1OI-3zihpZ7MH8jvSJYKzD7WG_lfZcjYq4JkjlcXj2vDNbJp7Jx7j4jBY5eVoo0GA7lCd7DnJRd6SlqUyD6ZWoDh1rAwfzH33uY._PgLQPRXXPLQmGFdZg6mHqYaQnr4KgDicgBYdxjlyas&dib_tag=se&keywords=leonor+carvalho&qid=1789389330&sprefix=leonor+carvalho%2Caps%2C227&sr=8-1&linkCode=ll2&tag=avelune03-20&linkId=a7845b9fd1d60ff622d52da70d66f727&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0G4KRYZHX.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "O Acordo",
      autor: "Elle Kennedy",
      genero: "Romance",
      avaliacao: "—",
      cor: "azul",
      simbolo: "♡",
      sinopse:
        "O primeiro livro da série Amores Improváveis acompanha Hannah Wells e Garrett Graham em um acordo que começa como uma troca de favores e se transforma em uma história de romance.",
      amazonUrl: "https://www.amazon.com.br/dp/8584395717",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/8584395717.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "O Erro",
      autor: "Elle Kennedy",
      genero: "Romance",
      avaliacao: "—",
      cor: "rosa",
      simbolo: "♡",
      sinopse:
        "No segundo livro de Amores Improváveis, Grace e Logan descobrem que uma atração inesperada pode se transformar em algo muito mais especial.",
      amazonUrl: "https://www.amazon.com.br/erro-Nova-edi%C3%A7%C3%A3o-Amores-Improv%C3%A1veis/dp/8584395725",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/8584395725.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "O Jogo",
      autor: "Elle Kennedy",
      genero: "Romance",
      avaliacao: "—",
      cor: "verde",
      simbolo: "♡",
      sinopse:
        "No terceiro livro de Amores Improváveis, Dean e Allie descobrem que paixão e amizade podem caminhar juntas.",
      amazonUrl: "https://www.amazon.com.br/jogo-Nova-edi%C3%A7%C3%A3o-Amores-Improv%C3%A1veis/dp/8584395733",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/8584395733.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "Box - Amores Improváveis (Nova Edição)",
      autor: "Elle Kennedy",
      genero: "Romance",
      avaliacao: "—",
      cor: "vinho",
      simbolo: "♢",
      sinopse:
        "A série Amores Improváveis reunida em um box com cinco livros: O Acordo, O Erro, O Jogo, A Conquista e O Legado.",
      amazonUrl: "https://www.amazon.com.br/Box-Amores-Improv%C3%A1veis-Nova-Edi%C3%A7%C3%A3o/dp/8584395784",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/8584395784.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "INDOMÁVEL",
      autor: "Zoe X",
      genero: "Dark Romance",
      avaliacao: "—",
      cor: "vinho",
      simbolo: "♜",
      sinopse: "Volume da série Dark Hand, de Zoe X.",
      amazonUrl: "https://www.amazon.com.br/INDOM%C3%81VEL-S%C3%A9rie-Dark-Hand-Vol-ebook/dp/B079Y1NHNY?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=33TDEABI5KF7T&dib=eyJ2IjoiMSJ9.fmrBSxOeJL9T2sbHNrqXkzuEbQSP6RBZC0dfXOkzCFaGZk-topGCPv11sXu9s3mJ5sv9WOuLwoWo-I17Y5u4uVCwjtezxA14vRYFxG3Fl6vLfW-vHB7k0_H3sM9_3aYCwr-3MRlnq0WN3bUkmQLuPcLUs9QOVS1sjfb8lB2jm80yQJNB4dP6UaFT5z9t1KP8nMpT4smdotIlwI2Keli26hbR5KUVkxNhC-xyWV0noiA.sfmjOBvWoEGkUhqqm48pULIkHANnYv0lj-sCKeYZ8OM&dib_tag=se&keywords=zoe+x&qid=1789390192&s=books&sprefix=zoe+x%2Cstripbooks%2C196&sr=1-3&linkCode=ll2&tag=avelune03-20&linkId=90ea81b94cb2123064e4e852618f72f7&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B079Y1NHNY.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "INCONSEQUENTE",
      autor: "Zoe X",
      genero: "Dark Romance",
      avaliacao: "—",
      cor: "roxo",
      simbolo: "♜",
      sinopse: "Volume da série Dark Hand, de Zoe X.",
      amazonUrl: "https://www.amazon.com.br/INCONSEQUENTE-S%C3%A9rie-Dark-Hand-Vol-ebook/dp/B07GTT442V?qid=1789390192&sr=1-3&linkCode=ll2&tag=avelune03-20&linkId=c3646f80c3e1d40c1abf1d266afad088&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B07GTT442V.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "IMPROVÁVEL",
      autor: "Zoe X",
      genero: "Dark Romance",
      avaliacao: "—",
      cor: "azul",
      simbolo: "✦",
      sinopse: "Volume da série Dark Hand, de Zoe X.",
      amazonUrl: "https://www.amazon.com.br/IMPROV%C3%81VEL-S%C3%A9rie-Dark-Hand-Vol-ebook/dp/B088YVR4X1?qid=1789390192&sr=1-3&linkCode=ll2&tag=avelune03-20&linkId=864d8a78df729e20a62024d0e04e9bed&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B088YVR4X1.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "INVULNERÁVEL",
      autor: "Zoe X",
      genero: "Dark Romance",
      avaliacao: "—",
      cor: "verde",
      simbolo: "◇",
      sinopse: "Volume da série Dark Hand, de Zoe X.",
      amazonUrl: "https://www.amazon.com.br/INVULNER%C3%81VEL-S%C3%A9rie-Dark-Hand-Vol-ebook/dp/B09HXRFQRS?qid=1789390192&sr=1-3&linkCode=ll2&tag=avelune03-20&linkId=88ca2db09ad167b513a30faf6d15a6e4&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B09HXRFQRS.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "IMORAL",
      autor: "Zoe X",
      genero: "Dark Romance",
      avaliacao: "—",
      cor: "vinho",
      simbolo: "♜",
      sinopse: "Volume da série Dark Hand, de Zoe X.",
      amazonUrl: "https://www.amazon.com.br/IMORAL-S%C3%A9rie-Dark-Hand-Vol-ebook/dp/B07SRKYSJD?qid=1789390192&sr=1-3&linkCode=ll2&tag=avelune03-20&linkId=969aca98d3bf4b207d97b5dc43a814c6&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B07SRKYSJD.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "BAD PRINCE",
      autor: "Zoe X",
      genero: "Dark Romance",
      avaliacao: "—",
      cor: "roxo",
      simbolo: "♢",
      sinopse: "Livro único de Zoe X.",
      amazonUrl: "https://www.amazon.com.br/BAD-PRINCE-LIVRO-%C3%9ANICO-Zoe-ebook/dp/B09RX1L94Q?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=33TDEABI5KF7T&dib=eyJ2IjoiMSJ9.fmrBSxOeJL9T2sbHNrqXkzuEbQSP6RBZC0dfXOkzCFaGZk-topGCPv11sXu9s3mJ5sv9WOuLwoWo-I17Y5u4uVCwjtezxA14vRYFxG3Fl6vLfW-vHB7k0_H3sM9_3aYCwr-3MRlnq0WN3bUkmQLuPcLUs9QOVS1sjfb8lB2jm80yQJNB4dP6UaFT5z9t1KP8nMpT4smdotIlwI2Keli26hbR5KUVkxNhC-xyWV0noiA.sfmjOBvWoEGkUhqqm48pULIkHANnYv0lj-sCKeYZ8OM&dib_tag=se&keywords=zoe+x&qid=1789390192&s=books&sprefix=zoe+x%2Cstripbooks%2C196&sr=1-4&linkCode=ll2&tag=avelune03-20&linkId=f6a38ca9701a03e9a6ff394eb65a3c25&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B09RX1L94Q.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "UNDER YOUR SKIN",
      autor: "Zoe X",
      genero: "Dark Romance",
      avaliacao: "—",
      cor: "azul",
      simbolo: "☾",
      sinopse: "Um romance com temática de stalker, de Zoe X.",
      amazonUrl: "https://www.amazon.com.br/UNDER-YOUR-SKIN-romance-stalker-ebook/dp/B0C2DZJ58K?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=33TDEABI5KF7T&dib=eyJ2IjoiMSJ9.fmrBSxOeJL9T2sbHNrqXkzuEbQSP6RBZC0dfXOkzCFaGZk-topGCPv11sXu9s3mJ5sv9WOuLwoWo-I17Y5u4uVCwjtezxA14vRYFxG3Fl6vLfW-vHB7k0_H3sM9_3aYCwr-3MRlnq0WN3bUkmQLuPcLUs9QOVS1sjfb8lB2jm80yQJNB4dP6UaFT5z9t1KP8nMpT4smdotIlwI2Keli26hbR5KUVkxNhC-xyWV0noiA.sfmjOBvWoEGkUhqqm48pULIkHANnYv0lj-sCKeYZ8OM&dib_tag=se&keywords=zoe+x&qid=1789390192&s=books&sprefix=zoe+x%2Cstripbooks%2C196&sr=1-5&linkCode=ll2&tag=avelune03-20&linkId=a2520758dc5585d0df7afcd2a19e764d&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0C2DZJ58K.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "BAILANDO NO INFERNO",
      autor: "Zoe X",
      genero: "Dark Romance",
      avaliacao: "—",
      cor: "rosa",
      simbolo: "☾",
      sinopse: "Uma história de Zoe X ambientada em um universo sombrio e intenso.",
      amazonUrl: "https://www.amazon.com.br/BAILANDO-NO-INFERNO-Zoe-X-ebook/dp/B0HC33WKTV?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=33TDEABI5KF7T&dib=eyJ2IjoiMSJ9.fmrBSxOeJL9T2sbHNrqXkzuEbQSP6RBZC0dfXOkzCFaGZk-topGCPv11sXu9s3mJ5sv9WOuLwoWo-I17Y5u4uVCwjtezxA14vRYFxG3Fl6vLfW-vHB7k0_H3sM9_3aYCwr-3MRlnq0WN3bUkmQLuPcLUs9QOVS1sjfb8lB2jm80yQJNB4dP6UaFT5z9t1KP8nMpT4smdotIlwI2Keli26hbR5KUVkxNhC-xyWV0noiA.sfmjOBvWoEGkUhqqm48pULIkHANnYv0lj-sCKeYZ8OM&dib_tag=se&keywords=zoe+x&qid=1789390192&s=books&sprefix=zoe+x%2Cstripbooks%2C196&sr=1-6&linkCode=ll2&tag=avelune03-20&linkId=b75b4e29d2c7a4f590f5c1bf69a1afb1&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0HC33WKTV.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "Maldição de Amor",
      autor: "Zoe X",
      genero: "Romance",
      avaliacao: "—",
      cor: "vinho",
      simbolo: "♡",
      sinopse: "Um reconto de Hades e Perséfone, de Zoe X.",
      amazonUrl: "https://www.amazon.com.br/Maldi%C3%A7%C3%A3o-Amor-reconto-Hades-Pers%C3%A9fone-ebook/dp/B0D793LX93?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=33TDEABI5KF7T&dib=eyJ2IjoiMSJ9.fmrBSxOeJL9T2sbHNrqXkzuEbQSP6RBZC0dfXOkzCFaGZk-topGCPv11sXu9s3mJ5sv9WOuLwoWo-I17Y5u4uVCwjtezxA14vRYFxG3Fl6vLfW-vHB7k0_H3sM9_3aYCwr-3MRlnq0WN3bUkmQLuPcLUs9QOVS1sjfb8lB2jm80yQJNB4dP6UaFT5z9t1KP8nMpT4smdotIlwI2Keli26hbR5KUVkxNhC-xyWV0noiA.sfmjOBvWoEGkUhqqm48pULIkHANnYv0lj-sCKeYZ8OM&dib_tag=se&keywords=zoe+x&qid=1789390192&s=books&sprefix=zoe+x%2Cstripbooks%2C196&sr=1-7&linkCode=ll2&tag=avelune03-20&linkId=a75ebf37b1899b83f04e3362c7ea993b&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0D793LX93.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "A Corte das Sombras",
      autor: "Elena Beaumont",
      genero: "Fantasia",
      avaliacao: "4.9",
      cor: "vinho",
      simbolo: "✦",
      sinopse:
        "Em um reino onde a magia é escondida entre as sombras, uma jovem descobre que seu passado está ligado à corte mais poderosa e perigosa do continente. Entre alianças, segredos e escolhas impossíveis, ela precisará decidir até onde está disposta a ir para descobrir a verdade.",
    },
    {
      titulo: "O Jardim das Estrelas",
      autor: "Clara Whitmore",
      genero: "Fantasia",
      avaliacao: "4.8",
      cor: "azul",
      simbolo: "✧",
      sinopse:
        "Em um jardim que só floresce sob a luz das estrelas, uma garota encontra respostas para perguntas que nunca teve coragem de fazer. Cada flor guarda uma memória e cada noite revela uma parte de uma história esquecida.",
    },
    {
      titulo: "Entre Mundos",
      autor: "Adrian Blackwood",
      genero: "Ficção",
      avaliacao: "4.7",
      cor: "roxo",
      simbolo: "◇",
      sinopse:
        "Depois de encontrar uma porta que não deveria existir, um jovem passa a atravessar mundos completamente diferentes. O problema é que, a cada viagem, fica mais difícil descobrir qual deles realmente é o seu.",
    },
    {
      titulo: "A Última Lua",
      autor: "Victoria Ashford",
      genero: "Romance",
      avaliacao: "4.9",
      cor: "verde",
      simbolo: "☾",
      sinopse:
        "Duas pessoas que juraram nunca mais se encontrar são colocadas frente a frente pela última vez. Entre antigas promessas, sentimentos mal resolvidos e uma cidade iluminada pela lua, elas precisam decidir se algumas histórias realmente merecem terminar.",
    },
    {
      titulo: "O Reino Esquecido",
      autor: "Arthur Evernight",
      genero: "Fantasia",
      avaliacao: "4.8",
      cor: "vinho",
      simbolo: "♢",
      sinopse:
        "Durante séculos, ninguém ousou mencionar o Reino Esquecido. Quando antigos símbolos começam a aparecer novamente, um grupo de viajantes parte em busca das ruínas de uma civilização que talvez nunca tenha desaparecido completamente.",
    },
    {
      titulo: "Cartas Para a Lua",
      autor: "Isabelle Laurent",
      genero: "Romance",
      avaliacao: "4.6",
      cor: "azul",
      simbolo: "♡",
      sinopse:
        "Todas as noites, alguém escreve cartas para a lua. O que ninguém sabe é que essas cartas estão chegando às mãos de uma pessoa que vive do outro lado da cidade e que começa, pouco a pouco, a responder.",
    },
    {
      titulo: "A Casa das Chaves",
      autor: "Nathaniel Crow",
      genero: "Mistério",
      avaliacao: "4.8",
      cor: "roxo",
      simbolo: "✥",
      sinopse:
        "Uma antiga casa possui dezenas de portas e apenas uma chave para cada uma delas. Quando uma nova chave aparece misteriosamente, uma investigação começa e revela segredos que os antigos moradores fizeram de tudo para esconder.",
    },
    {
      titulo: "Depois do Crepúsculo",
      autor: "Evelyn Rose",
      genero: "Aventura",
      avaliacao: "4.7",
      cor: "verde",
      simbolo: "☼",
      sinopse:
        "Quando o sol deixa de nascer em uma pequena cidade, quatro amigos embarcam em uma jornada para descobrir o que aconteceu. O caminho os leva para além das montanhas e para dentro de uma história muito maior do que imaginavam.",
    },
    {
      titulo: "Garotas Cruéis Merecem Pagar",
      autor: "Red R.",
      genero: "Dark Romance",
      avaliacao: "4.6",
      cor: "vinho",
      simbolo: "♜",
      sinopse: "A humanidade sempre temeu a morte, mas os vivos podem ser ainda mais perigosos. Emily Brown vive cercada pelos segredos da poderosa família Walton enquanto um stalker misterioso passa a persegui-la.",
      amazonUrl: "https://www.amazon.com.br/Garotas-Cru%C3%A9is-Merecem-Pagar-Red-ebook/dp/B0CT48YSZ8?_encoding=UTF8&pd_rd_w=4WuBm&content-id=amzn1.sym.bcf28190-d6eb-4334-a79b-8c60f2f53332&pf_rd_p=bcf28190-d6eb-4334-a79b-8c60f2f53332&pf_rd_r=0YH0BH33ZCW0E4XCJT14&pd_rd_wg=Zydit&pd_rd_r=f8b001ab-766f-48ce-99a9-e4144a33abef&linkCode=ll2&tag=avelune03-20&linkId=9ffd3df3a94d56de69dd9152c9be3ea0&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0CT48YSZ8.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "(Máfia) Honra e Promessa: O juramento de um Sottocapo - 3: Famiglia Vitale",
      autor: "F. Locks",
      genero: "Romance",
      avaliacao: "4.4",
      cor: "verde",
      simbolo: "♜",
      sinopse: "Um romance da Famiglia Vitale centrado no juramento e na honra de um Sottocapo.",
      amazonUrl: "https://www.amazon.com.br/M%C3%A1fia-Honra-Promessa-juramento-Sottocapo-ebook/dp/B0H4VZCYR5?_encoding=UTF8&pd_rd_w=0vBzg&content-id=amzn1.sym.dd1bcbc5-f9f9-44c4-9124-bfed723b9f11&pf_rd_p=dd1bcbc5-f9f9-44c4-9124-bfed723b9f11&pf_rd_r=0YH0BH33ZCW0E4XCJT14&pd_rd_wg=Zydit&pd_rd_r=f8b001ab-766f-48ce-99a9-e4144a33abef&linkCode=ll2&tag=avelune03-20&linkId=d52d96d6ed7561bc9f0393fedfc16af8&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0H4VZCYR5.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "Quebrando as Regras: Senhores do Caos",
      autor: "Enny Black",
      genero: "Dark Romance",
      avaliacao: "3.7",
      cor: "roxo",
      simbolo: "♜",
      sinopse: "Alexander Volkov e Rawena Sores se encontram em uma trama intensa de máfia russa, aproximação forçada, obsessão e perigo.",
      amazonUrl: "https://www.amazon.com.br/Quebrando-Regras-Senhores-Enny-Black-ebook/dp/B0GY5XN39H?_encoding=UTF8&pd_rd_w=0vBzg&content-id=amzn1.sym.dd1bcbc5-f9f9-44c4-9124-bfed723b9f11&pf_rd_p=dd1bcbc5-f9f9-44c4-9124-bfed723b9f11&pf_rd_r=0YH0BH33ZCW0E4XCJT14&pd_rd_wg=Zydit&pd_rd_r=f8b001ab-766f-48ce-99a9-e4144a33abef&linkCode=ll2&tag=avelune03-20&linkId=10624a0c09f089eeb63bd3f42a6fa1a4&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0GY5XN39H.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "Meu Colega de Quarto É Um Mafioso",
      autor: "Luana Magalhães",
      genero: "Romance",
      avaliacao: "4.5",
      cor: "vinho",
      simbolo: "♜",
      sinopse: "Leon Lucchese precisa de uma noiva e Jade Medeiros precisa de um lugar para morar. O namoro falso e a convivência forçada colocam os dois no mesmo teto.",
      amazonUrl: "https://www.amazon.com.br/Meu-Colega-Quarto-Um-Mafioso-ebook/dp/B0HBCDR48Q?_encoding=UTF8&pd_rd_w=I0V8I&content-id=amzn1.sym.5a243e73-6b36-48b7-990c-a936ab2a3df4&pf_rd_p=5a243e73-6b36-48b7-990c-a936ab2a3df4&pf_rd_r=0YH0BH33ZCW0E4XCJT14&pd_rd_wg=Zydit&pd_rd_r=f8b001ab-766f-48ce-99a9-e4144a33abef&linkCode=ll2&tag=avelune03-20&linkId=dbae863914a6fe0145f1d96d3a518635&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0HBCDR48Q.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "Todas as Nossas Mentiras",
      autor: "Tatiane Biasi",
      genero: "Romance",
      avaliacao: "—",
      cor: "azul",
      simbolo: "♡",
      sinopse: "Mirella, uma modelo, e Fred, um astro do rock, fingem um namoro para salvar suas carreiras. Entre segredos e aparências, as mentiras começam a revelar uma verdade inesperada.",
      amazonUrl: "https://www.amazon.com.br/Todas-Nossas-Mentiras-Tatiane-Biasi-ebook/dp/B0CQ5DJVY2?_encoding=UTF8&pd_rd_w=I0V8I&content-id=amzn1.sym.5a243e73-6b36-48b7-990c-a936ab2a3df4&pf_rd_p=5a243e73-6b36-48b7-990c-a936ab2a3df4&pf_rd_r=0YH0BH33ZCW0E4XCJT14&pd_rd_wg=Zydit&pd_rd_r=f8b001ab-766f-48ce-99a9-e4144a33abef&linkCode=ll2&tag=avelune03-20&linkId=247d0308431d3f654ccc150cd4694c27&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0CQ5DJVY2.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "Perfeita Tentação",
      autor: "Amanda Curtolo",
      genero: "Romance",
      avaliacao: "4.2",
      cor: "rosa",
      simbolo: "♡",
      sinopse: "Um jogador de hóquei e uma estudante de moda se envolvem em uma convivência forçada marcada por implicância, romance proibido, found family e atração crescente.",
      amazonUrl: "https://www.amazon.com.br/Perfeita-Tenta%C3%A7%C3%A3o-Babacas-H%C3%B3quei-Livro-ebook/dp/B0H7KZJD3V?_encoding=UTF8&pd_rd_w=I0V8I&content-id=amzn1.sym.5a243e73-6b36-48b7-990c-a936ab2a3df4&pf_rd_p=5a243e73-6b36-48b7-990c-a936ab2a3df4&pf_rd_r=0YH0BH33ZCW0E4XCJT14&pd_rd_wg=Zydit&pd_rd_r=f8b001ab-766f-48ce-99a9-e4144a33abef&linkCode=ll2&tag=avelune03-20&linkId=4cf0f5c65380a24e1941fd9dbb252579&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0H7KZJD3V.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "Boas Intenções (Willow University Livro 1)",
      autor: "Nath Queiroz e Tami Rangel",
      genero: "Romance",
      avaliacao: "4.1",
      cor: "verde",
      simbolo: "✧",
      sinopse: "Um recomeço na Willow University coloca uma jovem diante de um passado que insiste em acompanhá-la e de Connor Kingsley, um aluno popular e enigmático.",
      amazonUrl: "https://www.amazon.com.br/Boas-Inten%C3%A7%C3%B5es-Willow-University-Livro-ebook/dp/B0DM6H6QJ4?_encoding=UTF8&pd_rd_w=I0V8I&content-id=amzn1.sym.5a243e73-6b36-48b7-990c-a936ab2a3df4&pf_rd_p=5a243e73-6b36-48b7-990c-a936ab2a3df4&pf_rd_r=0YH0BH33ZCW0E4XCJT14&pd_rd_wg=Zydit&pd_rd_r=f8b001ab-766f-48ce-99a9-e4144a33abef&linkCode=ll2&tag=avelune03-20&linkId=807ce86cec572ce9c2c307d030ec1881&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0DM6H6QJ4.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "Inevitável Caos: Um Fake Dating e Haters to Lovers com o capitão de Hóquei",
      autor: "Fernanda Santos",
      genero: "Romance",
      avaliacao: "3.7",
      cor: "azul",
      simbolo: "◇",
      sinopse: "Dylan Carter é o capitão do time de hóquei e Chloe Harper tenta evitá-lo. Um namoro falso transforma anos de provocações em um caos difícil de controlar.",
      amazonUrl: "https://www.amazon.com.br/Inevit%C3%A1vel-Caos-Dating-Haters-capit%C3%A3o-ebook/dp/B0H8DFY6FY?_encoding=UTF8&pd_rd_w=ajYqz&content-id=amzn1.sym.18b1bee7-1a3b-4a04-851e-6d67d78a8113&pf_rd_p=18b1bee7-1a3b-4a04-851e-6d67d78a8113&pf_rd_r=0YH0BH33ZCW0E4XCJT14&pd_rd_wg=Zydit&pd_rd_r=f8b001ab-766f-48ce-99a9-e4144a33abef&linkCode=ll2&tag=avelune03-20&linkId=4f6d61bf53f54f5d2bfada6c20003a1e&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0H8DFY6FY.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "My Dark Heart (Meu Coração Sombrio)",
      autor: "Alice Bacivangi",
      genero: "Dark Romance",
      avaliacao: "—",
      cor: "roxo",
      simbolo: "♜",
      sinopse: "Ayla se muda para Nova York em busca de um recomeço, mas começa a perceber uma presença sombria que pode ser mais real e perigosa do que imaginava.",
      amazonUrl: "https://www.amazon.com.br/Dark-Heart-Meu-Cora%C3%A7%C3%A3o-Sombrio-ebook/dp/B0DLL5Y228?_encoding=UTF8&pd_rd_w=ajYqz&content-id=amzn1.sym.18b1bee7-1a3b-4a04-851e-6d67d78a8113&pf_rd_p=18b1bee7-1a3b-4a04-851e-6d67d78a8113&pf_rd_r=0YH0BH33ZCW0E4XCJT14&pd_rd_wg=Zydit&pd_rd_r=f8b001ab-766f-48ce-99a9-e4144a33abef&linkCode=ll2&tag=avelune03-20&linkId=dc4949f82edeef840c735c9899f46cc5&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0DLL5Y228.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      titulo: "A Melodia dos Nossos Segredos",
      autor: "Bruna Pallazzo",
      genero: "Romance",
      avaliacao: "—",
      cor: "vinho",
      simbolo: "☾",
      sinopse: "Brian O’Connor é baixista de uma banda de rock e guarda segredos enquanto Eleanor Hughes conhece todos eles. Entre obsessão, convivência e sentimentos, os dois enfrentam uma história intensa.",
      amazonUrl: "https://www.amazon.com.br/Melodia-Nossos-Segredos-Desastres-Estrelas-ebook/dp/B0DJYM8SMV?_encoding=UTF8&pd_rd_w=ajYqz&content-id=amzn1.sym.18b1bee7-1a3b-4a04-851e-6d67d78a8113&pf_rd_p=18b1bee7-1a3b-4a04-851e-6d67d78a8113&pf_rd_r=0YH0BH33ZCW0E4XCJT14&pd_rd_wg=Zydit&pd_rd_r=f8b001ab-766f-48ce-99a9-e4144a33abef&linkCode=ll2&tag=avelune03-20&linkId=5cf112600c59bb587e5627e481e73e4b&ref_=as_li_ss_tl",
      real: true,
      capaUrl: "https://m.media-amazon.com/images/P/B0DJYM8SMV.01._SCLZZZZZZZ_SX500_.jpg",
    },
  ];

  const [categoriaAtiva, setCategoriaAtiva] =
    useState("Todos");

  const [filtroBiblioteca, setFiltroBiblioteca] =
    useState<FiltroBiblioteca>("todos");

  const [busca, setBusca] = useState("");

  const [menuAberto, setMenuAberto] = useState(false);

  const [livroSelecionado, setLivroSelecionado] =
    useState<Livro | null>(null);

  const [favoritos, setFavoritos] =
    useState<string[]>(() => {
      try {
        const salvos = localStorage.getItem(
          "avelune-favoritos"
        );

        return salvos
          ? JSON.parse(salvos)
          : [];
      } catch {
        return [];
      }
    });

  const [queroLer, setQueroLer] =
    useState<string[]>(() => {
      try {
        const salvos = localStorage.getItem(
          "avelune-quero-ler"
        );

        return salvos
          ? JSON.parse(salvos)
          : [];
      } catch {
        return [];
      }
    });

  useEffect(() => {
    localStorage.setItem(
      "avelune-favoritos",
      JSON.stringify(favoritos)
    );
  }, [favoritos]);

  useEffect(() => {
    localStorage.setItem(
      "avelune-quero-ler",
      JSON.stringify(queroLer)
    );
  }, [queroLer]);

  const livrosFiltrados = useMemo(() => {
    const texto = busca
      .toLowerCase()
      .trim();

    return livros.filter((livro) => {
      const pertenceCategoria =
        categoriaAtiva === "Todos" ||
        livro.genero === categoriaAtiva;

      const pertenceFiltro =
        filtroBiblioteca === "todos" ||
        (filtroBiblioteca === "estante" &&
          queroLer.includes(livro.titulo)) ||
        (filtroBiblioteca === "favoritos" &&
          favoritos.includes(livro.titulo));

      const correspondeBusca =
        texto === "" ||
        livro.titulo
          .toLowerCase()
          .includes(texto) ||
        livro.autor
          .toLowerCase()
          .includes(texto) ||
        livro.genero
          .toLowerCase()
          .includes(texto);

      return (
        pertenceCategoria &&
        pertenceFiltro &&
        correspondeBusca
      );
    });
  }, [
    categoriaAtiva,
    filtroBiblioteca,
    busca,
    favoritos,
    queroLer,
  ]);

  function alternarFavorito(
    titulo: string
  ) {
    setFavoritos((atuais) => {
      if (atuais.includes(titulo)) {
        return atuais.filter(
          (item) => item !== titulo
        );
      }

      return [...atuais, titulo];
    });
  }

  function alternarQueroLer(
    titulo: string
  ) {
    setQueroLer((atuais) => {
      if (atuais.includes(titulo)) {
        return atuais.filter(
          (item) => item !== titulo
        );
      }

      return [...atuais, titulo];
    });
  }

  function limparFiltros() {
    setBusca("");
    setCategoriaAtiva("Todos");
    setFiltroBiblioteca("todos");
  }

  function selecionarFiltro(
    filtro: FiltroBiblioteca
  ) {
    setFiltroBiblioteca(filtro);
    setCategoriaAtiva("Todos");
    setBusca("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  let tituloSecao = "Em destaque";
  let eyebrowSecao =
    "ESCOLHAS DA BIBLIOTECA";

  if (filtroBiblioteca === "estante") {
    tituloSecao = "Minha estante";
    eyebrowSecao = "SEUS LIVROS";
  }

  if (filtroBiblioteca === "favoritos") {
    tituloSecao = "Favoritos";
    eyebrowSecao =
      "SUAS HISTÓRIAS FAVORITAS";
  }

  return (
    <main className="biblioteca">
      <div className="biblioteca-particulas" />

      <header className="biblioteca-topo">
        <div className="biblioteca-logo">
          AVELUNE
        </div>

        <nav className="biblioteca-nav">
          <button
            className="ativo"
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
            onClick={() =>
              onNavigate?.("resenhas")
            }
          >
            Resenhas
          </button>

          <button
            type="button"
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

        <button
          type="button"
          className={`biblioteca-menu-mobile ${menuAberto ? "aberto" : ""}`}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((atual) => !atual)}
        >
          <span />
          <span />
          <span />
        </button>

        {menuAberto && (
          <div className="biblioteca-menu-dropdown">
            <button
              type="button"
              className="ativo"
              onClick={() => setMenuAberto(false)}
            >
              Biblioteca
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onNavigate?.("explorar");
              }}
            >
              Explorar
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onNavigate?.("resenhas");
              }}
            >
              Resenhas
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onNavigate?.("comunidade");
              }}
            >
              Comunidade
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onNavigate?.("perfil");
              }}
            >
              Perfil
            </button>
          </div>
        )}

        <div className="biblioteca-acoes">
          <button
            className="icone-botao"
            aria-label="Pesquisar"
            type="button"
            onClick={() => {
              document
                .querySelector<HTMLInputElement>(
                  ".biblioteca-busca input"
                )
                ?.focus();
            }}
          >
            ⌕
          </button>

          <button
            className="perfil-botao"
            aria-label="Perfil"
            type="button"
          >
            ◇
          </button>
        </div>
      </header>

      <section className="biblioteca-conteudo">
        <div className="biblioteca-introducao">
          <span className="biblioteca-eyebrow">
            A GRANDE BIBLIOTECA
          </span>

          <h1>
            Encontre sua
            <br />
            próxima história.
          </h1>

          <p>
            Entre em um universo de histórias,
            personagens e mundos esperando
            para serem descobertos.
          </p>
        </div>

        <div className="biblioteca-busca">
          <span>⌕</span>

          <input
            type="text"
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
            placeholder="Buscar livros, autores ou histórias..."
          />

          <button
            type="button"
            onClick={() =>
              setBusca(busca.trim())
            }
          >
            BUSCAR
          </button>
        </div>

        <section className="categorias">
          <div className="secao-titulo">
            <span>CATEGORIAS</span>
            <div className="linha" />
          </div>

          <div className="categorias-lista">
            {categorias.map(
              (categoria) => (
                <button
                  key={categoria}
                  type="button"
                  className={
                    categoriaAtiva ===
                    categoria
                      ? "categoria ativo"
                      : "categoria"
                  }
                  onClick={() => {
                    setCategoriaAtiva(
                      categoria
                    );
                    setFiltroBiblioteca(
                      "todos"
                    );
                  }}
                >
                  {categoria}
                </button>
              )
            )}
          </div>
        </section>

        <section className="biblioteca-filtros">
          <button
            type="button"
            className={
              filtroBiblioteca === "todos"
                ? "filtro-biblioteca ativo"
                : "filtro-biblioteca"
            }
            onClick={() =>
              selecionarFiltro("todos")
            }
          >
            TODOS OS LIVROS
          </button>

          <button
            type="button"
            className={
              filtroBiblioteca === "estante"
                ? "filtro-biblioteca ativo"
                : "filtro-biblioteca"
            }
            onClick={() =>
              selecionarFiltro("estante")
            }
          >
            MINHA ESTANTE
            <span>
              {queroLer.length}
            </span>
          </button>

          <button
            type="button"
            className={
              filtroBiblioteca ===
              "favoritos"
                ? "filtro-biblioteca ativo"
                : "filtro-biblioteca"
            }
            onClick={() =>
              selecionarFiltro(
                "favoritos"
              )
            }
          >
            FAVORITOS
            <span>
              {favoritos.length}
            </span>
          </button>
        </section>

        <section className="destaques">
          <div className="secao-cabecalho">
            <div>
              <span className="secao-eyebrow">
                {eyebrowSecao}
              </span>

              <h2>
                {categoriaAtiva !==
                  "Todos" &&
                filtroBiblioteca ===
                  "todos"
                  ? categoriaAtiva
                  : tituloSecao}
              </h2>
            </div>

            <button
              className="ver-todos"
              type="button"
              onClick={limparFiltros}
            >
              VER TODOS →
            </button>
          </div>

          {livrosFiltrados.length >
          0 ? (
            <div className="livros-grid">
              {livrosFiltrados.map(
                (livro, index) => {
                  const estaFavoritado =
                    favoritos.includes(
                      livro.titulo
                    );

                  const estaNaLista =
                    queroLer.includes(
                      livro.titulo
                    );

                  return (
                    <article
                      className="livro-card"
                      key={livro.titulo}
                      onClick={() =>
                        setLivroSelecionado(
                          livro
                        )
                      }
                    >
                      <div
                        className={`livro-capa ${livro.cor}`}
                      >
                        {livro.real && livro.capaUrl && (
                          <img
                            className="capa-imagem-real"
                            src={livro.capaUrl}
                            alt={`Capa de ${livro.titulo}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        {livro.real && (
                          <span className="livro-selo-amazon">
                            AMAZON
                          </span>
                        )}
                        <div className="capa-moldura">
                          <span className="moldura-canto superior-esquerdo">
                            ❖
                          </span>

                          <span className="moldura-canto superior-direito">
                            ❖
                          </span>

                          <span className="moldura-canto inferior-esquerdo">
                            ❖
                          </span>

                          <span className="moldura-canto inferior-direito">
                            ❖
                          </span>

                          <div className="moldura-linha" />
                        </div>

                        {!livro.real && (
                          <>
                            <div className="capa-brilho" />

                            <div className="capa-ornamento">
                              {livro.simbolo}
                            </div>

                            <div className="capa-conteudo">
                              <span>
                                AVELUNE
                              </span>

                              <strong>
                                {livro.titulo}
                              </strong>

                              <small>
                                {livro.autor}
                              </small>
                            </div>
                          </>
                        )}

                        <div className="capa-numero">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="capa-acoes">
                          <button
                            type="button"
                            className={
                              estaFavoritado
                                ? "capa-acao ativo"
                                : "capa-acao"
                            }
                            aria-label={
                              estaFavoritado
                                ? "Remover dos favoritos"
                                : "Favoritar livro"
                            }
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              alternarFavorito(
                                livro.titulo
                              );
                            }}
                          >
                            {estaFavoritado
                              ? "♥"
                              : "♡"}
                          </button>

                          <button
                            type="button"
                            className={
                              estaNaLista
                                ? "capa-acao ativo"
                                : "capa-acao"
                            }
                            aria-label={
                              estaNaLista
                                ? "Remover da estante"
                                : "Adicionar à estante"
                            }
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              alternarQueroLer(
                                livro.titulo
                              );
                            }}
                          >
                            {estaNaLista
                              ? "✓"
                              : "+"}
                          </button>
                        </div>
                      </div>

                      <div className="livro-informacoes">
                        <div>
                          <h3>
                            {livro.titulo}
                          </h3>

                          <p>
                            {livro.autor}
                          </p>
                        </div>

                        <span className="avaliacao">
                          ★{" "}
                          {livro.avaliacao}
                        </span>
                      </div>

                      <span className="livro-genero">
                        {livro.genero}
                      </span>

                      {livro.real && livro.amazonUrl && (
                        <a
                          className="livro-amazon"
                          href={livro.amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                        >
                          COMPRAR NA AMAZON ↗
                        </a>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="nenhum-livro">
              <span>
                {filtroBiblioteca ===
                "favoritos"
                  ? "♥"
                  : "✦"}
              </span>

              <h3>
                {filtroBiblioteca ===
                "estante"
                  ? "Sua estante está vazia."
                  : filtroBiblioteca ===
                    "favoritos"
                  ? "Você ainda não tem favoritos."
                  : "Nenhuma história encontrada."}
              </h3>

              <p>
                {filtroBiblioteca ===
                "estante"
                  ? "Escolha uma história na biblioteca para começar sua coleção."
                  : filtroBiblioteca ===
                    "favoritos"
                  ? "Favorite os livros que você deseja encontrar novamente."
                  : "Tente buscar por outro título, autor ou categoria."}
              </p>

              <button
                type="button"
                onClick={limparFiltros}
              >
                EXPLORAR TODAS AS
                HISTÓRIAS
              </button>
            </div>
          )}
        </section>

        {filtroBiblioteca ===
          "todos" && (
          <section className="biblioteca-estante">
            <div className="secao-cabecalho">
              <div>
                <span className="secao-eyebrow">
                  SUA COLEÇÃO
                </span>

                <h2>
                  Minha estante
                </h2>
              </div>

              <button
                type="button"
                className="ver-todos"
                onClick={() =>
                  selecionarFiltro(
                    "estante"
                  )
                }
              >
                VER ESTANTE →
              </button>
            </div>

            {queroLer.length > 0 ? (
              <div className="estante-lista">
                {livros
                  .filter((livro) =>
                    queroLer.includes(
                      livro.titulo
                    )
                  )
                  .map((livro) => (
                    <button
                      key={livro.titulo}
                      type="button"
                      className="estante-livro"
                      onClick={() =>
                        setLivroSelecionado(
                          livro
                        )
                      }
                    >
                      <span
                        className={`estante-capa ${livro.cor}`}
                      >
                        {livro.simbolo}
                      </span>

                      <span>
                        <strong>
                          {
                            livro.titulo
                          }
                        </strong>

                        <small>
                          {livro.autor}
                        </small>
                      </span>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="estante-vazia">
                <span>☾</span>

                <p>
                  Sua estante ainda está
                  vazia.
                  <br />
                  Escolha uma história
                  para começar sua
                  coleção.
                </p>
              </div>
            )}
          </section>
        )}
      </section>

      <footer className="biblioteca-rodape">
        <span>
          AVELUNE © 2026
        </span>

        <span>
          ONDE CADA HISTÓRIA ENCONTRA
          SEU LEITOR
        </span>

        <span className="biblioteca-afiliado">
          Como associado da Amazon, a Avelune recebe por compras qualificadas.
        </span>

        <span>✦</span>
      </footer>

      {livroSelecionado && (
        <div
          className="livro-modal"
          onClick={() =>
            setLivroSelecionado(null)
          }
        >
          <div
            className="livro-modal-conteudo"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-fechar"
              aria-label="Fechar"
              onClick={() =>
                setLivroSelecionado(null)
              }
            >
              ×
            </button>

            <div
              className={`modal-capa ${livroSelecionado.cor}`}
            >
              {livroSelecionado.real &&
                livroSelecionado.capaUrl && (
                  <img
                    className="capa-imagem-real"
                    src={livroSelecionado.capaUrl}
                    alt={`Capa de ${livroSelecionado.titulo}`}
                  />
                )}

              <div className="capa-moldura">
                <span className="moldura-canto superior-esquerdo">
                  ❖
                </span>

                <span className="moldura-canto superior-direito">
                  ❖
                </span>

                <span className="moldura-canto inferior-esquerdo">
                  ❖
                </span>

                <span className="moldura-canto inferior-direito">
                  ❖
                </span>

                <div className="moldura-linha" />
              </div>

              {!livroSelecionado.real && (
                <>
                  <div className="capa-brilho" />

                  <div className="capa-ornamento">
                    {
                      livroSelecionado.simbolo
                    }
                  </div>

                  <div className="capa-conteudo">
                    <span>
                      AVELUNE
                    </span>

                    <strong>
                      {
                        livroSelecionado.titulo
                      }
                    </strong>

                    <small>
                      {
                        livroSelecionado.autor
                      }
                    </small>
                  </div>
                </>
              )}
            </div>

            <div className="modal-informacoes">
              <span className="modal-eyebrow">
                {
                  livroSelecionado.genero
                }
              </span>

              <h2>
                {
                  livroSelecionado.titulo
                }
              </h2>

              <p className="modal-autor">
                por{" "}
                <strong>
                  {
                    livroSelecionado.autor
                  }
                </strong>
              </p>

              <div className="modal-avaliacao">
                <span>★</span>

                <strong>
                  {
                    livroSelecionado.avaliacao
                  }
                </strong>

                <small>
                  avaliação da biblioteca
                </small>
              </div>

              <div className="modal-divisor" />

              <p className="modal-sinopse">
                {
                  livroSelecionado.sinopse
                }
              </p>

              <div className="modal-acoes">
                <button
                  type="button"
                  className={
                    queroLer.includes(
                      livroSelecionado.titulo
                    )
                      ? "modal-botao principal ativo"
                      : "modal-botao principal"
                  }
                  onClick={() =>
                    alternarQueroLer(
                      livroSelecionado.titulo
                    )
                  }
                >
                  {queroLer.includes(
                    livroSelecionado.titulo
                  )
                    ? "✓ NA MINHA ESTANTE"
                    : "＋ QUERO LER"}
                </button>

                <button
                  type="button"
                  className={
                    favoritos.includes(
                      livroSelecionado.titulo
                    )
                      ? "modal-botao secundario ativo"
                      : "modal-botao secundario"
                  }
                  onClick={() =>
                    alternarFavorito(
                      livroSelecionado.titulo
                    )
                  }
                >
                  {favoritos.includes(
                    livroSelecionado.titulo
                  )
                    ? "♥ FAVORITADO"
                    : "♡ FAVORITAR"}
                </button>

                {livroSelecionado.amazonUrl && (
                  <a
                    className="modal-botao amazon"
                    href={livroSelecionado.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🛒 COMPRAR NA AMAZON
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Biblioteca;