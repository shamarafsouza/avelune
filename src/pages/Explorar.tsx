import { useEffect, useMemo, useState } from "react";
import "./Explorar.css";

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

type ExplorarProps = {
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

function Explorar({
  onNavigate,
}: ExplorarProps) {
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

  const [categoriaAtiva, setCategoriaAtiva] =
    useState("Todos");

  const [menuAberto, setMenuAberto] = useState(false);

  const [busca, setBusca] = useState("");

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
      const categoriaOk =
        categoriaAtiva === "Todos" ||
        livro.genero === categoriaAtiva;

      const buscaOk =
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

      return categoriaOk && buscaOk;
    });
  }, [categoriaAtiva, busca]);

  const maisBemAvaliados = [...livros]
    .sort(
      (a, b) =>
        Number(b.avaliacao) -
        Number(a.avaliacao)
    )
    .slice(0, 4);

  const emAlta = [
    livros[0],
    livros[3],
    livros[6],
    livros[1],
  ];

  const recentes = [
    livros[7],
    livros[5],
    livros[4],
    livros[2],
  ];

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

  function abrirLivro(livro: Livro) {
    setLivroSelecionado(livro);
  }

  function fecharLivro() {
    setLivroSelecionado(null);
  }

  function renderCapa(livro: Livro) {
    const estaFavoritado =
      favoritos.includes(livro.titulo);

    const estaNaLista =
      queroLer.includes(livro.titulo);

    return (
      <div
        className={`explorar-capa ${livro.cor}`}
      >
        <div className="explorar-capa-moldura">
          <span className="explorar-canto top-left">
            ❖
          </span>

          <span className="explorar-canto top-right">
            ❖
          </span>

          <span className="explorar-canto bottom-left">
            ❖
          </span>

          <span className="explorar-canto bottom-right">
            ❖
          </span>
        </div>

        {livro.real && livro.capaUrl ? (
          <>
            <img
              className="explorar-capa-imagem-real"
              src={livro.capaUrl}
              alt={`Capa de ${livro.titulo}`}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <span className="explorar-selo-amazon">AMAZON</span>
          </>
        ) : (
          <>
            <div className="explorar-capa-brilho" />
            <span className="explorar-simbolo">{livro.simbolo}</span>
            <div className="explorar-capa-texto">
              <small>AVELUNE</small>
              <strong>{livro.titulo}</strong>
              <span>{livro.autor}</span>
            </div>
          </>
        )}

        <div className="explorar-capa-acoes">
          <button
            type="button"
            aria-label={
              estaFavoritado
                ? "Remover dos favoritos"
                : "Favoritar livro"
            }
            className={
              estaFavoritado
                ? "ativo"
                : ""
            }
            onClick={(event) => {
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
            aria-label={
              estaNaLista
                ? "Remover da estante"
                : "Adicionar à estante"
            }
            className={
              estaNaLista
                ? "ativo"
                : ""
            }
            onClick={(event) => {
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
    );
  }

  function renderCards(lista: Livro[]) {
    return (
      <div className="explorar-grid">
        {lista.map((livro) => (
          <article
            className="explorar-card"
            key={livro.titulo}
            onClick={() =>
              abrirLivro(livro)
            }
          >
            {renderCapa(livro)}

            <div className="explorar-info">
              <div>
                <h3>
                  {livro.titulo}
                </h3>

                <p>
                  {livro.autor}
                </p>
              </div>

              <span>
                ★ {livro.avaliacao}
              </span>
            </div>

            <small className="explorar-genero">
              {livro.genero}
            </small>
          </article>
        ))}
      </div>
    );
  }

  return (
    <main className="explorar">
      <div className="explorar-particulas" />

      <header className="explorar-topo">
        <div className="explorar-logo">
          AVELUNE
        </div>

        <nav className="explorar-nav">
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
          className={`explorar-menu-mobile ${
            menuAberto ? "aberto" : ""
          }`}
          aria-label={
            menuAberto ? "Fechar menu" : "Abrir menu"
          }
          aria-expanded={menuAberto}
          onClick={() =>
            setMenuAberto((atual) => !atual)
          }
        >
          <span />
          <span />
          <span />
        </button>

        {menuAberto && (
          <div className="explorar-menu-dropdown">
            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onNavigate?.("biblioteca");
              }}
            >
              Biblioteca
            </button>

            <button
              type="button"
              className="ativo"
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

        <div className="explorar-acoes">
          <button
            className="explorar-icone"
            aria-label="Pesquisar"
            type="button"
            onClick={() => {
              document
                .querySelector<HTMLInputElement>(
                  ".explorar-busca input"
                )
                ?.focus();
            }}
          >
            ⌕
          </button>

          <button
            className="explorar-perfil"
            aria-label="Perfil"
            type="button"
          >
            ◇
          </button>
        </div>
      </header>

      <section className="explorar-conteudo">
        <div className="explorar-introducao">
          <span>
            EXPLORE O UNIVERSO AVELUNE
          </span>

          <h1>
            Há sempre uma
            <br />
            nova história.
          </h1>

          <p>
            Descubra livros que despertam
            a imaginação, encontre novos
            mundos e deixe sua próxima
            leitura encontrar você.
          </p>
        </div>

        <div className="explorar-busca">
          <span>⌕</span>

          <input
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
            placeholder="O que você deseja descobrir?"
          />

          {busca && (
            <button
              type="button"
              onClick={() =>
                setBusca("")
              }
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <section className="explorar-categorias">
          <div className="explorar-secao-titulo">
            <span>
              EXPLORE POR GÊNERO
            </span>

            <div />
          </div>

          <div className="explorar-categorias-lista">
            {categorias.map(
              (categoria) => (
                <button
                  key={categoria}
                  type="button"
                  className={
                    categoriaAtiva ===
                    categoria
                      ? "ativo"
                      : ""
                  }
                  onClick={() =>
                    setCategoriaAtiva(
                      categoria
                    )
                  }
                >
                  {categoria}
                </button>
              )
            )}
          </div>
        </section>

        {busca ||
        categoriaAtiva !== "Todos" ? (
          <section className="explorar-resultados">
            <div className="explorar-cabecalho">
              <div>
                <span>
                  RESULTADOS
                </span>

                <h2>
                  {categoriaAtiva !==
                  "Todos"
                    ? categoriaAtiva
                    : "Sua busca"}
                </h2>
              </div>

              <span className="explorar-total">
                {livrosFiltrados.length}{" "}
                {livrosFiltrados.length ===
                1
                  ? "história"
                  : "histórias"}
              </span>
            </div>

            {livrosFiltrados.length > 0 ? (
              renderCards(
                livrosFiltrados
              )
            ) : (
              <div className="explorar-vazio">
                <span>✦</span>

                <h3>
                  Nenhuma história
                  encontrada.
                </h3>

                <p>
                  Tente outro título,
                  autor ou gênero.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setCategoriaAtiva(
                      "Todos"
                    );
                  }}
                >
                  EXPLORAR NOVAMENTE
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="explorar-secao">
              <div className="explorar-cabecalho">
                <div>
                  <span>
                    OS MAIS QUERIDOS
                  </span>

                  <h2>
                    Mais bem avaliados
                  </h2>
                </div>

                <span className="explorar-ornamento">
                  ✦
                </span>
              </div>

              {renderCards(
                maisBemAvaliados
              )}
            </section>

            <section className="explorar-secao">
              <div className="explorar-cabecalho">
                <div>
                  <span>
                    O QUE ESTÁ DESPERTANDO
                    CURIOSIDADE
                  </span>

                  <h2>
                    Em alta
                  </h2>
                </div>

                <span className="explorar-ornamento">
                  ◇
                </span>
              </div>

              {renderCards(emAlta)}
            </section>

            <section className="explorar-secao">
              <div className="explorar-cabecalho">
                <div>
                  <span>
                    RECÉM-CHEGADOS À
                    BIBLIOTECA
                  </span>

                  <h2>
                    Descobertas recentes
                  </h2>
                </div>

                <span className="explorar-ornamento">
                  ☾
                </span>
              </div>

              {renderCards(recentes)}
            </section>

            <section className="explorar-banner">
              <div className="explorar-banner-ornamento">
                ✦
              </div>

              <span>
                UMA HISTÓRIA PARA CADA
                MOMENTO
              </span>

              <h2>
                Talvez seu próximo
                livro esteja aqui.
              </h2>

              <p>
                Caminhe pelas estantes,
                siga sua curiosidade e
                deixe a biblioteca escolher
                o próximo capítulo.
              </p>

              <button
                type="button"
                onClick={() =>
                  setCategoriaAtiva(
                    "Fantasia"
                  )
                }
              >
                COMEÇAR A DESCOBRIR →
              </button>
            </section>
          </>
        )}
      </section>

      <footer className="explorar-rodape">
        <span>
          AVELUNE © 2026
        </span>

        <span>
          ONDE CADA HISTÓRIA ENCONTRA
          SEU LEITOR
        </span>

        <span>✦</span>
      </footer>

      {livroSelecionado && (
        <div
          className="explorar-modal"
          onClick={fecharLivro}
        >
          <div
            className="explorar-modal-conteudo"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="explorar-modal-fechar"
              aria-label="Fechar"
              onClick={fecharLivro}
            >
              ×
            </button>

            <div
              className={`explorar-modal-capa ${livroSelecionado.cor}`}
            >
              <div className="explorar-capa-moldura">
                <span className="explorar-canto top-left">
                  ❖
                </span>

                <span className="explorar-canto top-right">
                  ❖
                </span>

                <span className="explorar-canto bottom-left">
                  ❖
                </span>

                <span className="explorar-canto bottom-right">
                  ❖
                </span>
              </div>

              {livroSelecionado.real && livroSelecionado.capaUrl ? (
                <img
                  className="explorar-capa-imagem-real"
                  src={livroSelecionado.capaUrl}
                  alt={`Capa de ${livroSelecionado.titulo}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <div className="explorar-capa-brilho" />
                  <span className="explorar-simbolo">
                    {livroSelecionado.simbolo}
                  </span>
                  <div className="explorar-capa-texto">
                    <small>AVELUNE</small>
                    <strong>{livroSelecionado.titulo}</strong>
                    <span>{livroSelecionado.autor}</span>
                  </div>
                </>
              )}
            </div>

            <div className="explorar-modal-informacoes">
              <span className="explorar-modal-genero">
                {livroSelecionado.genero}
              </span>

              <h2>
                {livroSelecionado.titulo}
              </h2>

              <p className="explorar-modal-autor">
                por{" "}
                <strong>
                  {livroSelecionado.autor}
                </strong>
              </p>

              <div className="explorar-modal-avaliacao">
                <span>★</span>

                <strong>
                  {livroSelecionado.avaliacao}
                </strong>

                <small>
                  avaliação da biblioteca
                </small>
              </div>

              <div className="explorar-modal-divisor" />

              <p className="explorar-modal-sinopse">
                {livroSelecionado.sinopse}
              </p>

              <div className="explorar-modal-acoes">
                <button
                  type="button"
                  className={
                    queroLer.includes(livroSelecionado.titulo)
                      ? "principal ativo"
                      : "principal"
                  }
                  onClick={() =>
                    alternarQueroLer(livroSelecionado.titulo)
                  }
                >
                  {queroLer.includes(livroSelecionado.titulo)
                    ? "✓ NA MINHA ESTANTE"
                    : "＋ QUERO LER"}
                </button>

                <button
                  type="button"
                  className={
                    favoritos.includes(livroSelecionado.titulo)
                      ? "secundario ativo"
                      : "secundario"
                  }
                  onClick={() =>
                    alternarFavorito(livroSelecionado.titulo)
                  }
                >
                  {favoritos.includes(livroSelecionado.titulo)
                    ? "♥ FAVORITADO"
                    : "♡ FAVORITAR"}
                </button>

                {livroSelecionado.amazonUrl && (
                  <a
                    className="secundario amazon"
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

export default Explorar;