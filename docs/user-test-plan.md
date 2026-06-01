# Plano de Teste com Usuário — Conta Clara

Este documento registra o primeiro plano de teste prático do Conta Clara.

## Objetivo

Validar se o Conta Clara funciona bem em um uso real ou próximo do real, observando clareza, facilidade de uso, dúvidas, dificuldades e oportunidades de melhoria.

## Tipo de teste

Primeiro teste interno com o próprio criador do projeto.

Este teste será usado para simular o comportamento de um usuário real, cadastrando receitas, despesas, categorias e analisando o dashboard.

## Perfil do usuário de teste

Usuário: teste interno

Perfil:

- pessoa comum organizando contas do mês;
- deseja entender receitas, despesas e contas pendentes;
- quer uma ferramenta mais simples do que uma planilha;
- pretende validar se o Conta Clara ajuda no controle financeiro do dia a dia.

## Cuidados com dados

Para este teste, não é obrigatório usar dados financeiros exatos.

Recomendações:

- usar valores aproximados;
- evitar dados sensíveis;
- não registrar informações bancárias reais;
- não inserir senhas, documentos ou dados privados;
- cadastrar somente informações necessárias para validar o fluxo.

## Roteiro de teste

### 1. Acesso inicial

Validar:

- acessar a URL online do Conta Clara;
- abrir a página pública;
- clicar em criar conta;
- criar uma conta de teste;
- fazer login;
- fazer logout;
- entrar novamente.

Observações:

- A página inicial ficou clara?
- Os botões de login e cadastro estão fáceis de encontrar?
- O acesso funcionou sem confusão?

### 2. Onboarding

Validar:

- preencher nome do espaço financeiro;
- escolher tipo de uso;
- informar renda mensal aproximada;
- concluir onboarding;
- confirmar redirecionamento para o dashboard.

Observações:

- O texto do onboarding está claro?
- O usuário entende o que é o espaço financeiro?
- O fluxo parece simples?

### 3. Cadastro de receitas

Cadastrar pelo menos uma receita.

Exemplos:

- Salário
- Freelance
- Comissão
- Renda extra

Validar:

- descrição;
- valor;
- tipo receita;
- categoria;
- data;
- status;
- forma de pagamento;
- observações.

Observações:

- Foi fácil cadastrar?
- Algum campo ficou confuso?
- A categoria apareceu corretamente?

### 4. Cadastro de despesas

Cadastrar algumas despesas do mês.

Exemplos:

- Mercado
- Internet
- Energia
- Aluguel
- Transporte
- Assinaturas
- Cartão
- Lazer

Validar:

- descrição;
- valor;
- tipo despesa;
- categoria;
- data de vencimento;
- status pendente ou pago;
- forma de pagamento.

Observações:

- O formulário está claro?
- O usuário entende status pendente e pago?
- A data de vencimento faz sentido?

### 5. Dashboard

Depois de cadastrar receitas e despesas, validar:

- receitas do mês;
- despesas do mês;
- saldo previsto;
- contas pendentes;
- últimos lançamentos;
- próximas contas;
- gráfico de receitas x despesas.

Observações:

- O dashboard ajuda a entender o mês?
- Os valores parecem corretos?
- O gráfico faz sentido?
- As próximas contas aparecem corretamente?

### 6. Lançamentos

Validar na tela de lançamentos:

- listagem geral;
- busca por descrição;
- filtro por tipo;
- filtro por categoria;
- filtro por status;
- filtro por mês;
- edição de lançamento;
- marcar como pago;
- cancelar lançamento.

Observações:

- A busca ajuda?
- Os filtros são úteis?
- Os ícones são intuitivos?
- O usuário entende o que cada ação faz?

### 7. Categorias

Validar:

- visualizar categorias;
- criar categoria personalizada;
- editar nome de categoria;
- desativar categoria;
- reativar categoria.

Observações:

- A separação entre receitas e despesas está clara?
- Desativar categoria faz sentido?
- Os ícones ficaram compreensíveis?

### 8. Perfil

Validar:

- abrir tela de perfil;
- editar nome;
- editar telefone;
- verificar e-mail somente leitura;
- salvar alterações.

Observações:

- A tela está clara?
- O usuário entende que o e-mail não pode ser editado nesta fase?

### 9. Configurações

Validar:

- abrir configurações;
- alterar nome do espaço financeiro;
- alterar tipo de uso;
- alterar renda mensal aproximada;
- salvar alterações.

Observações:

- O usuário entende para que servem essas configurações?
- A renda mensal aproximada está clara?

### 10. Mobile

Validar em tela pequena:

- menu mobile;
- dashboard;
- lançamentos;
- novo lançamento;
- categorias;
- perfil;
- configurações.

Observações:

- Os botões estão fáceis de tocar?
- O menu mobile está claro?
- Alguma tela ficou apertada?

## Pontos para observar

Durante o teste, registrar:

- dúvidas;
- campos confusos;
- textos pouco claros;
- botões difíceis de entender;
- problemas visuais;
- erros;
- lentidão;
- melhorias desejadas;
- funcionalidades que fizeram falta.

## Perguntas finais

Após o teste, responder:

1. O Conta Clara ajudou a entender melhor o mês financeiro?
2. O dashboard ficou claro?
3. O cadastro de lançamentos foi fácil?
4. Os filtros de lançamentos ajudaram?
5. As categorias fizeram sentido?
6. Algo ficou confuso?
7. O que poderia ser melhorado primeiro?
8. Você usaria essa ferramenta novamente?
9. Você recomendaria para alguém?
10. O que falta para parecer mais pronto para usuário real?

## Resultado do teste

Preencher após a execução.

### O que funcionou bem

-

### O que ficou confuso

-

### Problemas encontrados

-

### Melhorias sugeridas

-

### Próximas ações

-

## Conclusão

Este primeiro teste servirá para transformar o uso real do Conta Clara em melhorias práticas para as próximas versões.
