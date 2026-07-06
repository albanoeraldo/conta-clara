# Status do projeto - Conta Clara

## Versão atual

**v0.3.0 - Versão financeira**

O Conta Clara está em uma fase funcional mais completa, com controle financeiro mensal, lançamentos, categorias, contas fixas, parcelamentos, cartões de crédito e mês de referência global.

## Estado geral

O sistema já permite que o usuário organize receitas, despesas, vencimentos, contas recorrentes, financiamentos, compras parceladas e faturas de cartão de crédito.

A aplicação está validada para uso em ambiente de desenvolvimento, com foco em simplicidade, clareza e controle financeiro para pessoas comuns e casais.

## Funcionalidades concluídas

### Autenticação e onboarding

- Cadastro de usuário
- Login
- Onboarding inicial
- Criação do espaço financeiro do usuário
- Perfil
- Configurações do espaço financeiro

### Categorias

- Cadastro de categorias
- Separação entre receitas e despesas
- Edição de categorias
- Ativação e desativação de categorias
- Ícones automáticos por tipo de categoria

### Lançamentos

- Cadastro de receitas e despesas
- Edição de lançamentos
- Marcar lançamento como pago
- Cancelar lançamento
- Excluir lançamento cadastrado por engano
- Filtros por busca, tipo, categoria, status e mês
- Integração com mês de referência global

### Dashboard

- Resumo de receitas
- Resumo de despesas
- Saldo previsto do mês
- Pendências do mês
- Gráfico de receitas x despesas
- Lançamentos do mês
- Mês de referência global
- Navegação entre meses passados, atuais e futuros

### Contas fixas

- Cadastro de contas fixas
- Edição de contas fixas
- Ativação e desativação
- Exclusão com modal de confirmação
- Geração mensal de lançamentos
- Proteção contra duplicidade
- Integração com categorias, forma de pagamento e mês global

### Parcelamentos e financiamentos

- Cadastro de parcelamentos
- Edição de parcelamentos
- Ativação e desativação
- Exclusão com modal de confirmação
- Cálculo de parcela atual
- Cálculo de parcelas restantes
- Cálculo de data final prevista
- Geração mensal de lançamentos
- Proteção contra duplicidade no mesmo mês
- Integração com mês global

### Cartões de crédito

- Cadastro de cartões
- Edição de cartões
- Ativação e desativação
- Exclusão de cartões
- Cadastro de compras no cartão
- Compras à vista
- Compras parceladas
- Cancelamento e reativação de compras
- Exclusão de compras
- Preview de fatura
- Cálculo por fechamento e vencimento
- Geração de lançamento da fatura
- Proteção contra duplicidade de fatura
- Integração com mês global

## Próximas possibilidades

- Melhorias em relatórios
- Gráficos por categoria
- Comparativo entre meses
- Exportação de dados
- Melhorias mobile
- Melhorias de usabilidade nas telas financeiras
- Notificações de vencimentos
- Automação de recorrências
- Preparação para uma versão SaaS inicial

## Observação

A versão v0.3.0 representa uma etapa importante do produto, pois transforma o Conta Clara em um controle financeiro mensal mais completo e navegável por período.

## Status atual — v0.4.0

A versão `v0.4.0` está focada em relatórios e inteligência financeira simples.

O Conta Clara agora possui uma tela dedicada de relatórios em `/relatorios`, permitindo que o usuário entenda melhor o mês financeiro de forma clara e acessível.

### Funcionalidades disponíveis em relatórios

- Relatório mensal por categoria.
- Total de despesas do mês.
- Quantidade de categorias com gasto.
- Maior categoria de gasto.
- Ranking de categorias por valor gasto.
- Percentual de cada categoria sobre o total de despesas.
- Gráfico simples de barras por categoria.
- Maiores despesas individuais do mês.
- Resumo inteligente do mês.
- Fechamento mensal com resumo salvo.
- Reabertura de mês fechado.
- Comparação com o mês anterior.
- Saldo acumulado entre dois meses.
- Evolução dos últimos 6 meses.

### Fechamento mensal

Foi criada a tabela `monthly_closings` para registrar fechamentos mensais.

O fechamento mensal salva:

- mês de referência;
- total de receitas;
- total de despesas;
- saldo final;
- maior categoria de gasto;
- maior despesa individual;
- data e hora do fechamento.

Nesta versão, o fechamento é apenas informativo e ainda não bloqueia alterações em meses fechados.

### Próximos pontos possíveis

- Bloquear alterações em meses fechados.
- Criar alertas de vencimento.
- Melhorar visão mobile dos relatórios.
- Adicionar exportação futura em CSV ou PDF.
- Criar visão anual simples.
