Avelune

Um espaço digital para leitores descobrirem livros, organizarem suas
leituras e compartilharem experiências com outras pessoas.

Sobre o projeto

O Avelune é uma aplicação web voltada para leitores. A proposta é
reunir, em uma única experiência, descoberta de livros, organização da
biblioteca pessoal e interação com uma comunidade literária.

A interface foi desenvolvida com uma identidade visual inspirada em
literatura, utilizando uma estética escura, elegante e minimalista, com
elementos decorativos e foco em uma navegação simples.

O projeto também foi estruturado pensando na experiência do usuário:
ações importantes devem estar acessíveis com poucos cliques,
especialmente dentro da Comunidade.

Funcionalidades

Biblioteca

A Biblioteca permite:

visualizar livros disponíveis;

pesquisar por título, autor ou gênero;

filtrar livros por categoria;

visualizar a estante pessoal;

marcar livros como favoritos;

adicionar ou remover livros da lista "Quero ler";

abrir detalhes de um livro.

Os favoritos e a lista de leitura são persistidos no localStorage.

Explorar

A área Explorar apresenta livros organizados para descoberta.

É possível:

pesquisar livros;

filtrar por gênero;

visualizar livros em cards;

consultar avaliação;

favoritar livros;

adicionar livros à estante;

abrir os detalhes de uma obra.

Comunidade

A Comunidade é o espaço social do Avelune.

O usuário pode:

visualizar publicações;

alternar entre "Para você", "Seguindo" e "Recentes";

publicar textos;

publicar fotos;

adicionar citações;

curtir publicações;

salvar publicações;

comentar;

visualizar comentários;

marcar publicações como spoiler;

revelar conteúdos marcados como spoiler.

Criação de resenhas

A criação de resenhas foi integrada diretamente ao compositor da
Comunidade.

Em vez de existir uma página separada para resenhas, o usuário pode
clicar diretamente no botão de Resenha no campo de publicação e
preencher:

livro;

autor;

nota de 1 a 5 estrelas;

texto da experiência de leitura;

foto, quando desejado;

indicação de spoiler.

Essa abordagem reduz etapas e deixa a criação de conteúdo mais rápida.

Perfil

O perfil permite visualizar informações do leitor, incluindo:

nome;

nome de usuário;

biografia;

foto de perfil;

quantidade de publicações;

seguidores;

pessoas seguidas;

livros na estante.

Também existe edição de perfil e encerramento da sessão.

Autenticação

O projeto possui fluxo de:

criação de conta;

login;

confirmação de senha no cadastro;

exibição/ocultação de senha;

controle de sessão;

logout.

Usuários não autenticados conseguem navegar pelo conteúdo público, mas
ações de participação na comunidade exigem uma conta.

Tecnologias

O projeto utiliza principalmente:

React

TypeScript

Vite

CSS

Supabase

JavaScript/TypeScript APIs do navegador

localStorage

HTML5

Também existem elementos de interface e experiências visuais
desenvolvidos com Three.js, utilizados na experiência inicial do
Avelune.

Arquitetura da aplicação

A aplicação possui uma navegação centralizada no App.tsx.

As principais áreas são:

Avelune
│
├── Início
│
├── Biblioteca
│
├── Explorar
│
├── Comunidade
│   ├── Publicações
│   └── Criação de resenhas pelo compositor
│
├── Perfil
│
└── Autenticação
    ├── Login
    └── Cadastro

A navegação utiliza o hash da URL, permitindo acessar áreas como:

#biblioteca
#explorar
#comunidade
#perfil
#auth-login
#auth-cadastro

A página inicial não utiliza uma rota independente de resenhas. A
experiência de resenha faz parte da Comunidade.

Organização dos principais arquivos

Uma estrutura esperada para o projeto é:

src/
│
├── App.tsx
├── App.css
│
├── components/
│   └── componentes reutilizáveis
│
├── lib/
│   └── supabase.ts
│
├── pages/
│   ├── Auth.tsx
│   ├── Biblioteca.tsx
│   ├── Comunidade.tsx
│   ├── Explorar.tsx
│   └── Perfil.tsx
│
└── three/
    └── Scene.ts

App.tsx

Responsável pela navegação principal e pela escolha da página exibida.

O componente mantém o estado da página atual e encaminha a função
onNavigate para as páginas.

Biblioteca.tsx

Responsável pela biblioteca de livros, filtros, busca, favoritos e lista
de leitura.

Explorar.tsx

Responsável pela descoberta de livros e pelos filtros de exploração.

Comunidade.tsx

Responsável pelo feed social, publicações, fotos, citações, curtidas,
comentários, spoilers e criação de resenhas.

Perfil.tsx

Responsável pelos dados e configurações do perfil do leitor.

Auth.tsx

Responsável pelos fluxos de login e cadastro.

lib/supabase.ts

Centraliza a configuração e o acesso ao Supabase utilizado pela
aplicação.

three/Scene.ts

Responsável pela experiência visual tridimensional utilizada na entrada
do Avelune.

Supabase

O Supabase é utilizado para recursos que precisam de persistência e
autenticação.

A Comunidade utiliza dados relacionados a:

profiles
publicacoes
curtidas
comentarios

As publicações possuem informações como:

usuário;

texto;

livro;

autor do livro;

avaliação;

foto;

quantidade de curtidas;

quantidade de comentários;

data de criação;

spoiler.

As imagens publicadas na Comunidade são enviadas para o Storage do
Supabase.

Persistência local

Algumas informações de experiência do usuário são mantidas no navegador
com localStorage.

Entre elas:

avelune-favoritos
avelune-quero-ler
avelune-comunidade-salvos

O perfil também utiliza armazenamento local como apoio à experiência,
enquanto o Supabase permanece como fonte principal para os dados
persistidos no servidor.

Fluxo de publicação

O fluxo principal da Comunidade funciona assim:

Usuário entra na Comunidade
        ↓
Escreve uma publicação
        ↓
Escolhe uma ação opcional
   ┌────┼────┐
   ↓    ↓    ↓
Resenha Foto Citação
   ↓
Preenche os dados necessários
        ↓
Publica
        ↓
Dados enviados ao Supabase
        ↓
Publicação aparece no feed

Para uma resenha, o usuário não precisa sair da Comunidade ou abrir
outra página.

Experiência do usuário

Um dos princípios adotados no projeto é reduzir a quantidade de
cliques necessários para realizar ações frequentes.

Por isso:

resenhas ficam dentro da Comunidade;

a criação de resenha acontece diretamente no compositor;

foto e citação ficam disponíveis no mesmo espaço;

ações possuem estados visuais;

usuários não autenticados recebem orientação para criar uma conta
quando tentam realizar ações restritas.

Acessibilidade

A interface utiliza recursos como:

aria-label;

aria-expanded;

aria-modal;

role="dialog";

role="status";

role="alert;

estados visuais para botões;

textos alternativos em imagens.

Esses recursos ajudam tecnologias assistivas e melhoram a compreensão
das ações da interface.

Como executar o projeto

Como o projeto utiliza Vite, o fluxo normalmente é:

npm install
npm run dev

Depois, abra o endereço informado pelo Vite no terminal.

Para gerar a versão de produção:

npm run build

Para visualizar a build:

npm run preview

Os comandos acima pressupõem que o package.json do projeto esteja
configurado com os scripts padrão do Vite.

Configuração do Supabase

Para executar funcionalidades que dependem do Supabase, configure as
variáveis de ambiente utilizadas pelo projeto.

Um exemplo de arquivo .env pode ser:

VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon

Não coloque chaves privadas ou credenciais administrativas no código
do frontend.

Banco de dados

A aplicação espera estruturas relacionadas à autenticação e às
funcionalidades sociais, incluindo tabelas como:

profiles
publicacoes
curtidas
comentarios

Também existem funcionalidades do perfil e leitura que podem utilizar
estruturas como:

leituras
metas_leitura

A configuração definitiva das tabelas, políticas RLS, Storage e
permissões deve ser mantida no projeto Supabase correspondente.

Status do projeto

O Avelune está em desenvolvimento.

Implementado

Biblioteca

Explorar

Comunidade

Perfil

Login e cadastro

Publicações

Curtidas

Comentários

Favoritos

Lista "Quero ler"

Upload de imagens na Comunidade

Spoilers

Criação de resenhas dentro da Comunidade

Navegação por hash

Em evolução

Busca global da Comunidade

Recuperação de senha

Sistema completo de seguidores

Compartilhamento de publicações

Recursos sociais adicionais

Refinamento contínuo de responsividade e acessibilidade

Objetivo do projeto

O Avelune busca criar uma experiência de leitura mais social, permitindo
que o leitor não apenas encontre livros, mas também registre suas
leituras, organize sua biblioteca e compartilhe suas opiniões.

A aplicação foi pensada para aproximar descoberta, organização e
comunidade em uma única plataforma.

Desenvolvimento

Projeto desenvolvido como aplicação web autoral para estudo, portfólio e
evolução prática em desenvolvimento frontend e integração com serviços
backend.

Avelune --- Onde cada história encontra seu leitor.
