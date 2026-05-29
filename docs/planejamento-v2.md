# Planejamento V2 — Conta Clara

## 1. Visão geral do projeto

O **Conta Clara** é a V2 profissional do antigo projeto **Painel Financeiro**, que nasceu como um MVP de controle financeiro pessoal desenvolvido com HTML, CSS, JavaScript, Supabase e LocalStorage.

A V2 será reconstruída com uma stack mais moderna e profissional, com foco em aprendizado, portfólio, produto real e possibilidade futura de se tornar um SaaS simples.

O objetivo principal do Conta Clara é ajudar pessoas comuns e casais a organizarem melhor suas contas, cartão, assinaturas, gastos do mês e metas financeiras em um painel simples, limpo e fácil de usar.

---

## 2. Nome do produto

**Conta Clara**

O nome foi escolhido por transmitir simplicidade, organização e clareza financeira.

A ideia central do nome é mostrar que o produto ajuda o usuário a enxergar melhor sua vida financeira, sem depender de planilhas complicadas ou aplicativos difíceis de entender.

---

## 3. Frase principal

> Um controle financeiro simples para pessoas comuns e casais que querem parar de se perder nas contas.

---

## 4. Promessa do produto

O Conta Clara promete entregar uma experiência simples para o usuário entender:

* quanto entrou no mês;
* quanto saiu;
* quanto ainda falta pagar;
* quanto está no cartão;
* quais assinaturas estão ativas;
* quais contas vencem em breve;
* se o mês está positivo ou negativo;
* como estão suas metas financeiras.

A proposta não é criar um sistema financeiro complexo, mas sim uma ferramenta clara, prática e confiável para o dia a dia.

---

## 5. Princípios do produto

Toda decisão de produto, interface e desenvolvimento deve seguir estes princípios:

> Simples, limpo, confiável e fácil de usar.

Antes de adicionar qualquer nova funcionalidade, deve-se responder:

> Isso deixa a vida do cliente mais clara ou apenas deixa o sistema mais complicado?

Se a funcionalidade complicar sem necessidade, ela deve ficar para uma versão futura.

---

## 6. Público-alvo inicial

O público inicial do Conta Clara será formado por:

* pessoas comuns que querem organizar as contas do mês;
* casais que desejam acompanhar melhor os gastos;
* famílias pequenas;
* clientes que já fazem serviços com Eraldo Albano;
* pessoas que não gostam de planilhas;
* pessoas que se perdem com cartão de crédito;
* pessoas que esquecem contas fixas e assinaturas;
* pessoas que querem começar a guardar dinheiro, mas não sabem para onde o dinheiro está indo.

O foco inicial não será em empresas, grandes negócios ou sistemas financeiros complexos.

---

## 7. Estratégia comercial inicial

A estratégia inicial será oferecer o Conta Clara para clientes que já fazem algum serviço com Eraldo Albano, como:

* formatação de computador;
* manutenção;
* suporte técnico;
* instalação de programas;
* organização de computador;
* serviços relacionados à assistência técnica.

A abordagem comercial inicial será:

> Além de arrumar seu computador, tenho uma ferramenta simples para você organizar suas contas, cartão, assinaturas e gastos do mês.

Essa estratégia aproveita a confiança já criada no atendimento técnico e transforma o Conta Clara em uma oferta complementar.

---

## 8. Modelo de acesso e preço

O modelo inicial será simples e validado manualmente.

### Teste grátis

O usuário terá acesso gratuito por **30 dias**.

### Plano mensal

Valor sugerido:

**R$ 14,90 por mês**

### Plano anual

Valor sugerido:

**R$ 129,00 por ano**

O plano anual funcionará como uma opção com desconto para clientes que desejarem manter o acesso por mais tempo.

---

## 9. Cobrança inicial

Na primeira versão, a cobrança será feita manualmente.

Não será implementado pagamento automático no início.

O fluxo inicial será:

1. O cliente cria a conta.
2. O sistema libera 30 dias grátis.
3. Ao final do teste, o acesso expira.
4. O cliente entra em contato pelo WhatsApp.
5. O pagamento é feito manualmente, inicialmente via Pix.
6. O administrador ativa manualmente o plano mensal ou anual.

Pagamento automático, integração com Pix, Mercado Pago ou Stripe ficarão para versões futuras.

---

## 10. Objetivo da V2

A V2 do Conta Clara tem quatro objetivos principais:

### 1. Aprendizado técnico

Evoluir o projeto usando tecnologias mais modernas, boas práticas de organização, autenticação, banco relacional, validação de formulários, segurança e deploy profissional.

### 2. Portfólio

Criar um projeto forte para demonstrar evolução profissional na área de desenvolvimento web.

### 3. Produto real

Construir uma aplicação que possa ser usada por clientes reais, começando de forma simples e validando a aceitação do produto.

### 4. Possível SaaS futuro

Preparar a base do sistema para, futuramente, evoluir para um modelo SaaS com cobrança automática, planos, melhorias e novas funcionalidades.

---

## 11. Stack planejada

A stack proposta para a V2 será:

* Next.js;
* TypeScript;
* Tailwind CSS;
* Supabase;
* PostgreSQL;
* Row Level Security;
* React Hook Form;
* Zod;
* Recharts;
* Vercel.

Essa stack foi escolhida por permitir uma aplicação moderna, escalável, organizada e adequada para portfólio e produto real.

---

## 12. Funcionalidades principais da V2 inicial

A primeira versão profissional do Conta Clara terá foco no essencial.

### Área pública

* Landing page;
* cadastro;
* login;
* recuperação de senha;
* tela de acesso expirado.

### Área do cliente

* onboarding inicial;
* dashboard mensal;
* lançamentos de receitas e despesas;
* categorias;
* contas fixas;
* assinaturas;
* cartão de crédito simples;
* metas;
* relatórios básicos;
* fechamento mensal;
* configurações.

### Área administrativa

* listagem de clientes;
* visualização do status de acesso;
* ativação manual de plano mensal;
* ativação manual de plano anual;
* bloqueio e desbloqueio de acesso.

---

## 13. O que entra na V2 inicial

Entram na V2 inicial:

* autenticação com Supabase;
* cadastro de usuário;
* teste grátis de 30 dias;
* controle manual de assinatura;
* dashboard do mês;
* receitas;
* despesas;
* categorias;
* contas fixas;
* assinaturas;
* cartão de crédito simples;
* metas simples;
* relatórios básicos;
* fechamento mensal;
* painel administrativo simples;
* deploy na Vercel;
* documentação no GitHub.

---

## 14. O que fica para depois

Ficam para versões futuras:

* pagamento automático;
* integração com Pix automático;
* Mercado Pago;
* Stripe;
* Open Finance;
* importação de extrato bancário;
* aplicativo mobile;
* notificações por WhatsApp;
* modo casal com dois logins;
* anexos de comprovantes;
* parcelamento avançado no cartão;
* inteligência artificial;
* controle de investimentos;
* controle avançado de dívidas;
* emissão de relatórios em PDF;
* multiusuário completo;
* planos com diferentes limites.

Essas funcionalidades podem ser importantes no futuro, mas não devem travar a construção da primeira versão profissional.

---

## 15. Diferencial do Conta Clara

O diferencial do Conta Clara não será ter centenas de funcionalidades.

O diferencial será entregar clareza.

O produto deve fazer o usuário sentir que finalmente consegue entender suas contas sem precisar dominar planilhas, termos financeiros ou sistemas complexos.

A experiência precisa ser guiada, direta e amigável.

O usuário deve abrir o painel e entender rapidamente:

* como está o mês;
* o que falta pagar;
* quanto já gastou;
* quanto tem no cartão;
* se está no caminho certo ou precisa se cuidar.

---

## 16. Tom de comunicação

A comunicação do Conta Clara deve ser simples, humana e direta.

Evitar termos técnicos como:

* fluxo de caixa;
* conciliação;
* regime de competência;
* centro de custo;
* demonstrativo financeiro;
* análise patrimonial.

Preferir termos que o usuário comum entende:

* contas do mês;
* gastos;
* cartão;
* assinaturas;
* dinheiro que entrou;
* dinheiro que saiu;
* falta pagar;
* mês positivo;
* mês apertado;
* meta.

---

## 17. Experiência desejada

O Conta Clara deve passar a sensação de:

* organização;
* confiança;
* simplicidade;
* segurança;
* clareza;
* controle;
* tranquilidade.

O usuário não deve se sentir intimidado ao usar o sistema.

A experiência ideal é:

> Entrei, entendi e consegui lançar minhas contas sem precisar de ajuda.

---

## 18. Validação inicial

A validação inicial será feita com clientes reais, começando por pessoas que já conhecem o trabalho do Eraldo Albano.

O objetivo da validação será descobrir:

* se as pessoas entendem a proposta;
* se conseguem usar sem dificuldade;
* se o dashboard realmente ajuda;
* quais funcionalidades mais usam;
* quais partes geram dúvidas;
* se pagariam para continuar usando;
* se o preço faz sentido;
* se indicariam para outra pessoa.

A validação será mais importante do que adicionar muitas funcionalidades no começo.

---

## 19. Métricas simples de sucesso

No início, as métricas podem ser simples:

* número de usuários em teste grátis;
* número de usuários que ativaram plano mensal;
* número de usuários que ativaram plano anual;
* quantidade de lançamentos criados;
* quantidade de contas fixas cadastradas;
* quantidade de cartões cadastrados;
* quantidade de usuários que continuam usando após 30 dias;
* feedbacks positivos;
* dúvidas recorrentes;
* cancelamentos.

Essas informações ajudarão a decidir os próximos passos do produto.

---

## 20. Decisão oficial da V2

A V2 inicial do Conta Clara será:

> Uma aplicação web simples e profissional para pessoas comuns e casais controlarem contas, cartão, assinaturas, metas e gastos do mês, com teste grátis de 30 dias e controle manual de assinatura pelo administrador.

O produto será construído com foco em clareza, simplicidade e uso real.

---
