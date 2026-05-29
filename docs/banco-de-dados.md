# Banco de Dados — Conta Clara V2

## 1. Visão geral

Este documento define a estrutura inicial do banco de dados do **Conta Clara V2**.

O banco será construído com **PostgreSQL** através do **Supabase**, utilizando autenticação, relacionamentos entre tabelas e políticas de segurança com **Row Level Security**.

A estrutura foi pensada para atender a primeira versão profissional do produto, mantendo espaço para crescimento futuro.

A regra principal continua sendo:

> Simples, limpo, confiável e fácil de usar.

---

## 2. Objetivos da modelagem

A modelagem do banco precisa permitir:

- cadastro e login de usuários;
- criação de perfil do usuário;
- teste grátis de 30 dias;
- controle manual de assinatura;
- organização por espaço financeiro;
- controle de receitas;
- controle de despesas;
- categorias;
- contas fixas;
- assinaturas;
- cartão de crédito;
- compras no cartão;
- metas financeiras;
- fechamento mensal;
- painel administrativo simples;
- segurança para que cada usuário acesse apenas seus próprios dados.

---

## 3. Visão geral das tabelas

As tabelas principais da V2 inicial serão:

- `profiles`;
- `financial_spaces`;
- `subscriptions`;
- `categories`;
- `transactions`;
- `recurring_items`;
- `credit_cards`;
- `card_purchases`;
- `goals`;
- `monthly_closings`;
- `admin_notes`.

---

# 4. Tabela `profiles`

## Objetivo

Guardar informações básicas do usuário.

Essa tabela complementa os dados do Supabase Auth.

## Campos

| Campo      | Tipo      | Observação                           |
| ---------- | --------- | ------------------------------------ |
| id         | uuid      | Mesmo ID do usuário no Supabase Auth |
| full_name  | text      | Nome completo do usuário             |
| email      | text      | E-mail do usuário                    |
| phone      | text      | Telefone ou WhatsApp                 |
| avatar_url | text      | Foto do usuário, futuramente         |
| created_at | timestamp | Data de criação                      |
| updated_at | timestamp | Data da última atualização           |

## Exemplo

```txt
id: uuid do usuário
full_name: Maria Aparecida
email: maria@email.com
phone: 44999999999
avatar_url: null
```

## Observação

O campo `id` deve estar relacionado ao usuário autenticado no Supabase.

---

# 5. Tabela `financial_spaces`

## Objetivo

Representar o ambiente financeiro do usuário.

No sistema, isso pode aparecer para o cliente como:

- Minha Conta Clara;
- Minha Casa;
- Finanças do Casal;
- Controle da Família.

## Campos

| Campo      | Tipo      | Observação                  |
| ---------- | --------- | --------------------------- |
| id         | uuid      | ID do espaço financeiro     |
| owner_id   | uuid      | Usuário dono do espaço      |
| name       | text      | Nome do controle financeiro |
| type       | text      | Tipo de uso                 |
| created_at | timestamp | Data de criação             |
| updated_at | timestamp | Data da última atualização  |

## Tipos possíveis

```txt
personal
couple
family
business
```

## Uso na V2 inicial

Na V2 inicial, serão usados principalmente:

```txt
personal
couple
family
```

## Exemplo

```txt
name: Finanças do Casal
type: couple
owner_id: uuid do usuário dono
```

## Decisão técnica

Mesmo que no começo seja usado o modelo:

```txt
1 usuário = 1 espaço financeiro
```

A tabela já deixa o sistema preparado para o futuro:

```txt
1 usuário = vários espaços financeiros
```

ou:

```txt
2 usuários = 1 espaço financeiro
```

Isso permitirá criar modo casal com dois logins no futuro, sem refazer toda a estrutura.

---

# 6. Tabela `subscriptions`

## Objetivo

Controlar o acesso do cliente ao Conta Clara.

Essa tabela será usada para o modelo de:

- teste grátis de 30 dias;
- plano mensal;
- plano anual;
- acesso expirado;
- bloqueio manual;
- ativação manual pelo administrador.

## Campos

| Campo                    | Tipo      | Observação                  |
| ------------------------ | --------- | --------------------------- |
| id                       | uuid      | ID da assinatura            |
| user_id                  | uuid      | Usuário dono da assinatura  |
| financial_space_id       | uuid      | Espaço financeiro vinculado |
| status                   | text      | Status do acesso            |
| plan                     | text      | Plano atual                 |
| trial_starts_at          | timestamp | Início do teste grátis      |
| trial_ends_at            | timestamp | Final do teste grátis       |
| current_period_starts_at | timestamp | Início do período pago      |
| current_period_ends_at   | timestamp | Final do período pago       |
| created_at               | timestamp | Data de criação             |
| updated_at               | timestamp | Data da última atualização  |

## Status possíveis

```txt
trial
active
expired
blocked
cancelled
```

## Planos possíveis

```txt
free_trial
monthly
annual
manual
```

## Exemplo de teste grátis

```txt
status: trial
plan: free_trial
trial_starts_at: 2026-05-28
trial_ends_at: 2026-06-27
```

## Exemplo de plano mensal ativo

```txt
status: active
plan: monthly
current_period_starts_at: 2026-06-28
current_period_ends_at: 2026-07-28
```

## Regra inicial

Na V2 inicial, a cobrança será manual.

Quando o cliente pagar via Pix, o administrador altera o status e o plano manualmente.

---

# 7. Tabela `categories`

## Objetivo

Organizar receitas e despesas por categoria.

## Campos

| Campo              | Tipo      | Observação                       |
| ------------------ | --------- | -------------------------------- |
| id                 | uuid      | ID da categoria                  |
| financial_space_id | uuid      | Espaço financeiro vinculado      |
| name               | text      | Nome da categoria                |
| type               | text      | Tipo da categoria                |
| color              | text      | Cor da categoria, opcional       |
| icon               | text      | Ícone da categoria, opcional     |
| is_default         | boolean   | Indica se é categoria padrão     |
| active             | boolean   | Indica se a categoria está ativa |
| created_at         | timestamp | Data de criação                  |
| updated_at         | timestamp | Data da última atualização       |

## Tipos possíveis

```txt
income
expense
```

## Categorias padrão de receita

- Salário;
- freelance;
- serviços;
- vendas;
- ajuda familiar;
- outros.

## Categorias padrão de despesa

- Moradia;
- mercado;
- energia;
- água;
- internet;
- transporte;
- saúde;
- lazer;
- cartão;
- assinaturas;
- outros.

## Observação

Na V2 inicial, é melhor inativar categorias do que excluir, para não quebrar lançamentos antigos.

---

# 8. Tabela `transactions`

## Objetivo

Guardar os lançamentos financeiros do usuário.

Essa será uma das tabelas centrais do Conta Clara.

Ela armazenará receitas e despesas.

## Campos

| Campo                  | Tipo      | Observação                        |
| ---------------------- | --------- | --------------------------------- |
| id                     | uuid      | ID do lançamento                  |
| financial_space_id     | uuid      | Espaço financeiro vinculado       |
| category_id            | uuid      | Categoria vinculada               |
| type                   | text      | Receita ou despesa                |
| description            | text      | Descrição do lançamento           |
| amount                 | numeric   | Valor                             |
| due_date               | date      | Data de vencimento                |
| paid_date              | date      | Data de pagamento                 |
| status                 | text      | Status do lançamento              |
| payment_method         | text      | Forma de pagamento                |
| notes                  | text      | Observações                       |
| is_recurring_generated | boolean   | Indica se veio de uma recorrência |
| created_at             | timestamp | Data de criação                   |
| updated_at             | timestamp | Data da última atualização        |

## Tipos possíveis

```txt
income
expense
```

## Status possíveis

```txt
pending
paid
overdue
cancelled
```

## Formas de pagamento

```txt
pix
money
debit
credit_card
bank_transfer
boleto
other
```

## Exemplo de receita

```txt
type: income
description: Salário
amount: 2500.00
due_date: 2026-06-05
paid_date: 2026-06-05
status: paid
payment_method: bank_transfer
```

## Exemplo de despesa

```txt
type: expense
description: Conta de energia
amount: 230.00
due_date: 2026-06-10
paid_date: null
status: pending
payment_method: boleto
```

## Observação

O dashboard, os relatórios e o fechamento mensal usarão muitos dados dessa tabela.

---

# 9. Tabela `recurring_items`

## Objetivo

Controlar contas fixas, assinaturas e itens recorrentes.

Exemplos:

- internet;
- energia;
- água;
- aluguel;
- Netflix;
- Spotify;
- academia;
- celular;
- financiamento;
- escola;
- faculdade.

## Campos

| Campo              | Tipo      | Observação                  |
| ------------------ | --------- | --------------------------- |
| id                 | uuid      | ID do item recorrente       |
| financial_space_id | uuid      | Espaço financeiro vinculado |
| category_id        | uuid      | Categoria vinculada         |
| type               | text      | Receita ou despesa          |
| name               | text      | Nome da conta ou assinatura |
| amount             | numeric   | Valor                       |
| frequency          | text      | Frequência                  |
| due_day            | integer   | Dia de vencimento           |
| start_date         | date      | Data de início              |
| end_date           | date      | Data de fim, opcional       |
| active             | boolean   | Indica se está ativo        |
| created_at         | timestamp | Data de criação             |
| updated_at         | timestamp | Data da última atualização  |

## Tipos possíveis

```txt
income
expense
```

## Frequências possíveis

```txt
monthly
yearly
weekly
```

## Uso principal na V2 inicial

Na primeira versão, o foco será:

```txt
monthly
yearly
```

## Exemplo

```txt
name: Netflix
type: expense
amount: 39.90
frequency: monthly
due_day: 15
active: true
```

## Decisão importante

A tabela `recurring_items` não substitui a tabela `transactions`.

Ela funciona como um modelo para gerar lançamentos mensais.

Exemplo:

```txt
Recorrência:
Netflix - R$ 39,90 - todo dia 15

Lançamento gerado:
Netflix - Junho/2026 - pendente
```

---

# 10. Tabela `credit_cards`

## Objetivo

Guardar os cartões de crédito cadastrados pelo usuário.

## Campos

| Campo              | Tipo      | Observação                    |
| ------------------ | --------- | ----------------------------- |
| id                 | uuid      | ID do cartão                  |
| financial_space_id | uuid      | Espaço financeiro vinculado   |
| name               | text      | Nome do cartão                |
| bank_name          | text      | Banco ou instituição          |
| limit_amount       | numeric   | Limite do cartão, opcional    |
| closing_day        | integer   | Dia de fechamento             |
| due_day            | integer   | Dia de vencimento             |
| active             | boolean   | Indica se o cartão está ativo |
| created_at         | timestamp | Data de criação               |
| updated_at         | timestamp | Data da última atualização    |

## Exemplo

```txt
name: Nubank Roxinho
bank_name: Nubank
limit_amount: 3000.00
closing_day: 20
due_day: 27
active: true
```

## Decisão inicial

Na V2 inicial, o cartão será simples.

Não entram no início:

- parcelamento avançado;
- juros;
- rotativo;
- controle complexo de limite;
- múltiplos titulares.

---

# 11. Tabela `card_purchases`

## Objetivo

Guardar compras feitas no cartão de crédito.

## Campos

| Campo              | Tipo      | Observação                  |
| ------------------ | --------- | --------------------------- |
| id                 | uuid      | ID da compra                |
| financial_space_id | uuid      | Espaço financeiro vinculado |
| credit_card_id     | uuid      | Cartão vinculado            |
| category_id        | uuid      | Categoria vinculada         |
| description        | text      | Descrição da compra         |
| amount             | numeric   | Valor                       |
| purchase_date      | date      | Data da compra              |
| invoice_month      | date      | Mês da fatura               |
| status             | text      | Status da compra            |
| notes              | text      | Observações                 |
| created_at         | timestamp | Data de criação             |
| updated_at         | timestamp | Data da última atualização  |

## Status possíveis

```txt
open
closed
paid
cancelled
```

## Exemplo

```txt
description: Mercado
amount: 185.70
purchase_date: 2026-06-12
invoice_month: 2026-06-01
status: open
```

## Observação

Na V2 inicial, as compras ficam registradas em `card_purchases`.

O dashboard poderá somar a fatura atual a partir dessa tabela.

---

# 12. Tabela `goals`

## Objetivo

Guardar metas financeiras do usuário.

As metas ajudam o Conta Clara a ser mais do que uma ferramenta de pagar boletos. Elas tornam o produto mais motivador.

## Campos

| Campo              | Tipo      | Observação                  |
| ------------------ | --------- | --------------------------- |
| id                 | uuid      | ID da meta                  |
| financial_space_id | uuid      | Espaço financeiro vinculado |
| name               | text      | Nome da meta                |
| target_amount      | numeric   | Valor alvo                  |
| current_amount     | numeric   | Valor atual                 |
| deadline           | date      | Prazo final                 |
| status             | text      | Status da meta              |
| created_at         | timestamp | Data de criação             |
| updated_at         | timestamp | Data da última atualização  |

## Status possíveis

```txt
active
completed
cancelled
```

## Exemplos de metas

- Reserva de emergência;
- viagem;
- quitar dívida;
- comprar notebook;
- reforma da casa;
- guardar dinheiro para o casal.

## Exemplo

```txt
name: Reserva de emergência
target_amount: 3000.00
current_amount: 650.00
deadline: 2026-12-31
status: active
```

---

# 13. Tabela `monthly_closings`

## Objetivo

Guardar os fechamentos mensais do usuário.

Essa tabela permite registrar o resumo de um mês fechado.

## Campos

| Campo              | Tipo      | Observação                    |
| ------------------ | --------- | ----------------------------- |
| id                 | uuid      | ID do fechamento              |
| financial_space_id | uuid      | Espaço financeiro vinculado   |
| month              | integer   | Mês fechado                   |
| year               | integer   | Ano fechado                   |
| total_income       | numeric   | Total de receitas             |
| total_expense      | numeric   | Total de despesas             |
| total_card         | numeric   | Total do cartão               |
| final_balance      | numeric   | Saldo final                   |
| closed_at          | timestamp | Data de fechamento            |
| closed_by          | uuid      | Usuário que fechou            |
| reopened_at        | timestamp | Data de reabertura, se houver |
| created_at         | timestamp | Data de criação               |

## Exemplo

```txt
month: 6
year: 2026
total_income: 3500.00
total_expense: 2700.00
total_card: 650.00
final_balance: 150.00
closed_at: 2026-06-30
```

## Observação

O fechamento mensal ajuda o usuário a sentir que o mês foi organizado e encerrado.

---

# 14. Tabela `admin_notes`

## Objetivo

Permitir que o administrador registre observações sobre clientes.

Essa tabela será útil no modelo de venda manual.

## Campos

| Campo      | Tipo      | Observação                           |
| ---------- | --------- | ------------------------------------ |
| id         | uuid      | ID da observação                     |
| user_id    | uuid      | Usuário relacionado                  |
| admin_id   | uuid      | Administrador que criou a observação |
| note       | text      | Texto da observação                  |
| created_at | timestamp | Data de criação                      |

## Exemplo

```txt
Cliente veio da formatação do notebook Dell.
Pagou mensal via Pix.
Quer ajuda para cadastrar contas fixas.
```

## Observação

Essa tabela é útil, mas pode ser implementada depois das funções principais.

---

# 15. Relação entre telas e tabelas

| Tela                       | Tabelas principais                                             |
| -------------------------- | -------------------------------------------------------------- |
| Cadastro/Login             | `auth.users`, `profiles`, `subscriptions`                      |
| Onboarding                 | `profiles`, `financial_spaces`                                 |
| Dashboard                  | `transactions`, `card_purchases`, `goals`, `recurring_items`   |
| Lançamentos                | `transactions`, `categories`                                   |
| Categorias                 | `categories`                                                   |
| Contas fixas e assinaturas | `recurring_items`, `categories`                                |
| Cartão de crédito          | `credit_cards`, `card_purchases`, `categories`                 |
| Metas                      | `goals`                                                        |
| Relatórios                 | `transactions`, `card_purchases`, `monthly_closings`           |
| Fechamento mensal          | `monthly_closings`, `transactions`, `card_purchases`           |
| Configurações              | `profiles`, `financial_spaces`, `subscriptions`                |
| Acesso expirado            | `subscriptions`                                                |
| Admin                      | `profiles`, `subscriptions`, `financial_spaces`, `admin_notes` |

---

# 16. Regras de segurança

Como o Conta Clara usará Supabase, o banco deverá ter políticas de segurança com Row Level Security.

A regra principal será:

> Cada usuário só pode acessar dados vinculados ao seu próprio espaço financeiro.

Exemplo:

- Maria não pode ver os lançamentos do João;
- João não pode editar as metas da Maria;
- um usuário expirado não deve acessar as telas internas normalmente;
- apenas o administrador pode acessar a área administrativa.

---

# 17. Regra de acesso inicial

Na V2 inicial:

```txt
1 usuário = 1 financial_space
```

Mas a estrutura será preparada para permitir no futuro:

```txt
1 usuário = vários financial_spaces
```

ou:

```txt
2 usuários = 1 financial_space
```

Essa decisão prepara o sistema para o modo casal completo futuramente.

---

# 18. Fluxo inicial de criação de conta

Quando o usuário se cadastra, o sistema deve:

1. criar o usuário no Supabase Auth;
2. criar registro em `profiles`;
3. criar registro em `financial_spaces`;
4. criar registro em `subscriptions`;
5. criar categorias padrão em `categories`;
6. liberar acesso por 30 dias;
7. redirecionar para o onboarding ou dashboard.

---

# 19. Estrutura inicial obrigatória

As tabelas obrigatórias para a V2 inicial são:

- `profiles`;
- `financial_spaces`;
- `subscriptions`;
- `categories`;
- `transactions`;
- `recurring_items`;
- `credit_cards`;
- `card_purchases`;
- `goals`;
- `monthly_closings`.

A tabela `admin_notes` pode entrar na primeira versão administrativa ou ser adicionada logo depois.

---

# 20. Decisão oficial

O banco do Conta Clara será estruturado para atender uma aplicação simples para o usuário final, mas com base profissional para crescimento futuro.

A prioridade será segurança, clareza e organização dos dados.

---
