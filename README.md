# Teste QA Sênior - Magazord

Projeto de testes API e E2E com Cypress, cenários BDD em Gherkin e JavaScript.
Requisitos do desafio: [desafio.md](desafio.md). Diretrizes: [AGENTS.md](AGENTS.md).

## Tecnologias

- Node.js 22.13+ ou 24 (ou 26+), conforme compatibilidade do Cypress instalado.
- Cypress 16.2.1.
- `@faker-js/faker` 10.5.0, locale `pt_BR`, para dados sintéticos de checkout.
- `@badeball/cypress-cucumber-preprocessor` para executar arquivos `.feature`.
- esbuild e `@bahmutov/cypress-esbuild-preprocessor` para compilar os testes.

## Instalação

```bash
npm install
npx cypress verify
```

Após gerar e versionar `package-lock.json`, use `npm ci` para instalações reproduzíveis.

O Cypress baixa seu binário durante a instalação. Linux também exige as
[bibliotecas de sistema do Cypress](https://docs.cypress.io/app/get-started/install-cypress#Linux-Prerequisites).

## Execução

```bash
npm test                 # Todas as partes práticas, sem interface
npm run test:open        # Interface interativa
npm run test:parte1      # API
npm run test:parte2      # Checkout E2E
npm run test:parte3      # Upload CSV
```

Os cenários são implementados e aprovados um por vez. Para executar somente
o cenário atual da API 1, sem incluir os cenários ainda não implementados:

```bash
npm run test:parte1 -- --env tags="@API-01"
npm run test:open -- --env tags="@API-01"
```

No modo interativo, selecione E2E Testing, escolha o navegador e abra
`api-1-rate-limiting.feature`. Apenas o cenário filtrado será executado.
API-01 usa o GitHub real, sem token; exige rede e cota pública disponível.
Valida limite de 60/h, saldo e renovação com base no horário do servidor.
Não exige saldo inicial completo nem esgota a cota pública.
O [plano da API 1](PLANO_AUTOMACAO.md) registra o estado dos ciclos.
A execução sem filtro inclui cenários ainda não implementados.
Partes 4 e 5 são teóricas e não possuem scripts.

### API-02 — consulta autenticada

Usa um token pessoal GitHub válido com cota padrão de 5.000/h. Configure no
mesmo terminal onde iniciará o Cypress, sem incluir o valor no histórico:

```bash
read -rsp 'Token GitHub: ' CYPRESS_GITHUB_TOKEN
export CYPRESS_GITHUB_TOKEN
```

Como alternativa local, crie `cypress.env.json` na raiz, já ignorado pelo Git,
com a chave `GITHUB_TOKEN` e seu token como valor:

```json
{
  "GITHUB_TOKEN": "SEU_TOKEN"
}
```

Use JSON válido, com aspas duplas. Não versione esse arquivo.
O Cypress carrega esse arquivo diretamente; `.env` não é carregado automaticamente.
O código lê a credencial com `cy.env()`. O plugin mascara `authorization`
na interface e as requisições autenticadas desabilitam o log padrão.

```bash
npm run test:parte1 -- --env tags="@API-02"
npm run test:parte1 -- --env tags="@API-01 or @API-02"
npm run test:open -- --env tags="@API-02"
```

No modo interativo, abra `api-1-rate-limiting.feature` e confira os dados do
usuário `github`, o limite de 5000/h, o saldo e a renovação. O header de
autenticação deve aparecer mascarado no painel do plugin.
Se `ELECTRON_RUN_AS_NODE` estiver definido no ambiente, prefixe os comandos
com `env -u ELECTRON_RUN_AS_NODE`.
Credencial ausente ou inválida e cota esgotada causam falha explícita;
nenhuma chamada autenticada é substituída por simulação.

### API-03 — cota esgotada simulada

API-03 faz uma requisição HTTP com `cy.api()` a um servidor local mínimo,
criado com `node:http`, sem dependências adicionais. Esse servidor responde
403 com header `X-RateLimit-Remaining: 0` e mensagem `API rate limit exceeded`.
O teste valida a resposta recebida e sua identificação pelo helper
`isRateLimitExceeded`.

```bash
npm run test:parte1 -- --env tags="@API-03"
npm run test:parte1 -- --env tags="@api1"
npm run test:open -- --env tags="@API-03"
```

API-03 não precisa de token nem consulta o GitHub. A regressão `@api1` executa
os três cenários e exige rede e token válido para os dois cenários reais.
No modo interativo, confira no painel de `cy.api()` a URL
`http://127.0.0.1:<porta>/users/github`, status 403, saldo zero e mensagem
de limite atingido.

O Cypress inicia o servidor durante `setupNodeEvents`, somente em loopback e
com porta atribuída pelo sistema. Ao finalizar a execução headless, encerra
o servidor; no modo interativo, mantém o servidor disponível para reexecuções
até fechar o processo. Rotas desconhecidas retornam 404.

Essa simulação valida o fluxo requisição HTTP → resposta 403 → detecção da cota esgotada.
Não comprova o mecanismo de bloqueio do GitHub e não consome sua cota pública.
API-01 e API-02 continuam validando respostas reais de integração com o GitHub.

### API-07 — login e reutilização do token

Executa um login real no ReqRes com as credenciais de exemplo do desafio e
consulta o usuário de id 2 com o token recebido. A URL do ReqRes fica em
`config.expose.reqresBaseUrl`; o `baseUrl` do GitHub permanece separado.
O comando `cy.reqresAuthenticatedRequest(path, token)` envia o Bearer sem
fazer outro login. As asserções nos steps verificam status 200, token não
vazio, usuário esperado e o header efetivamente enviado na consulta.
O comando `cy.reqresLogin()` lê as credenciais e cria/restaura a sessão com
`cy.session()`, retornando o token ao step. Validações de login e armazenamento
ficam no comando; asserções de consulta, identidade e envio do token ficam nos steps.
O token retornado é guardado num cookie
de teste `HttpOnly` e `Secure`, restrito ao domínio ReqRes, para o Cypress
salvar e restaurar a sessão. Após criação ou restauração, o teste lê o token
do cookie e o envia como Bearer. O ReqRes não depende desse cookie para login;
ele é apenas armazenamento do teste. Headers de cookies também são mascarados.
A validação da sessão verifica presença do token; se a sessão restaurada não
passar nessa validação, o Cypress executa o login novamente. O endpoint público
não permite verificar revogação ou expiração real dessa credencial.
O cache usa uma única conta configurada e fica limitado ao spec, sem
`cacheAcrossSpecs`. Ao trocar credenciais no modo interativo, limpe as sessões
salvas pelo Cypress. Uma nova execução headless começa sem esse cache.
Configure `REQRES_API_KEY`, `REQRES_EMAIL` e `REQRES_PASSWORD` em
`cypress.env.json`, preservando `GITHUB_TOKEN`, ou exporte as variáveis com
prefixo `CYPRESS_` no terminal. Use as credenciais indicadas no desafio.
Email e senha são lidos com `cy.env()` sem log; não ficam nos steps.
O plugin mascara email, senha, tokens e chave de API no painel.
Não envie nem versione essas credenciais.
A execução real exigiu `x-api-key` na consulta com Bearer; a chave de acesso
ao serviço é diferente do token recebido no login. Ambos são mascarados.

```bash
npm run test:parte1 -- --env tags="@API-07"
npm run test:parte1 -- --env tags="@api1 or @API-07"
npm run test:open -- --env tags="@API-07"
```

No modo interativo, abra `api-2-token.feature` e confira o login seguido
da consulta, respostas 200 e asserção de reutilização do token. Credenciais
permanecem mascaradas pelo plugin. O endpoint clássico de usuários é público:
este teste comprova envio do token recebido, sem comprovar proteção do recurso
contra chamadas sem autenticação.
Resultados efetivos e impedimentos ficam no [plano](PLANO_AUTOMACAO.md).
Em 07/11/2026, API-07 passou isoladamente e a regressão com `@api1 or @API-07`
teve 4 testes passando, sem falhas. API-07 foi revisado e aprovado pelo usuário.

### API-09 — expiração simulada do token

Usa somente HTTP local e token sintético, sem chave ReqRes ou token GitHub.
Reaproveita o processo servidor do API-03, com rota independente `/api/users/2`.
A fixture define emissão e validade de 2 minutos. O servidor aceita o token
antes do vencimento e retorna 401 com código `token_expired` ao atingir o prazo.
O horário chega pelo parâmetro `now`, exclusivo do contrato de simulação.

O teste confirma uma consulta 200 antes da expiração, avança 120 segundos com
`cy.clock()`/`cy.tick()` sem espera real e consulta novamente. O helper
`handleTokenExpiration` trata a resposta: descarta o token e retorna indicação
e mensagem para nova autenticação. Os steps verificam tanto a resposta HTTP
quanto o resultado do tratamento. O relógio é restaurado pelo Cypress entre testes.

```bash
npm run test:parte1 -- --env tags="@API-09"
npm run test:parte1 -- --env tags="@api1 or @api2"
npm run test:open -- --env tags="@API-09"
```

Para revisão, abra `api-2-token.feature`: confira URL local, primeira resposta
200, avanço de 120.000 ms, resposta 401 e asserções de descarte e novo login.
Nenhuma credencial real é enviada ao servidor local. Não usa `cy.intercept()`.
Este cenário verifica tratamento de expiração simulada; não comprova expiração
do token do ReqRes público nem apresenta uma mensagem em interface de produto.
Em 07/11/2026, API-09 passou isoladamente e a regressão das APIs 1 e 2 teve
5 testes passando, zero falhas. API-09 aguarda revisão e aprovação do usuário.

## Organização e BDD

A parte 1 mantém as features em `cypress/parte1-api/feature/` e os passos
em `cypress/parte1-api/specs/`. O preprocessor associa cada feature ao arquivo de steps com o mesmo nome,
conforme a resolução configurada em `cypress.config.js`.
A Parte 2 mantém features em `cypress/parte2-e2e/questao2.1/feature/`,
steps em `Specs/`, commands em `commands/` e seletores em `elements.js`.
A descoberta associa `nome.feature` a `Specs/nome.cy.js`, sem carregar
steps homônimos de outras features. A resolução parte da pasta de cada feature
e aceita `specs/` e `Specs/`, preservando os caminhos existentes da API. A Parte 3 permanece
com a estrutura prevista em `parte3-arquivos/questao3.1/testes/`.
Use `# language: pt` no início dos arquivos Gherkin em português.

Os cenários descrevem comportamentos de negócio com Dado/Quando/Então.
Passos delegam lógica reutilizável a comandos registrados em
`cypress/support/commands.js`. Isole seletores em módulos por funcionalidade;
não use POM. Código de suporte compartilhado fica em `cypress/support/`.

## Decisões

API e E2E compartilham o mesmo projeto e configuração. Bibliotecas adicionais
serão incluídas conforme necessidade concreta dos cenários. Não adicione secrets,
artefatos de execução ou dependências instaladas ao controle de versão.

## Parte 2 — E2E-01: inclusão no carrinho

Configure `SAUCEDEMO_USERNAME` e `SAUCEDEMO_PASSWORD` em `cypress.env.json`
(ignorado pelo Git), preservando as chaves das APIs. Use as credenciais de
exemplo fornecidas em `desafio.md`; o código lê os valores com `cy.env()` sem log.
A URL fica em `config.expose.sauceDemoBaseUrl`, separada do baseUrl do GitHub.

```bash
npm run test:parte2 -- --env tags="@E2E-01 and not @skip"
npm run test:open -- --env tags="@E2E-01 and not @skip"
```

Se necessário, prefixe com `env -u ELECTRON_RUN_AS_NODE`. No modo interativo,
abra `cart.feature`: confira o único produto, quantidade 1, preço igual ao
anunciado e contagem 1. As asserções ficam nos steps; os commands reutilizam
login e inclusão sem POM. Use `cy.addProductToCart(productName)` para selecionar
o produto pelo nome exato, adicionar e obter nome/preço do catálogo. O botão
é localizado pelo atributo data-test dentro do produto escolhido.
E2E-01 e E2E-02 foram revisados e aprovados pelo usuário;
E2E-03 foi revisado e aprovado pelo usuário.

O login usa `cy.session()` com `cacheAcrossSpecs: true`, reutilizando a sessão
na mesma execução/máquina. Na primeira chamada, autentica pela interface e salva
um estado sem produtos; nas seguintes, restaura e valida o catálogo protegido.
Se a restauração não passar na validação, refaz o login. O host público entrega
a aplicação com HTTP 404 ao acessar diretamente `/inventory.html`; apenas essa
navegação tolera o status, exigindo URL correta e catálogo autenticado visível.
Uma tela de erro ou redirecionamento para login continua fazendo o teste falhar. Reexecute o mesmo spec na interface para
conferir restauração sem preencher credenciais novamente. Uma nova execução
headless cria outro cache; ao trocar a senha mantendo o usuário, limpe as sessões
salvas na interface. URL e usuário identificam a sessão; senha não integra o ID.

O hook After de `@carrinho` limpa cookies, localStorage e sessionStorage, inclusive
após falha, preservando o cache gerenciado pelo Cypress. O isolamento padrão
continua ativo. Resultados e aprovação manual são registrados no plano.
Este cenário cobre inclusão no SauceDemo público; checkout completo, cupons e
autorização financeira não estão cobertos pelo E2E-01.

### E2E-02 — dois produtos distintos

A feature parametriza Sauce Labs Backpack e Sauce Labs Bike Light. O cenário
reutiliza `cy.addProductToCart(productName)` para cada inclusão, captura os dados
do catálogo e verifica os dois produtos exatos, quantidade 1 para cada um,
preços anunciados e contagem 2. As verificações não dependem da ordem dos itens.
Reutiliza sessão, precondição de carrinho vazio e limpeza após o teste.

```bash
npm run test:parte2 -- --env tags="@E2E-02 and not @skip"
npm run test:parte2 -- --env tags="(@E2E-01 or @E2E-02) and not @skip"
npm run test:open -- --env tags="@E2E-02 and not @skip"
```

Para revisão manual, abrir `cart.feature` e conferir os dois produtos, uma
unidade de cada, preços iguais ao catálogo e contagem 2. Resultado automatizado
e aprovação explícita são registrados separadamente em `PLANO_AUTOMACAO.md`.

### E2E-03 — remoção do último produto

A precondição parametriza o produto e confirma somente um item no carrinho,
com nome esperado, quantidade 1 e contagem 1. A remoção reutilizável
`cy.removeProductFromCart(productName)` procura o nome exato e o botão dentro
do item. Os steps verificam carrinho visível sem produtos e ausência da contagem.
Sessão e limpeza após o teste são compartilhadas com E2E-01 e E2E-02.

```bash
npm run test:parte2 -- --env tags="@E2E-03 and not @skip"
npm run test:parte2 -- --env tags="@carrinho and not @skip"
npm run test:open -- --env tags="@E2E-03 and not @skip"
```

Revisão manual: abrir `cart.feature`, conferir o único produto antes da remoção,
carrinho vazio depois e ausência da contagem. Resultados e estado de aprovação
ficam em `PLANO_AUTOMACAO.md`; sucesso automatizado não substitui aprovação.

### Commands de navegação do carrinho

Os steps reutilizam `cy.openCart()` e `cy.returnToCatalog()` para navegação.
`cy.addProductAndOpenCart(productName)` inclui um produto, abre o carrinho e
retorna nome/preço do catálogo. Para incluir vários produtos antes de abrir,
use `cy.addProductToCart(productName)`. Asserções de negócio permanecem nos steps.
A tag `@carrinho` na funcionalidade é necessária para aplicar o hook After de limpeza.

```bash
npm run test:parte2 -- --env tags="@carrinho and not @skip"
npm run test:open -- --env tags="@carrinho and not @skip"
```

### E2E-04 — dados válidos no checkout

O login e a limpeza compartilhados ficam em `Specs/common.steps.js`, importado
explicitamente pelos specs de carrinho e dados. Não há importação de um spec
pelo outro nem duplicação do Given de autenticação. O hook After se aplica a
`@cart or @CheckoutData`, inclusive após falhas, preservando o cache de sessão.

O Contexto inclui Backpack e Bike Light, capturando nome/preço anunciados.
`cy.startCheckout()` abre o carrinho e inicia identificação;
`cy.submitCheckoutData(data)` preenche os três dados e avança. Seletores em
`elements.js` e asserções do resumo nos steps, sem POM.

`fixtures/checkout-data.js` exporta `generateCheckoutData()`, usando `fakerPT_BR`
para nome, sobrenome e CEP de oito dígitos, gerados durante cada execução e sem
seed fixa. Dados podem se repetir; o CEP é sintético, sem consulta postal real.
A versão do Faker está fixada no manifesto e lockfile. Node 22 exige 22.13+;
a CI permanece em Node 24. Os três exemplos de campos obrigatórios estão implementados
e aguardam validação manual conjunta, autorizada pelo usuário.

```bash
npm run test:parte2 -- --env tags="@E2E-04 and not @skip"
npm run test:parte2 -- --env tags="(@cart or @E2E-04) and not @skip"
npm run test:open -- --env tags="@E2E-04 and not @skip"
```

Revisão manual: abrir `checkout-data.feature`, conferir dados gerados no
preenchimento, avanço para a revisão, exatamente os dois produtos, quantidade 1
e preços iguais aos anunciados. Não finaliza a compra nem valida pagamento.
Resultados automatizados e aprovação manual são registrados no plano.

### E2E-05 — campos obrigatórios

Preservada a escrita do esquema com uma única tabela de Exemplos contendo nome,
sobrenome e CEP, sob a tag compartilhada `@E2E-05`. O usuário autorizou
explicitamente implementar e validar os três neste ciclo, como exceção ao fluxo
de um caso por vez.

Cada execução gera dados com Faker e deixa somente o campo indicado vazio.
O command limpa os três campos, preenche valores não vazios e confere os valores
antes de avançar. Os steps relacionam o dado obrigatório à propriedade e à
mensagem esperada; um nome de campo desconhecido falha explicitamente.

| Campo ausente | Mensagem exata esperada |
| --- | --- |
| nome | Error: First Name is required |
| sobrenome | Error: Last Name is required |
| CEP | Error: Postal Code is required |

Todos verificam erro visível, URL da identificação, formulário visível e resumo
ausente, com sessão e limpeza compartilhadas.

```bash
npm run test:parte2 -- --env tags="@E2E-05 and not @skip"
npm run test:parte2 -- --env tags="(@cart or @CheckoutData) and not @skip"
npm run test:open -- --env tags="@E2E-05 and not @skip"
```

Revisão manual: abrir `checkout-data.feature` e conferir, nos três exemplos,
somente o campo indicado vazio, demais dados preenchidos, mensagem específica
e permanência na identificação. Aprovação do esquema registrada separadamente
dos resultados automatizados em `PLANO_AUTOMACAO.md`.

### E2E-08 — valores, pagamento e entrega

A fixture `fixtures/review-order.js` define produtos, quantidades, preços em
centavos, taxa esperada desta massa em pontos-base, cartão e entrega. O catálogo
é comparado à fixture, assim como os produtos na revisão. Mudanças intencionais
na oferta exigem revisão desses dados esperados; o teste não aceita qualquer
novo preço automaticamente.

`utils/order-totals.js` calcula subtotal, imposto e total independentemente dos
valores exibidos. Multiplica preço por quantidade em centavos e aplica a taxa,
arredondando ao centavo mais próximo, com meio centavo para cima. A formatação
em dólares ocorre apenas para comparar textos. Não há cobrança de frete nesta
massa, cuja modalidade gratuita também é validada.

| Verificação | Esperado nesta compra |
| --- | --- |
| Backpack / Bike Light / Bolt T-Shirt | $29.99 / $9.99 / $15.99, quantidade 1 por produto |
| Subtotal | $55.97 |
| Imposto | $4.48, taxa esperada de 8% |
| Total | $60.45 |
| Pagamento | SauceCard #31337 |
| Entrega | Free Pony Express Delivery! |

A taxa é uma expectativa explícita do caso, não uma regra fiscal geral.
Asserções de negócio ficam no spec e a limpeza compartilhada inclui a tag
`@paymentConfirmation`. PAG-01 permanece com `@skip`, assim como os cupons.

```bash
npm run test:parte2 -- --env tags="@E2E-08 and not @skip"
npm run test:parte2 -- --env tags="not @skip"
npm run test:open -- --env tags="@E2E-08 and not @skip"
```

Para revisar, abrir `payment-confirmation.feature` e conferir produtos,
quantidades, preços, subtotal, imposto, total, cartão e modalidade de entrega.
O cenário termina na revisão: não comprova cobrança ou processamento financeiro
em backend. Resultados e aprovação manual são registrados no plano.

### Listas de produtos no E2E-08

`cy.addProductsToCart(items)` recebe uma lista de `{ name, unitPriceCents, quantity }`,
inclui cada produto sequencialmente pelo command individual e confere nome/preço
anunciados contra a massa. Rejeita lista vazia, nomes duplicados e quantidade
diferente de 1 antes das inclusões, pois o SauceDemo suporta uma unidade de
cada produto distinto. A lista não tem limite fixo de dois produtos.

`cy.validateProducts(items)` confere quantidade de itens, conjunto exato de nomes,
quantidade por produto e preço esperado, sem depender da ordem exibida. O step
Then identifica a intenção e delega essa validação ao command, conforme pedido
do usuário. Os steps de totais, pagamento e entrega mantêm suas asserções.

A massa atual tem Backpack, Bike Light e Bolt T-Shirt. O cálculo independente
espera subtotal $55.97, imposto $4.48 e total $60.45. Reutilizados os seletores
existentes; commands individuais e cenários de carrinho preservados.

### E2E-09 — cancelar na revisão preservando o carrinho

Prepara a revisão com os três produtos da fixture e dados Faker. Confere os
produtos antes de cancelar e usa `cy.cancelCheckout()` para retornar ao catálogo.
Valida URL, catálogo visível e ausência de resumo e confirmação. Depois confere
a contagem e abre o carrinho para validar os mesmos produtos, quantidades e
preços com `cy.validateProducts()`. Reutiliza sessão e limpeza compartilhadas.

```bash
npm run test:parte2 -- --env tags="@E2E-09 and not @skip"
npm run test:open -- --env tags="@E2E-09 and not @skip"
```

Para revisar, abrir `payment-confirmation.feature` e conferir revisão,
cancelamento, retorno ao catálogo e carrinho preservado. A ausência de
confirmação é verificada na interface; não comprova estado de pedido em backend.
Resultados e aprovação manual ficam no plano de acompanhamento.

### E2E-10 — confirmar compra completa de produtos

Percorre autenticação por sessão, inclusão dos três produtos da fixture,
identificação com dados Faker, revisão e finalização. Antes de finalizar, confere
produtos, quantidades e preços. Os cálculos detalhados continuam no E2E-08.

`cy.finishCheckout()` finaliza e aguarda a conclusão. O command
`cy.validateOrderConfirmation()` confere a URL `/checkout-complete.html`, a
conclusão visível e os textos exatos de agradecimento e despacho. Depois o teste
verifica ausência da contagem, abre o carrinho e confirma ausência de produtos.
A limpeza compartilhada ocorre também em falhas.

```bash
npm run test:parte2 -- --env tags="@E2E-10 and not @skip"
npm run test:parte2 -- --env tags="not @skip"
npm run test:open -- --env tags="@E2E-10 and not @skip"
```

Para revisar, abrir `payment-confirmation.feature` e conferir dados gerados,
três produtos na revisão, confirmação após finalizar e carrinho vazio.
A confirmação demonstra comportamento da interface do SauceDemo; não comprova
cobrança, envio ou pedido em backend. Resultados e aprovação manual ficam no plano.
