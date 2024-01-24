# 🤔 O que  faz
Busca todos as mensagens de e-mails da caixa de entrada utilizando o protocolo IMAP. É possível filtrar por título, corpo ou remetente da mensagem por meio de entrada de dados do terminal. O resultado sai em forma de array pelo terminal.
<br>
<br>
# 💻 Linguagens utilizadas
Node.js (Typescript).
<br>
<br>
# 🚀 Como inicializar
Primeiro crie rode ```npm i``` para fazer o download das dependências.
Em seguida, crie um arquivo ```.env``` na pasta raiz do projeto e estabeça quatro variáveis ambientes, USER, PASSWORD, HOST e PORT, o primeiro é o seu endereço de e-mail, o segundo é a palavra passe (senha), o terceiro é o host do provedor de e-mail para IMAP e o último é a porta do provedor de e-mail para IMAP.

Não esqueça também de configurar os valores que estão no arquivo mail.ts de acordo com o servidor do seu provedor de e-mail.
<br>
<br>
# 🛠️ Rodar em ambiente de desenvolvimento
Rode ```npm run dev```.
<br>
<br>
# 🏢 Rodar em ambiente de produção
Rode ```npm run build```. Depois rode ```npm run start```.
