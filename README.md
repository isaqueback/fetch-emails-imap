# Monitor de Caixa de Entrada de E-mail & Reinicialização de Servidor IaaS

## 🤔 O que Faz
Este aplicativo monitora continuamente uma caixa de entrada de e-mail em busca de novas mensagens que atendam a critérios específicos, incluindo um remetente e corpo da mensagem particulares. Quando uma mensagem correspondente é recebida, ela é automaticamente excluída e um servidor IaaS é reiniciado por meio de sua API.

## 📦 Pré-requisitos
- **Node.js**: O aplicativo requer que o Node.js esteja instalado em seu computador. Recomenda-se usar a versão mais recente.
- **npm**: O npm (Node Package Manager) também é necessário para gerenciar as dependências do aplicativo.

## 💻 Tecnologias Utilizadas
- **TypeScript**: O aplicativo é escrito em TypeScript, um superconjunto tipado do JavaScript, e executa em um ambiente Node.js.

## 🚀 Como Começar
1. **Baixe o Projeto**: Clone ou faça o download deste repositório do GitHub para sua máquina local.
2. **Instale as Dependências**: No diretório raiz do projeto, execute `npm install` para baixar as dependências necessárias.
3. **Variáveis de Ambiente**: Crie um arquivo `.env` no diretório raiz e configure as variáveis de ambiente necessárias. Consulte o arquivo `.env.example` fornecido no projeto como um modelo. Substitua os valores de exemplo pelos seus dados reais.
4. **Configuração de E-mail**: Modifique as configurações no arquivo `mail.ts` se necessário.

## 🛠️ Executando em Ambiente de Desenvolvimento
Para iniciar o aplicativo em um ambiente de desenvolvimento, execute o comando `npm run dev`.

## 🏢 Executando em Ambiente de Produção
Para uso em produção, primeiro construa o aplicativo executando `npm run build`. Em seguida, inicie o aplicativo com `npm run start`.
