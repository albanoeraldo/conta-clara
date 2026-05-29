# Escopo de Telas — Conta Clara V2

## 1. Visão geral

Este documento define o escopo inicial das telas do **Conta Clara V2**.

O objetivo é deixar claro o que cada tela deve fazer, quais informações deve exibir e quais ações estarão disponíveis na primeira versão profissional do produto.

A regra principal é:

> Simples, limpo, confiável e fácil de usar.

---

# 2. Área pública

## 2.1 Landing Page

### Objetivo

Apresentar o Conta Clara, explicar sua proposta e levar o usuário para o teste grátis.

### Conteúdo principal

* Nome do produto: Conta Clara;
* frase principal;
* explicação curta;
* botão para começar teste grátis;
* botão para falar pelo WhatsApp;
* benefícios principais;
* planos;
* perguntas frequentes;
* chamada final.

### Frase principal

> Um controle financeiro simples para pessoas comuns e casais que querem parar de se perder nas contas.

### Subfrase

> Organize suas contas, cartão, assinaturas e gastos do mês em um painel fácil de entender.

### Botões

* Começar teste grátis;
* Falar pelo WhatsApp.

### Seções

1. Hero principal;
2. Problemas que o produto resolve;
3. Funcionalidades principais;
4. Para quem é;
5. Preços;
6. Perguntas frequentes;
7. Chamada final.

---

## 2.2 Cadastro

### Objetivo

Criar a conta do usuário e iniciar o teste grátis de 30 dias.

### Campos

* Nome completo;
* e-mail;
* senha;
* confirmar senha.

### Botão principal

* Criar minha conta grátis.

### Após o cadastro

O sistema deve:

1. criar o usuário no Supabase Auth;
2. criar o perfil do usuário;
3. criar o espaço financeiro;
4. iniciar assinatura trial de 30 dias;
5. criar categorias padrão;
6. redirecionar para o onboarding.

---

## 2.3 Login

### Objetivo

Permitir que o usuário acesse sua conta.

### Campos

* E-mail;
* senha.

### Ações

* Entrar;
* criar conta grátis;
* recuperar senha.

---

## 2.4 Recuperar senha

### Objetivo

Permitir que o usuário recupere o acesso sem depender do administrador.

### Campos

* E-mail.

### Mensagem após envio

> Enviamos um link para você redefinir sua senha.

---

## 2.5 Acesso expirado

### Objetivo

Informar que o teste grátis ou o plano do usuário terminou.

### Quando aparece

Quando o usuário faz login, mas a assinatura está expirada.

### Conteúdo

* mensagem informando que o acesso expirou;
* plano mensal;
* plano anual;
* botão para falar pelo WhatsApp.

### Texto sugerido

> Seu acesso ao Conta Clara expirou.

### Planos

* Mensal: R$ 14,90;
* anual: R$ 129,00.

### Botão

* Falar com Eraldo no WhatsApp.

---

# 3. Área do cliente

## 3.1 Onboarding inicial

### Objetivo

Configurar o Conta Clara de forma simples logo após o cadastro.

### Campos

* Nome do controle financeiro;
* tipo de uso;
* renda mensal aproximada;
* dia principal de recebimento;
* maior objetivo financeiro no momento.

### Tipos de uso

* Pessoal;
* casal;
* família.

### Exemplos de nome do controle

* Minha Casa;
* Finanças do Casal;
* Controle da Família.

### Botão

* Começar a organizar.

### Observação

O onboarding precisa ser curto e direto. O usuário não deve se sentir cansado logo no primeiro acesso.

---

## 3.2 Dashboard do mês

### Objetivo

Mostrar a situação financeira do mês de forma clara e rápida.

### Perguntas que a tela deve responder

* Quanto entrou este mês?
* Quanto saiu?
* Quanto ainda falta pagar?
* Quanto está no cartão?
* O mês está positivo ou negativo?
* Quais contas vencem em breve?

### Cards principais

* Receitas do mês;
* despesas pagas;
* despesas pendentes;
* cartão do mês;
* saldo previsto;
* meta do mês.

### Bloco especial: Saúde do mês

Este bloco será um diferencial do Conta Clara.

### Exemplos de mensagens

> Seu mês está positivo até agora. Continue acompanhando seus gastos.

> Atenção: suas despesas já estão próximas da sua renda mensal.

> Você ainda tem contas pendentes este mês. Confira antes do vencimento.

### Listas rápidas

* Próximas contas a vencer;
* últimos lançamentos;
* assinaturas do mês;
* fatura atual do cartão.

### Gráficos

* Receitas x despesas;
* gastos por categoria.

### Botão principal

* Novo lançamento.

---

## 3.3 Lançamentos

### Objetivo

Listar receitas e despesas, permitindo filtrar, editar e marcar como pago.

### Filtros

* Mês;
* tipo;
* status;
* categoria.

### Tipos

* Receita;
* despesa.

### Status

* Pago;
* pendente;
* vencido;
* cancelado.

### Informações exibidas

* Descrição;
* categoria;
* data;
* valor;
* status;
* forma de pagamento;
* ações.

### Ações

* Criar lançamento;
* editar;
* excluir;
* marcar como pago;
* marcar como pendente.

---

## 3.4 Novo lançamento

### Objetivo

Cadastrar uma receita ou despesa.

### Campos

* Tipo;
* descrição;
* valor;
* data de vencimento;
* data de pagamento;
* categoria;
* forma de pagamento;
* status;
* observação.

### Tipos

* Receita;
* despesa.

### Formas de pagamento

* Pix;
* dinheiro;
* débito;
* crédito;
* boleto;
* transferência;
* outro.

### Status

* Pendente;
* pago;
* vencido;
* cancelado.

### Botões

* Salvar lançamento;
* cancelar.

---

## 3.5 Categorias

### Objetivo

Permitir que o usuário organize receitas e despesas por categoria.

### Categorias padrão de despesa

* Moradia;
* mercado;
* energia;
* água;
* internet;
* transporte;
* saúde;
* lazer;
* cartão;
* assinaturas;
* outros.

### Categorias padrão de receita

* Salário;
* freelance;
* serviços;
* vendas;
* ajuda familiar;
* outros.

### Ações

* Criar categoria;
* editar categoria;
* inativar categoria.

### Observação

Na V2 inicial, é melhor inativar uma categoria do que excluir, para evitar problemas com lançamentos antigos.

---

## 3.6 Contas fixas e assinaturas

### Objetivo

Controlar gastos que se repetem.

### Exemplos

* Aluguel;
* internet;
* energia;
* água;
* Netflix;
* Spotify;
* academia;
* celular;
* faculdade;
* financiamento.

### Campos

* Nome;
* valor;
* categoria;
* dia de vencimento;
* frequência;
* tipo;
* status.

### Frequências

* Mensal;
* anual.

### Tipos

* Conta fixa;
* assinatura.

### Status

* Ativa;
* inativa.

### Ações

* Criar conta fixa;
* criar assinatura;
* editar;
* inativar;
* gerar lançamento do mês.

---

## 3.7 Cartão de crédito

### Objetivo

Permitir controle simples da fatura do cartão.

### Campos do cartão

* Nome do cartão;
* banco ou instituição;
* limite opcional;
* dia de fechamento;
* dia de vencimento;
* status.

### Informações exibidas

* Fatura atual;
* total da fatura;
* data de vencimento;
* compras do mês;
* status da fatura.

### Status da fatura

* Aberta;
* fechada;
* paga.

### Campos da compra

* Descrição;
* valor;
* data da compra;
* categoria;
* cartão;
* observação.

### Ações

* Adicionar compra;
* editar compra;
* excluir compra;
* marcar fatura como paga.

### O que fica para depois

* Parcelamento avançado;
* juros;
* rotativo;
* limite usado automático complexo.

---

## 3.8 Metas

### Objetivo

Ajudar o usuário a organizar objetivos financeiros.

### Exemplos

* Reserva de emergência;
* viagem;
* quitar dívida;
* comprar notebook;
* reforma da casa;
* guardar dinheiro para o casal.

### Campos

* Nome da meta;
* valor alvo;
* valor atual;
* prazo;
* status.

### Status

* Ativa;
* concluída;
* cancelada.

### Exibição

* Barra de progresso;
* porcentagem concluída;
* quanto falta;
* prazo final.

### Ações

* Criar meta;
* atualizar valor;
* editar;
* concluir;
* cancelar.

---

## 3.9 Relatórios

### Objetivo

Mostrar resumos financeiros de forma simples.

### Relatórios da V2 inicial

* Resumo mensal;
* resumo anual;
* receitas x despesas;
* gastos por categoria;
* evolução do saldo;
* maiores despesas do mês.

### Filtros

* Mês;
* ano;
* categoria.

### Gráficos

* Barras para receitas x despesas;
* pizza ou rosca para categorias;
* linha para evolução mensal.

### Perguntas que os relatórios devem responder

* Gastei mais com o quê?
* Sobrou ou faltou dinheiro?
* Meu ano está melhorando ou piorando?

---

## 3.10 Fechamento mensal

### Objetivo

Permitir que o usuário encerre o mês com segurança.

### Informações exibidas antes de fechar

* Total de receitas;
* total de despesas;
* total do cartão;
* saldo final;
* contas pendentes;
* faturas pendentes.

### Botão principal

* Fechar mês.

### Confirmação

> Você tem certeza que deseja fechar este mês? Depois disso, os lançamentos ficarão protegidos contra alterações acidentais.

### Ações

* Fechar mês;
* reabrir mês;
* ver meses fechados.

---

## 3.11 Configurações

### Objetivo

Permitir ajustes básicos da conta.

### Seção: Perfil

* Nome;
* e-mail;
* telefone;
* foto futuramente.

### Seção: Minha Conta Clara

* Nome do controle;
* tipo de uso.

### Tipos de uso

* Pessoal;
* casal;
* família.

### Seção: Assinatura

* Status;
* data de início do teste;
* data final do teste;
* plano atual;
* botão para falar no WhatsApp.

### Status de assinatura

* Teste grátis;
* ativo;
* expirado;
* bloqueado;
* cancelado.

### Seção: Preferências

* Moeda: Real brasileiro;
* tema claro ou escuro futuramente.

---

# 4. Área administrativa

## 4.1 Admin — Clientes

### Objetivo

Permitir que o administrador controle os clientes, testes grátis e assinaturas manuais.

### Informações exibidas

* Nome do cliente;
* e-mail;
* telefone;
* status;
* plano;
* data de cadastro;
* fim do teste grátis;
* fim do plano atual.

### Status

* Teste grátis;
* ativo;
* expirado;
* bloqueado;
* cancelado.

### Ações

* Ativar mensal;
* ativar anual;
* bloquear;
* desbloquear;
* ver detalhes;
* adicionar observação futuramente.

---

# 5. Menu oficial da V2 inicial

## Menu do cliente

* Dashboard;
* lançamentos;
* contas fixas;
* cartão;
* metas;
* relatórios;
* fechamento;
* configurações.

## Menu administrativo

* Admin.

---

# 6. O que entra na V2 inicial

* Landing page;
* cadastro;
* login;
* recuperar senha;
* onboarding;
* dashboard;
* lançamentos;
* categorias;
* contas fixas;
* assinaturas;
* cartão simples;
* metas;
* relatórios básicos;
* fechamento mensal;
* configurações;
* acesso expirado;
* admin simples;
* teste grátis de 30 dias;
* controle manual de assinatura.

---

# 7. O que fica para depois

* Pagamento automático;
* Pix automático;
* Mercado Pago;
* Stripe;
* Open Finance;
* importação de extrato bancário;
* aplicativo mobile;
* notificações por WhatsApp;
* modo casal com dois logins;
* anexos de comprovantes;
* parcelamento avançado;
* inteligência artificial;
* controle de investimentos.

---
