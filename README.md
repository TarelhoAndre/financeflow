# FinanceFlow

Aplicação web de **gestão financeira pessoal** desenvolvida com **Next.js, TypeScript, Tailwind CSS e Supabase**.

O FinanceFlow permite que o usuário acompanhe receitas, despesas, categorias, orçamentos mensais, metas financeiras e relatórios em uma interface moderna, responsiva e integrada a autenticação e banco de dados.

O projeto também possui uma **demonstração pública**, permitindo que visitantes explorem a aplicação sem precisar criar uma conta.

---

## Sobre o projeto

O **FinanceFlow** foi desenvolvido com o objetivo de centralizar o controle financeiro pessoal em um único ambiente.

A aplicação permite registrar movimentações financeiras, acompanhar o saldo, analisar os principais gastos, definir limites de orçamento e criar metas para objetivos futuros.

Além da aplicação autenticada, o projeto possui uma rota de demonstração para apresentação em portfólio e testes por recrutadores ou visitantes.

---

## Funcionalidades

### Autenticação

- Cadastro de usuário
- Login
- Logout
- Sessão persistente com Supabase Auth
- Proteção de rotas privadas
- Redirecionamento de usuários não autenticados
- Criação automática de perfil após o cadastro
- Criação automática de categorias iniciais

### Dashboard

- Visualização do saldo atual
- Total de receitas
- Total de despesas
- Percentual de economia
- Gastos agrupados por categoria
- Transações recentes
- Cadastro rápido de novas transações
- Exclusão de transações

### Transações

- Cadastro de receitas
- Cadastro de despesas
- Edição de transações
- Exclusão de transações
- Busca por descrição
- Filtro por tipo
- Filtro por categoria
- Filtro por mês
- Resumo financeiro das movimentações

### Categorias

- Cadastro de categorias
- Edição de categorias
- Exclusão de categorias
- Separação entre categorias de receita e despesa
- Busca de categorias
- Associação de categorias às transações

### Orçamentos

- Criação de orçamento mensal por categoria
- Edição de orçamento
- Exclusão de orçamento
- Comparação entre limite e valor gasto
- Indicador visual de utilização
- Cálculo de valor restante
- Seleção por mês

### Metas financeiras

- Criação de metas
- Definição de valor objetivo
- Definição de valor atual
- Definição de prazo
- Acompanhamento de progresso
- Adição de valores à meta
- Edição e exclusão de metas

### Relatórios

- Resumo mensal
- Total de receitas
- Total de despesas
- Saldo do período
- Taxa de economia
- Gastos por categoria
- Movimentação financeira por dia
- Listagem das transações do período
- Exportação de dados em CSV

### Demo pública

- Acesso sem autenticação
- Dados fictícios
- Ambiente separado das informações reais dos usuários
- Ideal para apresentação em portfólio
- Possibilidade de expansão para os módulos de transações, categorias, orçamentos, metas e relatórios

---

##  Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| Next.js 16 | Framework principal |
| React | Interface da aplicação |
| TypeScript | Tipagem e desenvolvimento |
| Tailwind CSS | Estilização |
| Supabase | Backend, banco de dados e autenticação |
| PostgreSQL | Banco de dados |
| Supabase Auth | Cadastro, login e sessão |
| Row Level Security | Segurança dos dados por usuário |
| Vercel | Hospedagem e deploy |
| Git | Controle de versão |
| GitHub | Repositório do projeto |

---

## Arquitetura

O projeto utiliza a arquitetura do **App Router do Next.js**.

A aplicação é dividida em módulos independentes:

```text
FinanceFlow
│
├── Autenticação
│   ├── Login
│   ├── Cadastro
│   └── Logout
│
├── Dashboard
│
├── Transações
│
├── Categorias
│
├── Orçamentos
│
├── Metas
│
├── Relatórios
│
├── Demo pública
│
└── Supabase
    ├── Auth
    ├── PostgreSQL
    └── RLS
```

---

## Estrutura principal do projeto

```text
financeflow/
│
├── app/
│   ├── auth/
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── ...
│   │
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── dashboard-client.tsx
│   │   └── loading.tsx
│   │
│   ├── transactions/
│   ├── categories/
│   ├── budgets/
│   ├── goals/
│   ├── reports/
│   ├── demo/
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── auth-button.tsx
│   ├── logout-button.tsx
│   ├── app-sidebar.tsx
│   ├── app-frame.tsx
│   └── ...
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── proxy.ts
│   │
│   └── utils.ts
│
├── public/
│
├── proxy.ts
├── package.json
├── tsconfig.json
├── next.config.*
└── README.md
```

> A estrutura pode sofrer pequenas alterações conforme a evolução do projeto.

---

## Autenticação

O FinanceFlow utiliza **Supabase Auth**.

O usuário pode criar uma conta utilizando e-mail e senha.

Após autenticar, o Supabase cria uma sessão e as páginas privadas utilizam essa sessão para determinar se o usuário possui acesso.

Fluxo simplificado:

```text
Usuário
   │
   ▼
Login / Cadastro
   │
   ▼
Supabase Auth
   │
   ▼
Sessão autenticada
   │
   ▼
Dashboard
```

Usuários sem sessão válida são direcionados para:

```text
/auth/login
```

---

## 🗄️ Banco de dados

O banco de dados utiliza PostgreSQL através do Supabase.

### Tabela `profiles`

Armazena informações relacionadas ao usuário.

| Campo | Tipo |
|---|---|
| id | uuid |
| full_name | text |
| created_at | timestamp |
| updated_at | timestamp |

O campo `id` está relacionado ao usuário da tabela `auth.users`.

---

### Tabela `categories`

Armazena as categorias financeiras.

| Campo | Tipo |
|---|---|
| id | uuid |
| user_id | uuid |
| name | text |
| type | income / expense |
| created_at | timestamp |

Exemplos:

**Receitas**

```text
Salário
Freelance
```

**Despesas**

```text
Alimentação
Moradia
Transporte
Lazer
Saúde
Contas
Outros
```

---

### Tabela `transactions`

Armazena receitas e despesas.

| Campo | Tipo |
|---|---|
| id | uuid |
| user_id | uuid |
| category_id | uuid |
| description | text |
| amount | numeric |
| type | income / expense |
| transaction_date | date |
| created_at | timestamp |
| updated_at | timestamp |

---

### Tabela `budgets`

Armazena os limites mensais definidos pelo usuário.

| Campo | Tipo |
|---|---|
| id | uuid |
| user_id | uuid |
| category_id | uuid |
| amount | numeric |
| month | date |
| created_at | timestamp |

Existe uma restrição para impedir dois orçamentos iguais para a mesma categoria no mesmo mês:

```text
user_id + category_id + month
```

---

### Tabela `goals`

Armazena metas financeiras.

| Campo | Tipo |
|---|---|
| id | uuid |
| user_id | uuid |
| name | text |
| target_amount | numeric |
| current_amount | numeric |
| target_date | date |
| created_at | timestamp |
| updated_at | timestamp |

---

## Row Level Security

Todas as tabelas privadas utilizam **Row Level Security (RLS)**.

As políticas garantem que cada usuário possa visualizar e alterar somente os seus próprios dados.

Exemplo conceitual:

```sql
auth.uid() = user_id
```

As políticas são aplicadas para operações de:

```text
SELECT
INSERT
UPDATE
DELETE
```

Isso impede que um usuário autenticado consulte ou modifique registros pertencentes a outro usuário.

---

## Trigger de criação de usuário

Após um novo usuário ser criado, um trigger no banco pode executar automaticamente a função:

```sql
public.handle_new_user()
```

Essa função é responsável por:

- criar o perfil do usuário;
- adicionar categorias iniciais de receita;
- adicionar categorias iniciais de despesa.

Isso garante que uma nova conta já esteja pronta para começar a registrar movimentações.

---

## Rotas da aplicação

### Públicas

```text
/
```

Landing page do FinanceFlow.

```text
/demo
```

Demonstração pública da aplicação.

```text
/auth/login
```

Login.

```text
/auth/sign-up
```

Cadastro.

---

### Privadas

```text
/dashboard
```

Visão geral das finanças.

```text
/transactions
```

Gerenciamento de transações.

```text
/categories
```

Gerenciamento de categorias.

```text
/budgets
```

Controle de orçamento mensal.

```text
/goals
```

Metas financeiras.

```text
/reports
```

Relatórios e análises.

---

## Variáveis de ambiente

Crie um arquivo:

```text
.env.local
```

na raiz do projeto.

Adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=SEU_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_SUPABASE_PUBLISHABLE_KEY
```

Essas informações podem ser encontradas no painel do Supabase.

> Nunca publique chaves privadas, senhas ou a `service_role` no frontend ou no repositório.

---

## Executando localmente

### Pré-requisitos

Tenha instalado:

```text
Node.js 20+
npm
Git
```

### Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd financeflow
```

Instale as dependências:

```bash
npm install
```

Crie o `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=SEU_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_SUPABASE_PUBLISHABLE_KEY
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

---

## Scripts

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Produção local

```bash
npm run start
```

### Verificação de tipos

```bash
npx tsc --noEmit
```

### Lint

```bash
npm run lint
```

---

## Deploy na Vercel

O projeto pode ser publicado através da Vercel.

### Passos

1. Envie o projeto para um repositório GitHub.
2. Acesse a Vercel.
3. Importe o repositório.
4. Configure as variáveis de ambiente.
5. Realize o deploy.

Variáveis necessárias:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

No Supabase, configure também as URLs permitidas de autenticação para o endereço de produção.

Exemplo:

```text
http://localhost:3000/**
https://SEU-DOMINIO.vercel.app/**
```

---

## Deploy automático

Quando o projeto está conectado ao GitHub pela Vercel, novos commits enviados para a branch de produção podem gerar automaticamente um novo deploy.

Exemplo:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push
```

---

## Exportação CSV

A área de relatórios permite exportar as movimentações financeiras em arquivo CSV.

O arquivo pode ser utilizado em:

- Microsoft Excel;
- Google Sheets;
- LibreOffice Calc;
- ferramentas de análise de dados.

---

## Interface

A interface foi construída utilizando Tailwind CSS.

Características principais:

- tema escuro;
- detalhes em cyan;
- cards financeiros;
- sidebar de navegação;
- layout responsivo;
- feedback visual para receitas e despesas;
- modais para cadastro e edição;
- barras de progresso;
- navegação focada em produtividade.

---

## Responsividade

O FinanceFlow foi desenvolvido para funcionar em diferentes tamanhos de tela.

A interface pode ser utilizada em:

```text
Desktop
Notebook
Tablet
Smartphone
```

A navegação e os componentes podem ser adaptados conforme o tamanho da tela.

---

## Segurança

Algumas medidas utilizadas no projeto:

- autenticação com Supabase;
- proteção de rotas;
- Row Level Security;
- relacionamento dos registros com `user_id`;
- validação de sessão;
- chaves públicas armazenadas em variáveis de ambiente;
- banco de dados separado por usuário;
- operações protegidas por políticas PostgreSQL.

---

## Testando o projeto

Antes de realizar um deploy, recomenda-se executar:

```bash
npx tsc --noEmit
```

Depois:

```bash
npm run build
```

Também é recomendado testar manualmente:

```text
Cadastro
Login
Logout
Criação de transação
Edição de transação
Exclusão de transação
Criação de categoria
Criação de orçamento
Criação de meta
Relatórios
Exportação CSV
Demo pública
Responsividade
```

---

## Fluxo da aplicação

```text
Landing Page
      │
      ├──────────────► Demo
      │
      ├──────────────► Login
      │
      └──────────────► Cadastro
                           │
                           ▼
                     Supabase Auth
                           │
                           ▼
                       Dashboard
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
         Transações    Orçamentos      Metas
              │
              ▼
          Categorias
              │
              ▼
          Relatórios
```

---

## Melhorias futuras

Algumas funcionalidades que podem ser adicionadas futuramente:

- gráficos interativos;
- comparação entre meses;
- relatórios anuais;
- recorrência de transações;
- contas bancárias;
- cartões de crédito;
- controle de parcelas;
- notificações de orçamento;
- lembretes de vencimento;
- recuperação de senha aprimorada;
- autenticação social;
- modo claro e escuro;
- dashboard personalizável;
- PWA;
- importação de extratos;
- categorização automática;
- integração com APIs financeiras;
- testes automatizados;
- melhorias de acessibilidade.

---

## Objetivo acadêmico e profissional

O FinanceFlow também funciona como projeto de portfólio para demonstrar conhecimentos em:

```text
Next.js
React
TypeScript
Frontend
Backend
PostgreSQL
Supabase
Autenticação
APIs
Segurança
CRUD
Responsividade
Deploy
Git
GitHub
Vercel
```

O projeto demonstra a construção de uma aplicação Full Stack, desde a interface até autenticação, persistência, regras de segurança e publicação em produção.

---

## Autor

**André Tarelho**

Estudante de **Análise e Desenvolvimento de Sistemas**, com interesse em desenvolvimento Full Stack, automação e construção de aplicações web modernas.

Disponível para oportunidades de estágio e posições júnior.

---

## Licença

Este projeto foi desenvolvido para fins de estudo, aprendizado e portfólio.

Caso deseje disponibilizá-lo como projeto open source, adicione uma licença como MIT ao repositório.

---

<p align="center">
  Desenvolvido com computador utilizando Next.js, TypeScript, Supabase e Tailwind CSS.
</p>
