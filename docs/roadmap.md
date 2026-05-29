# Roadmap — Conta Clara V2

## 1. Visão geral

Este documento define o roadmap inicial de desenvolvimento do **Conta Clara V2**.

O objetivo é organizar a construção do projeto em fases claras, evitando tentar desenvolver tudo ao mesmo tempo.

A regra principal do projeto é:

> Simples, limpo, confiável e fácil de usar.

O foco da V2 inicial será criar um produto real, funcional e vendável, sem transformar a primeira versão em um sistema complexo demais.

---

# 2. Objetivos do roadmap

O roadmap existe para:

- organizar o desenvolvimento;
- evitar refatoração infinita;
- definir prioridades;
- separar o que entra agora do que fica para depois;
- facilitar a criação de issues no GitHub;
- acompanhar a evolução do projeto;
- manter o foco na entrega da primeira versão profissional.

---

# 3. Fase 0 — Planejamento e organização inicial

## Objetivo

Criar a base documental e estratégica do projeto.

## Entregas

- Definir nome do produto;
- definir frase principal;
- definir público-alvo;
- definir modelo comercial;
- definir escopo inicial;
- criar repositório no GitHub;
- criar pasta `docs`;
- criar documentação inicial;
- organizar README inicial.

## Arquivos criados

- `README.md`;
- `docs/planejamento-v2.md`;
- `docs/escopo-telas.md`;
- `docs/banco-de-dados.md`;
- `docs/roadmap.md`.

## Status

Em andamento.

---

# 4. Fase 1 — Setup técnico do projeto

## Objetivo

Criar a base técnica do Conta Clara com Next.js e ferramentas principais.

## Entregas

- Criar projeto Next.js;
- configurar TypeScript;
- configurar Tailwind CSS;
- configurar ESLint;
- configurar Prettier;
- organizar estrutura inicial de pastas;
- criar arquivo `.env.example`;
- atualizar README com instruções de instalação.

## Stack desta fase

- Next.js;
- TypeScript;
- Tailwind CSS;
- ESLint;
- Prettier.

## Resultado esperado

Projeto rodando localmente com tela inicial básica.

---

# 5. Fase 2 — Supabase e autenticação

## Objetivo

Implementar cadastro, login, logout e recuperação de senha.

## Entregas

- Criar projeto no Supabase;
- configurar variáveis de ambiente;
- instalar cliente Supabase no projeto;
- criar tela de cadastro;
- criar tela de login;
- criar recuperação de senha;
- criar logout;
- proteger rotas internas;
- criar tabela `profiles`;
- criar perfil automaticamente após cadastro.

## Resultado esperado

Usuário consegue criar conta, entrar, sair e recuperar senha.

---

# 6. Fase 3 — Estrutura de acesso e teste grátis

## Objetivo

Implementar a lógica de 30 dias grátis e controle manual de assinatura.

## Entregas

- Criar tabela `financial_spaces`;
- criar tabela `subscriptions`;
- criar espaço financeiro ao cadastrar usuário;
- iniciar teste grátis de 30 dias;
- criar validação de acesso;
- bloquear telas internas quando o acesso estiver expirado;
- criar tela de acesso expirado;
- preparar campos para plano mensal e anual.

## Resultado esperado

Usuário novo recebe 30 dias grátis e, ao expirar, vê tela para renovação manual.

---

# 7. Fase 4 — Layout principal e onboarding

## Objetivo

Criar a estrutura visual inicial da área interna.

## Entregas

- Criar layout interno;
- criar sidebar ou menu principal;
- criar estrutura responsiva básica;
- criar tela de onboarding;
- salvar nome do controle financeiro;
- salvar tipo de uso;
- salvar renda mensal aproximada;
- criar página de configurações inicial.

## Resultado esperado

Usuário entra no sistema, configura sua Conta Clara e acessa uma área interna organizada.

---

# 8. Fase 5 — Categorias e lançamentos

## Objetivo

Criar o coração financeiro do sistema.

## Entregas

- Criar tabela `categories`;
- criar categorias padrão;
- criar tabela `transactions`;
- criar tela de categorias;
- criar tela de lançamentos;
- criar formulário de novo lançamento;
- validar formulário com React Hook Form e Zod;
- permitir criar receita;
- permitir criar despesa;
- permitir editar lançamento;
- permitir excluir ou cancelar lançamento;
- permitir marcar como pago;
- permitir marcar como pendente;
- filtrar por mês, tipo, status e categoria.

## Resultado esperado

Usuário consegue registrar e organizar receitas e despesas reais.

---

# 9. Fase 6 — Dashboard do mês

## Objetivo

Criar a tela principal do produto.

## Entregas

- Criar cards principais;
- calcular receitas do mês;
- calcular despesas pagas;
- calcular despesas pendentes;
- calcular saldo previsto;
- listar próximas contas;
- listar últimos lançamentos;
- criar bloco “Saúde do mês”;
- criar gráfico de receitas x despesas;
- criar gráfico de gastos por categoria.

## Resultado esperado

Usuário entende rapidamente como está o mês.

---

# 10. Fase 7 — Contas fixas e assinaturas

## Objetivo

Permitir controle de gastos recorrentes.

## Entregas

- Criar tabela `recurring_items`;
- criar tela de contas fixas e assinaturas;
- criar formulário de recorrência;
- permitir tipo conta fixa;
- permitir tipo assinatura;
- permitir frequência mensal;
- permitir frequência anual;
- permitir ativar e inativar recorrência;
- permitir gerar lançamento do mês a partir da recorrência.

## Resultado esperado

Usuário consegue cadastrar contas e assinaturas que se repetem.

---

# 11. Fase 8 — Cartão de crédito simples

## Objetivo

Permitir controle básico de cartão de crédito.

## Entregas

- Criar tabela `credit_cards`;
- criar tabela `card_purchases`;
- criar tela de cartões;
- cadastrar cartão;
- editar cartão;
- inativar cartão;
- cadastrar compra;
- editar compra;
- excluir ou cancelar compra;
- calcular fatura atual;
- marcar fatura como paga.

## Resultado esperado

Usuário consegue acompanhar os gastos principais do cartão.

## O que não entra nesta fase

- parcelamento avançado;
- juros;
- rotativo;
- limite usado automático complexo.

---

# 12. Fase 9 — Metas financeiras

## Objetivo

Criar uma área simples para objetivos financeiros.

## Entregas

- Criar tabela `goals`;
- criar tela de metas;
- criar meta;
- editar meta;
- atualizar valor atual;
- concluir meta;
- cancelar meta;
- exibir progresso em barra;
- mostrar quanto falta para alcançar a meta.

## Resultado esperado

Usuário consegue acompanhar objetivos financeiros simples.

---

# 13. Fase 10 — Relatórios

## Objetivo

Mostrar resumos financeiros de forma simples e visual.

## Entregas

- Criar tela de relatórios;
- criar resumo mensal;
- criar resumo anual;
- gráfico de receitas x despesas;
- gráfico de gastos por categoria;
- evolução de saldo;
- maiores despesas do mês;
- filtros por mês, ano e categoria.

## Resultado esperado

Usuário consegue entender padrões básicos dos seus gastos.

---

# 14. Fase 11 — Fechamento mensal

## Objetivo

Permitir que o usuário encerre o mês com segurança.

## Entregas

- Criar tabela `monthly_closings`;
- criar tela de fechamento mensal;
- calcular totais do mês;
- mostrar contas pendentes;
- mostrar faturas pendentes;
- permitir fechar mês;
- proteger lançamentos de mês fechado contra alterações acidentais;
- permitir reabrir mês com confirmação;
- listar meses fechados.

## Resultado esperado

Usuário consegue finalizar o mês e manter histórico organizado.

---

# 15. Fase 12 — Painel administrativo

## Objetivo

Permitir controle manual dos clientes e assinaturas.

## Entregas

- Criar rota administrativa protegida;
- listar usuários;
- listar assinaturas;
- mostrar status de cada cliente;
- mostrar fim do teste grátis;
- mostrar fim do plano atual;
- ativar plano mensal;
- ativar plano anual;
- bloquear acesso;
- desbloquear acesso;
- adicionar observações futuramente.

## Resultado esperado

Administrador consegue gerenciar clientes sem mexer diretamente no banco.

---

# 16. Fase 13 — Landing page e experiência comercial

## Objetivo

Criar a página pública do produto.

## Entregas

- Criar landing page;
- mostrar proposta do produto;
- mostrar público-alvo;
- mostrar funcionalidades;
- mostrar preços;
- criar chamada para teste grátis;
- criar chamada para WhatsApp;
- criar perguntas frequentes;
- ajustar texto comercial.

## Resultado esperado

Conta Clara terá uma página simples para apresentar e vender o produto.

---

# 17. Fase 14 — Deploy e publicação

## Objetivo

Publicar o projeto de forma profissional.

## Entregas

- Criar projeto na Vercel;
- configurar variáveis de ambiente;
- conectar GitHub com Vercel;
- testar build;
- testar deploy;
- revisar autenticação em produção;
- revisar Supabase em produção;
- testar fluxo completo de cadastro;
- testar acesso expirado;
- atualizar README com link do projeto.

## Resultado esperado

Conta Clara publicado e acessível online.

---

# 18. Fase 15 — Validação com usuários reais

## Objetivo

Validar o produto com pessoas reais.

## Entregas

- Selecionar primeiros usuários de teste;
- liberar acesso grátis de 30 dias;
- acompanhar dúvidas;
- coletar feedback;
- observar quais telas são usadas;
- identificar dificuldades;
- ajustar textos e fluxos;
- validar interesse em pagar;
- ativar primeiros clientes manualmente.

## Resultado esperado

Primeiros usuários reais testando o produto e gerando feedback.

---

# 19. Funcionalidades fora do escopo inicial

Não entram na V2 inicial:

- pagamento automático;
- Pix automático;
- Mercado Pago;
- Stripe;
- Open Finance;
- importação de extrato bancário;
- aplicativo mobile;
- notificações por WhatsApp;
- modo casal com dois logins;
- anexos de comprovantes;
- parcelamento avançado;
- inteligência artificial;
- controle de investimentos;
- relatórios em PDF;
- multiusuário completo;
- planos com limites diferentes.

Essas funcionalidades podem ser avaliadas depois da validação inicial.

---

# 20. Ordem recomendada de desenvolvimento

A ordem recomendada será:

1. Planejamento e documentação;
2. setup técnico;
3. Supabase e autenticação;
4. acesso trial e assinatura;
5. layout interno;
6. categorias e lançamentos;
7. dashboard;
8. contas fixas e assinaturas;
9. cartão;
10. metas;
11. relatórios;
12. fechamento mensal;
13. admin;
14. landing page;
15. deploy;
16. validação real.

---

# 21. Primeiro marco importante

O primeiro grande marco do projeto será:

> Usuário cria conta, recebe 30 dias grátis, entra no sistema e cadastra receitas e despesas.

Esse marco prova que a base principal funciona.

---

# 22. Segundo marco importante

O segundo grande marco será:

> Usuário consegue visualizar o dashboard do mês com receitas, despesas, saldo previsto e saúde do mês.

Esse marco prova que o produto já entrega clareza.

---

# 23. Terceiro marco importante

O terceiro grande marco será:

> Conta Clara publicado na Vercel e pronto para primeiros testes reais.

Esse marco transforma o projeto em produto validável.

---

# 24. Decisão oficial

O Conta Clara será desenvolvido por fases, priorizando uma primeira versão simples, funcional e vendável.

A meta não é criar tudo de uma vez.

A meta é construir uma base sólida, validar com usuários reais e evoluir com segurança.

---
