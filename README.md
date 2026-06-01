# Conta Clara

Um controle financeiro simples para pessoas comuns e casais que querem parar de se perder nas contas.

O **Conta Clara** é uma aplicação web em desenvolvimento para ajudar usuários a organizarem receitas, despesas, categorias, contas pendentes e resumo mensal de forma simples, limpa e confiável.

## Objetivo do projeto

O objetivo do Conta Clara é oferecer uma experiência financeira fácil de usar, sem a complexidade de sistemas bancários ou planilhas avançadas.

A proposta é permitir que o usuário:

- cadastre receitas e despesas;
- acompanhe o saldo previsto do mês;
- visualize contas pendentes;
- organize lançamentos por categorias;
- acompanhe receitas e despesas em gráfico;
- mantenha seus dados separados e protegidos por usuário.

## Status atual

Projeto em desenvolvimento.

A primeira fase funcional já conta com:

- autenticação de usuário;
- proteção de rotas privadas;
- onboarding inicial;
- criação automática de categorias padrão;
- cadastro de lançamentos financeiros;
- listagem de lançamentos;
- edição de lançamentos;
- cancelamento de lançamentos;
- marcação de lançamentos como pagos;
- dashboard com resumo mensal;
- gráfico de receitas x despesas;
- tela de categorias;
- tela de perfil;
- tela de configurações do espaço financeiro;
- layout interno padronizado;
- componentes visuais reutilizáveis.

## Stack utilizada

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- React Hook Form
- Zod
- Recharts

## Funcionalidades implementadas

### Autenticação

- Cadastro de usuário
- Login
- Logout
- Proteção de rotas internas
- Redirecionamentos conforme sessão do usuário
- Bloqueio de acesso a login/cadastro quando o usuário já está autenticado

### Onboarding

- Criação/configuração inicial do espaço financeiro
- Definição do tipo de uso
- Definição de renda mensal aproximada
- Redirecionamento para o dashboard após conclusão

### Dashboard

- Resumo mensal
- Total de receitas do mês
- Total de despesas do mês
- Saldo previsto
- Quantidade de contas pendentes
- Últimos lançamentos
- Próximas contas pendentes
- Gráfico de receitas x despesas

### Lançamentos

- Cadastro de receita ou despesa
- Seleção de categoria
- Definição de valor
- Definição de data de vencimento
- Definição de status
- Definição de forma de pagamento
- Campo de observações
- Listagem de lançamentos
- Filtros por tipo, status e mês
- Edição de lançamento
- Marcar lançamento como pago
- Cancelar lançamento sem apagar histórico

### Categorias

- Criação automática de categorias padrão
- Listagem de categorias
- Separação entre receitas e despesas
- Criação de categorias personalizadas
- Edição do nome da categoria
- Ativação e desativação de categorias
- Categorias vinculadas ao espaço financeiro do usuário

### Perfil

- Visualização de dados básicos do usuário
- Edição do nome completo
- Edição do telefone
- E-mail exibido como somente leitura

### Configurações

- Visualização do espaço financeiro
- Edição do nome do controle financeiro
- Edição do tipo de uso
- Edição da renda mensal aproximada

## Segurança e dados

O projeto utiliza Supabase com PostgreSQL e políticas de segurança por usuário.

A estrutura foi pensada para que os dados financeiros sejam vinculados ao usuário autenticado e ao seu respectivo espaço financeiro.

Principais cuidados aplicados:

- rotas internas protegidas;
- consultas filtradas pelo usuário ou pelo espaço financeiro;
- uso de `financial_space` para isolar dados;
- uso de RLS no Supabase;
- ações de atualização filtradas por `financial_space`;
- separação de dados por usuário autenticado.

## Fluxo principal do usuário

1. Usuário cria uma conta.
2. Usuário faz login.
3. Usuário conclui o onboarding.
4. Sistema cria ou configura o espaço financeiro.
5. Sistema cria categorias padrão.
6. Usuário acessa o dashboard.
7. Usuário cadastra receitas e despesas.
8. Dashboard passa a exibir resumo mensal, gráfico e próximas contas.
9. Usuário pode editar, cancelar ou marcar lançamentos como pagos.
10. Usuário pode gerenciar categorias, perfil e configurações.

## Estrutura geral do projeto

```txt
app/
  (auth)/
    cadastro/
    login/
  (app)/
    dashboard/
    lancamentos/
    categorias/
    perfil/
    configuracoes/

components/
  brand/
  dashboard/
  ui/

lib/
  auth/
  validations/
  supabase/

services/
  categories.ts
  financial-space.ts
  profile.ts
  transactions.ts
```

## Variáveis de ambiente

Crie um arquivo `.env.local` com as variáveis do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Como rodar localmente

Instale as dependências:

```bash
npm install
```

Rode o projeto em ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse no navegador:

```txt
http://localhost:3000
```

Para validar o build:

```bash
npm run build
```

## Banco de dados

O projeto utiliza Supabase/PostgreSQL.

Tabelas principais utilizadas:

- `profiles`
- `financial_spaces`
- `categories`
- `transactions`

## Componentes visuais criados

- `Logo`
- `SummaryCard`
- `AppSection`
- `AppButton`
- `AppLinkButton`
- `IncomeExpenseChart`

Esses componentes ajudam a manter a interface mais consistente, reaproveitável e fácil de manter.

## Próximos passos

Algumas melhorias planejadas:

- melhorar responsividade mobile;
- adicionar ícones nos menus e ações;
- criar logo visual definitiva;
- melhorar experiência de edição de lançamentos;
- adicionar relatórios por período;
- adicionar filtros mais avançados;
- adicionar visão anual;
- melhorar mensagens de erro;
- preparar versão inicial para usuários reais testarem.

## Posicionamento do produto

> Um controle financeiro simples para pessoas comuns e casais que querem parar de se perder nas contas.

O Conta Clara busca ser simples, limpo, confiável e fácil de usar.
