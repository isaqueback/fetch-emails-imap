# Monitor de Caixa de Entrada de E-mail & Gerenciamento de Servidor IaaS

## Visão Geral

Este projeto, **Monitor de Caixa de Entrada de E-mail & Gerenciamento de Servidor IaaS**, é uma solução avançada para monitoramento de alertas críticos via e-mail e gerenciamento automatizado de servidores IaaS. Adiciona a funcionalidade de filtrar e excluir e-mails não essenciais, focando nas notificações críticas para ação imediata.

## Pré-requisitos

- **Node.js**: Necessário para execução do aplicativo.
- **npm**: Gerenciador de pacotes para instalar as dependências.

## Tecnologias Utilizadas

- **TypeScript**: Desenvolvido em TypeScript para execução em ambiente Node.js.

## Como Começar

1. **Baixe o Projeto**: Clone ou faça o download deste repositório.
2. **Instale as Dependências**: Execute `npm install` no diretório raiz.
3. **Configure Variáveis de Ambiente**: Crie um arquivo `.env` seguindo o exemplo `.env.example`.
4. **Configuração de E-mail**: Ajuste as configurações conforme necessário em `monitoringMailConfig.ts`.

## Execução

- **Desenvolvimento**: Execute `npm run dev`.
- **Produção**: Construa com `npm run build` e inicie com `npm run start`.

## Funcionalidades

- Monitoramento contínuo de e-mails por alertas críticos.
- Gerenciamento de servidores via API de provedores IaaS.
- Filtragem e exclusão de e-mails não essenciais.

---

Projeto essencial para a manutenção da saúde do servidor e automação de respostas a alertas críticos.