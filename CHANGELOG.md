# Changelog

## v0.3.0 - Versão financeira

Esta versão consolida a primeira fase financeira mais completa do Conta Clara, adicionando controle por mês, contas fixas, parcelamentos, cartões de crédito e melhorias importantes nos lançamentos.

### Adicionado

- Controle de contas fixas
- Cadastro, edição, ativação, desativação e exclusão de contas fixas
- Geração mensal de lançamentos a partir das contas fixas
- Proteção contra duplicar contas fixas iguais
- Proteção contra gerar a mesma conta fixa duas vezes no mesmo mês
- Controle de parcelamentos e financiamentos
- Cadastro, edição, ativação, desativação e exclusão de parcelamentos
- Cálculo automático de parcela atual
- Cálculo de parcelas restantes
- Cálculo da data final prevista
- Geração mensal de lançamentos a partir de parcelamentos
- Proteção contra duplicar parcelas no mesmo mês
- Controle de cartões de crédito
- Cadastro, edição, ativação, desativação e exclusão de cartões
- Cadastro, edição, cancelamento, reativação e exclusão de compras no cartão
- Suporte para compras à vista e parceladas no cartão
- Cálculo de fatura com base no dia de fechamento e vencimento
- Preview da fatura antes da geração do lançamento
- Geração de lançamento da fatura em lançamentos
- Proteção contra duplicar fatura no mesmo mês
- Mês de referência global entre telas
- Seletor de mês no dashboard
- Filtro de mês integrado em lançamentos
- Integração do mês global com contas fixas, parcelamentos e cartões
- Exclusão de lançamentos com modal de confirmação
- Máscara de dinheiro nos campos financeiros

### Alterado

- Dashboard passou a respeitar o mês selecionado
- Cards financeiros do dashboard agora mostram dados do mês de referência
- “Últimos lançamentos” foi ajustado para lançamentos do mês selecionado
- “Próximas contas” foi ajustado para pendências do mês selecionado
- Tela de lançamentos passou a usar o mês global
- Contas fixas passaram a gerar lançamentos no mês selecionado
- Parcelamentos passaram a gerar parcelas no mês selecionado
- Cartões passaram a visualizar e gerar faturas no mês selecionado
- Textos e mensagens foram ajustados para explicar melhor os fluxos financeiros

### Corrigido

- Corrigida permissão de exclusão de lançamentos no Supabase
- Corrigidas permissões de contas fixas no Supabase
- Corrigida duplicidade de contas fixas
- Corrigida mensagem técnica ao tentar cadastrar conta fixa duplicada
- Corrigido erro de hidratação causado por tag `<p>` dentro de outra tag `<p>`
- Ajustado cálculo de centavos em compras parceladas no cartão, jogando diferença para a última parcela

### Validação

- Login validado
- Dashboard validado
- Lançamentos validados
- Novo lançamento validado
- Editar lançamento validado
- Excluir lançamento validado
- Contas fixas validadas
- Parcelamentos validados
- Cartões de crédito validados
- Geração de faturas validada
- Mês de referência global validado
- `npm run format` executado com sucesso
- `npm run build` executado com sucesso

## v0.2.0 - Versão visual

### Adicionado

- Nova direção visual clara para o Conta Clara
- Sidebar lateral azul-marinho
- Ícones automáticos em categorias, lançamentos e dashboard
- Estados vazios com variações visuais e textos mais humanos
- Microinterações leves em botões, cards, listas e menu
- Documento de release em `docs/releases/v0.2.0.md`

### Alterado

- Página pública inicial repaginada
- Telas de login e cadastro repaginadas
- Onboarding movido para fluxo visual próprio
- Dashboard principal repaginado
- Tela de lançamentos revisada
- Tela de novo lançamento revisada
- Tela de editar lançamento revisada
- Tela de categorias revisada
- Tela de perfil revisada
- Tela de configurações revisada
- Componentes base ajustados para a nova identidade clara
- Inputs, selects, textareas, botões e cards padronizados

### Corrigido

- Blocos escuros remanescentes removidos das telas principais
- Layout do onboarding corrigido para não herdar o layout interno
- Inconsistências visuais entre telas internas corrigidas
- Cursor pointer aplicado globalmente em elementos clicáveis

# Changelog — Conta Clara

Todas as mudanças relevantes do Conta Clara serão documentadas neste arquivo.

## v0.1.0 — Primeira versão funcional

Primeira versão funcional do Conta Clara.

Esta versão marca o primeiro grande ciclo do projeto, com autenticação, onboarding, dashboard, lançamentos, categorias, perfil, configurações, gráfico, identidade visual inicial e documentação.

### Implementado

#### Autenticação e acesso

- Cadastro de usuário
- Login
- Logout
- Proteção de rotas internas
- Redirecionamento conforme sessão
- Bloqueio de acesso a login/cadastro para usuários autenticados

#### Onboarding

- Tela inicial de configuração
- Criação/configuração do espaço financeiro
- Tipo de uso
- Renda mensal aproximada
- Redirecionamento para dashboard
- Criação automática de categorias padrão

#### Dashboard

- Resumo mensal
- Total de receitas
- Total de despesas
- Saldo previsto
- Contas pendentes
- Últimos lançamentos
- Próximas contas
- Gráfico de receitas x despesas

#### Lançamentos

- Cadastro de receitas e despesas
- Seleção de categoria
- Listagem de lançamentos
- Filtro por tipo
- Filtro por status
- Filtro por mês
- Edição de lançamento
- Marcar lançamento como pago
- Cancelar lançamento mantendo histórico

#### Categorias

- Categorias padrão
- Categorias personalizadas
- Listagem por receitas e despesas
- Edição de nome
- Ativação e desativação

#### Perfil

- Tela de perfil
- Nome completo editável
- Telefone editável
- E-mail somente leitura

#### Configurações

- Tela de configurações
- Edição do nome do espaço financeiro
- Edição do tipo de uso
- Edição da renda mensal aproximada

#### Interface

- Layout interno repaginado
- Componentes reutilizáveis
- Logo provisória
- Cards padronizados
- Botões padronizados
- Seções padronizadas

#### Documentação

- README atualizado
- Status do projeto documentado
- Roadmap documentado

### Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- React Hook Form
- Zod
- Recharts

### Observação

Esta versão ainda não representa um produto final, mas sim a primeira versão funcional validada para evolução, portfólio e futuros testes com usuários reais.
