# Conta Clara

Um controle financeiro simples para pessoas comuns, casais e famílias que querem parar de se perder nas contas do mês.

O **Conta Clara** é uma aplicação web em desenvolvimento para ajudar usuários a organizarem receitas, despesas, categorias, contas pendentes, cartões, parcelamentos, contas fixas e resumo mensal de forma simples, limpa e confiável.

---

## Objetivo do projeto

O objetivo do Conta Clara é oferecer uma experiência financeira fácil de usar, sem a complexidade de sistemas bancários, ERPs ou planilhas avançadas.

A proposta é permitir que o usuário:

- cadastre receitas e despesas;
- acompanhe o saldo previsto do mês;
- visualize o que já foi pago e o que ainda falta pagar;
- organize lançamentos por categorias;
- controle contas fixas;
- acompanhe compras parceladas;
- organize cartões e faturas;
- visualize relatórios simples do mês;
- faça fechamento mensal;
- mantenha seus dados organizados por espaço financeiro.

---

## Status atual

Projeto em desenvolvimento, em fase de preparação para testes beta.

A versão atual já conta com uma base funcional para uso real em testes controlados.

---

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
- Lucide React

---

## Funcionalidades implementadas

### Autenticação

- Cadastro de usuário
- Login
- Logout
- Proteção de rotas internas
- Redirecionamento conforme sessão do usuário
- Bloqueio de acesso a login/cadastro quando o usuário já está autenticado

---

### Onboarding

- Criação/configuração inicial do espaço financeiro
- Definição do tipo de uso
- Definição de renda mensal aproximada
- Criação automática de categorias padrão
- Redirecionamento para o app após conclusão

---

### Dashboard

- Resumo financeiro mensal
- Total de receitas do mês
- Total de despesas do mês
- Saldo previsto
- Valor já pago
- Valor que ainda falta pagar
- Últimos lançamentos
- Próximas despesas pendentes
- Gráfico de receitas x despesas
- Filtro por mês de referência

---

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
- Voltar lançamento pago para pendente
- Cancelar lançamento sem apagar histórico
- Bloqueio de alterações em meses fechados

---

### Categorias

- Criação automática de categorias padrão
- Listagem de categorias
- Separação entre receitas e despesas
- Criação de categorias personalizadas
- Edição do nome da categoria
- Ativação e desativação de categorias
- Categorias vinculadas ao espaço financeiro do usuário

---

### Contas fixas

- Cadastro de despesas recorrentes
- Controle de contas mensais
- Geração de lançamentos a partir de contas fixas
- Organização por categoria e vencimento

---

### Parcelamentos

- Cadastro de compras parceladas
- Controle de parcelas
- Geração de lançamentos mensais
- Acompanhamento de parcelas vinculadas ao espaço financeiro

---

### Cartões

- Cadastro de cartões
- Controle de compras no cartão
- Organização de faturas
- Geração de lançamentos relacionados ao cartão

---

### Relatórios

- Resumo financeiro do mês
- Análise de receitas e despesas
- Visualização por categorias
- Indicadores simples para tomada de decisão
- Fechamento mensal
- Reabertura de mês fechado
- Registro do resultado financeiro do mês

---

### Menu mobile

- Experiência mobile com tela principal de navegação
- Página `/menu` com atalhos rápidos
- Cards de acesso para as principais áreas do app
- Redirecionamento mobile para o menu após login
- Desktop preservado com sidebar lateral

---

### Perfil

- Visualização de dados básicos do usuário
- Edição do nome completo
- Edição do telefone
- E-mail exibido como somente leitura

---

### Configurações

- Visualização do espaço financeiro
- Edição do nome do controle financeiro
- Edição do tipo de uso
- Edição da renda mensal aproximada

---

## Segurança e dados

O projeto utiliza Supabase com PostgreSQL, autenticação de usuário e rotas privadas.

A estrutura foi pensada para que os dados financeiros sejam vinculados ao usuário autenticado e ao seu respectivo espaço financeiro.

Principais cuidados aplicados:

- rotas internas protegidas;
- consultas filtradas por usuário ou espaço financeiro;
- uso de `financial_space` para organizar os dados;
- ações de atualização filtradas por `financial_space`;
- separação de dados por usuário autenticado;
- preparação para políticas de segurança no Supabase.

Antes de uma versão pública, as regras de segurança e permissões do banco devem passar por uma revisão completa.

---

## Fluxo principal do usuário

1. Usuário cria uma conta.
2. Usuário faz login.
3. Usuário conclui o onboarding.
4. Sistema cria/configura o espaço financeiro.
5. Sistema cria categorias padrão.
6. Usuário acessa o menu principal no mobile ou o dashboard no desktop.
7. Usuário cadastra receitas e despesas.
8. Dashboard exibe resumo mensal, gráfico e pendências.
9. Usuário pode editar, cancelar, pagar ou reabrir lançamentos.
10. Usuário pode gerenciar categorias, contas fixas, parcelamentos, cartões, perfil e configurações.
11. Usuário pode acompanhar relatórios e fechar o mês.

---

## Estrutura geral do projeto

```txt
app/
  (auth)/
    cadastro/
    login/
  (app)/
    dashboard/
    menu/
    lancamentos/
    categorias/
    contas-fixas/
    parcelamentos/
    cartoes/
    relatorios/
    perfil/
    configuracoes/

components/
  auth/
  brand/
  dashboard/
  ui/

hooks/

lib/
  auth/
  validations/
  supabase/

services/
  categories.ts
  credit-cards.ts
  financial-space.ts
  fixed-expenses.ts
  installment-plans.ts
  monthly-closings.ts
  profile.ts
  transactions.ts
