# Changelog — Conta Clara

Todas as mudanças relevantes do Conta Clara serão documentadas neste arquivo.

## [v0.1.0] — Primeira versão funcional

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
