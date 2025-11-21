# 📋 Task Management API

API REST completa para gerenciamento de tarefas, construída com **Node.js**, **TypeScript**, **Express**, **MongoDB**, **Redis**, **Docker** e **testes unitários**.

[![Node.js](https://img.shields.io/badge/Node.js-22+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-Ready-blue)](https://docs.docker.com/compose/)
[![Tests](https://img.shields.io/badge/Tests-Vitest-yellow)](https://vitest.dev/)

---

## 📚 Índice

- [📋 Task Management API](#-task-management-api)
  - [📚 Índice](#-índice)
  - [🎯 Visão Geral](#-visão-geral)
  - [🛠 Stack Tecnológica](#-stack-tecnológica)
    - [Core](#core)
    - [Banco de Dados](#banco-de-dados)
    - [Validação e Documentação](#validação-e-documentação)
    - [Testes](#testes)
    - [DevOps](#devops)
  - [📋 Pré-requisitos](#-pré-requisitos)
  - [📦 Instalação](#-instalação)
    - [1. Clone o repositório](#1-clone-o-repositório)
    - [2. Instale as dependências](#2-instale-as-dependências)
      - [Use o gerenciador de pacotes de sua preferência:](#use-o-gerenciador-de-pacotes-de-sua-preferência)
  - [⚙️ Configuração](#️-configuração)
    - [1. Crie o arquivo `.env`](#1-crie-o-arquivo-env)
  - [🚀 Executando o Projeto](#-executando-o-projeto)
    - [Com Docker (Recomendado)](#com-docker-recomendado)
    - [Sem Docker (Local)](#sem-docker-local)
  - [🌱 Seed de Dados](#-seed-de-dados)
  - [📖 Documentação da API](#-documentação-da-api)
    - [Swagger UI](#swagger-ui)
    - [Scalar (UI Moderna)](#scalar-ui-moderna)
  - [🛣 Rotas Disponíveis](#-rotas-disponíveis)
    - [Health Check](#health-check)
    - [Tasks](#tasks)
    - [Users](#users)
  - [🔐 Autenticação](#-autenticação)
    - [Como obter uma API Key](#como-obter-uma-api-key)
  - [💾 Cache](#-cache)
    - [Estratégia de Cache](#estratégia-de-cache)
    - [Exemplos de Chaves](#exemplos-de-chaves)
    - [TTL (Time To Live)](#ttl-time-to-live)
    - [Invalidação](#invalidação)
  - [🧪 Testes](#-testes)
    - [Executar Testes](#executar-testes)
    - [Relatório de Cobertura](#relatório-de-cobertura)
  - [📝 Licença](#-licença)

---

## 🎯 Visão Geral

API de gerenciamento de tarefas com foco em:

- ✅ **Segurança** - Autenticação via API Key
- ✅ **Performance** - Cache inteligente com Redis
- ✅ **Escalabilidade** - Rate limiting por usuário
- ✅ **Qualidade** - Testes unitários
- ✅ **Documentação** - OpenAPI/Swagger integrado
- ✅ **Containerização** - Docker e Docker Compose

---

## 🛠 Stack Tecnológica

### Core
- **Node.js** 22+
- **TypeScript** 5.x
- **Express** - Framework

### Banco de Dados
- **MongoDB** - Banco principal (Mongoose)
- **Redis** - Cache e rate limiting

### Validação e Documentação
- **Zod** - Validação de schemas
- **OpenAPI** - Documentação da API
- **@scalar/express-api-reference** - UI de documentação moderna

### Testes
- **Vitest** - Framework de testes

### DevOps
- **Docker** & **Docker Compose**
- **tsx** - Execução TypeScript em desenvolvimento

---

## 📋 Pré-requisitos

- **Node.js** >= 22.x
- **pnpm** (ou npm/yarn)
- **Docker** e **Docker Compose** (para ambiente containerizado)

---

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd <nome-do-projeto>
```

### 2. Instale as dependências

#### Use o gerenciador de pacotes de sua preferência:
```bash
npm install
``` 

---

## ⚙️ Configuração

### 1. Crie o arquivo `.env`

```bash
cp .env.example .env
```

---

## 🚀 Executando o Projeto

### Com Docker (Recomendado)

```bash
# Subir todos os serviços (API + MongoDB + Redis) (hot reload)
npm run docker:dev:up

# Parar os serviços
npm run docker:dev:down
```

A API estará disponível em: **http://localhost:3333**

### Sem Docker (Local)

```bash
# Certifique-se de ter MongoDB e Redis rodando localmente

# Desenvolvimento (hot reload)
npm run dev

# Build
npm run build

# Produção
npm run start
```

---

## 🌱 Seed de Dados

Para popular o banco com usuários e API Keys de teste:

```bash
# Local
npm run seed

# Docker
Para ambiente dockerizado, esse processo já é executado automaticamente na inicialização da API.
```

Isso criará:
- Usuários de teste
- API Keys associadas a esses usuários.
```bash
{
  key: '8b4fae2b91c44b6d9d2e1b0d97e3a4d1',
  user_id: '7c1cc1d7-34c2-4f0e-9c2f-3fdab0e2f241',
  name: 'Aurora Labs',
},
{
  key: 'e8c15e9917c64df3afeafbb56b32c987',
  user_id: '4a97fb23-36c4-4642-84fa-cb11020b7ee8',
  name: 'Vertex Cloud',
},
{
  key: 'ab77efac9320467bb84c64af0e0e7951',
  user_id: 'f5e95e71-d683-48ea-a3c8-296cdcb22cc1',
  name: 'Quantum API',
},
```

- Criará também 1 task de exemplo para cada usuário.

---

## 📖 Documentação da API

A API possui documentação interativa disponível em:

### Swagger UI
```
http://localhost:3333/api/docs
```

### Scalar (UI Moderna)
```
http://localhost:3333/api/reference
```

---

## 🛣 Rotas Disponíveis

### Health Check

| Método | Rota          | Descrição                    | Auth |
| ------ | ------------- | ---------------------------- | ---- |
| GET    | `/api/health` | Status da API e dependências | ❌    |

**Resposta:**
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2025-01-01T12:00:00.000Z",
  "dependencies": {
    "mongo": "up",
    "redis": "up"
  }
}
```

---

### Tasks

Todas as rotas de tasks requerem autenticação via API Key.

| Método | Rota                      | Descrição                          | Auth |
| ------ | ------------------------- | ---------------------------------- | ---- |
| GET    | `/api/tasks`              | Listar tarefas (com paginação)     | ✅    |
| POST   | `/api/tasks`              | Criar nova tarefa                  | ✅    |
| GET    | `/api/tasks/:id`          | Buscar tarefa por ID               | ✅    |
| PUT    | `/api/tasks/:id`          | Atualizar tarefa                   | ✅    |
| DELETE | `/api/tasks/:id`          | Deletar tarefa                     | ✅    |
| PATCH  | `/api/tasks/:id/complete` | Marcar tarefa como feita/não feita | ✅    |

---

### Users

| Método | Rota     | Descrição               | Auth |
| ------ | -------- | ----------------------- | ---- |
| POST   | `/users` | Criar usuário + API Key | ❌    |

---


> ⚠️ **Importante:** Guarde a `api_key` retornada, ela não será exibida novamente!

---

## 🔐 Autenticação

A API utiliza **autenticação via API Key** no header:

```http
x-api-key: sua-api-key-aqui
```

### Como obter uma API Key

1. Crie um usuário via `POST /users`
2. Use a `api_key` retornada em todas as requisições protegidas

---

## 💾 Cache

O sistema utiliza **Redis** para cache inteligente de listagens.

### Estratégia de Cache

- **Chave base:** `tasks:<userId>`
- **Filtros adicionados:** ordenados alfabeticamente
  - `done=<true|false>`
  - `limit=<n>`
  - `page=<n>`

### Exemplos de Chaves

```
tasks:user-123
tasks:user-123:limit=10:page=1
tasks:user-123:done=true:limit=10:page=1
```

### TTL (Time To Live)

- Padrão: **300 segundos** (5 minutos)
- Configurável via `CACHE_TTL` no `.env`

### Invalidação

O cache é invalidado automaticamente quando:
- Uma task é criada
- Uma task é atualizada
- Uma task é deletada

---

## 🧪 Testes

O projeto possui **testes unitários** usando **Vitest**.

### Executar Testes

```bash
# Todos os testes
npm run test

# Modo watch (desenvolvimento)
npm run test:watch

# Com cobertura
npm run test:coverage
```
---

### Relatório de Cobertura

Após rodar `npm run test:coverage`, abra:

```
coverage/index.html
```
---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.****