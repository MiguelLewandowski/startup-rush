# Startup Rush

Um sistema de torneio entre startups que competem por pontuação em rodadas eliminatórias, com base em eventos definidos por um administrador.

## Tecnologias

- **Next.js (App Router)** com **TypeScript**
- **Tailwind CSS** para UI moderna e responsiva
- **Prisma ORM** com banco **SQLite**
- **Zod** para validações
- **API REST** com rotas organizadas

## Funcionalidades

- Cadastro de startups (nome, slogan, data de fundação)
- Criação de rodadas e batalhas
- Sorteio automático de batalhas
- Aplicação de eventos com impacto na pontuação
- Gestão de feedbacks
- Visualização de classificação

## Como funciona

1. Cadastre de 4 a 8 startups para participar do torneio. Cada startup começa com 70 pontos.
2. Crie rodadas e sorteie as batalhas entre as startups participantes.
3. Aplique eventos nas batalhas, que podem aumentar ou diminuir os pontos das startups.
4. A startup com mais pontos em cada batalha avança para a próxima rodada.
5. Em caso de empate, ocorre o "Shark Fight", onde +2 pontos são adicionados aleatoriamente a uma das startups.
6. A startup campeã é aquela que vencer a batalha final!

## Eventos Disponíveis

- **Pitch convincente**: +6 pontos
- **Produto com bugs**: -4 pontos
- **Boa tração de usuários**: +3 pontos
- **Investidor irritado**: -6 pontos
- **Fake news no pitch**: -8 pontos

## Configuração do Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/startup-rush.git
cd startup-rush
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure o banco de dados:
```bash
npx prisma generate
npx prisma db push
```

4. (Opcional) Popule o banco de dados com exemplos:
```bash
npx ts-node prisma/seed.ts
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

6. Acesse o sistema no navegador:
```
http://localhost:3000
```

## Estrutura do Projeto

- `/src/app`: Páginas da aplicação usando App Router do Next.js
- `/src/app/api`: Endpoints da API REST
- `/src/components`: Componentes React reutilizáveis
- `/src/lib`: Bibliotecas e utilitários
- `/src/types`: Tipos TypeScript
- `/prisma`: Schema e configurações do Prisma ORM 