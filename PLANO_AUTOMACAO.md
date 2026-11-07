# Automação incremental — API 1 e API 2

Regra: implementar um cenário, executar com sucesso e aguardar revisão,
execução manual e aprovação explícita do usuário antes de iniciar o próximo.
Os passos Dado/Quando/Então aprovados estão em
[api-1-rate-limiting.feature](cypress/parte1-api/feature/api-1-rate-limiting.feature).

| Ordem | Cenário | Requisito | Objetivo e resultado esperado | Execução | Estado |
| --- | --- | --- | --- | --- | --- |
| 1 | API-01 | 1 — headers | Consultar github sem autenticação; status 200, limite 60/h, saldo e renovação válidos | GitHub real | Aprovado pelo usuário para avanço ao ciclo 2 |
| 2 | API-02 | 1 — headers | Consultar github com token pessoal; status 200, limite 5000/h, saldo e renovação válidos | GitHub real | Aprovado pelo usuário para avanço ao ciclo 3 |
| 3 | API-03 | 2 — limite atingido | Identificar cota esgotada a partir de status 403 e saldo zero | HTTP local simulado | Aguardando validação do usuário |
| 4 | API-07 | 3 — login e reutilização | Credenciais válidas → login e consulta → usuário id 2; token recebido enviado como Bearer | ReqRes real | Versão anterior aprovada; ajustes de credenciais e cy.session aguardando revisão |
| 5 | API-09 | 4 — expiração | Token com validade simulada atingida → consulta → recusa e tratamento da expiração | HTTP local simulado | Aguardando validação do usuário; isolado e regressão passaram |

API-08 removido por duplicar a reutilização já coberta no fluxo de API-07.
API-07 implementa o Dado/Quando/Então aprovado na feature; não depende de
login ou estado deixado por outro cenário. API-09 não será implementado
antes da revisão, execução manual e aprovação explícita de API-07.

## Validação do ciclo 1

```bash
npm run test:parte1 -- --env tags="@API-01"
npm run test:open -- --env tags="@API-01"
```

No modo interativo: selecionar E2E Testing, escolher um navegador e abrir
`api-1-rate-limiting.feature`. Conferir que somente API-01 é executado e
que suas verificações passam.

API-01 faz uma consulta prévia a `/rate_limit` para verificar a precondição
de cota disponível e uma consulta a `/users/github` para verificar os headers.
Não presume saldo completo. Uma cota já esgotada falha explicitamente;
não há substituição por mock nem aprovação automática do cenário.

A execução sem filtro inclui cenários da API 2 ainda não implementados e
não representa uma suíte concluída.

## Resultado automatizado do ciclo 1

Comando executado neste ambiente:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-01"
```

Resultado: **1 teste passou, 0 falhas, 0 pendentes, 0 ignorados**; código de
saída 0, Cypress 16.2.1, Node.js 24.22.0 e Electron headless.
O comando remove apenas da execução a variável herdada `ELECTRON_RUN_AS_NODE`,
que impedia a inicialização do Electron neste ambiente. Não altera os testes.

Decisões de configuração: localizar os passos em `cypress/parte1-api/specs/`
conforme `stepDefinitions`; expor o filtro público `tags` do argumento `--env`
para compatibilidade com Cypress 16; filtrar specs e omitir cenários fora do filtro.
Nenhuma credencial é necessária para API-01.

A execução automatizada não constitui aprovação. O usuário revisou API-01
e autorizou a implementação do plano de API-02.

## Validação do ciclo 2

API-02 lê `GITHUB_TOKEN` com `cy.env()`, verifica a cota autenticada em
`/rate_limit` e consulta `/users/github` com o mesmo token. Reutiliza os passos
de resposta, limite, saldo e renovação do primeiro cenário.
O token não é exposto como configuração pública; o plugin mascara credenciais.

```bash
npm run test:parte1 -- --env tags="@API-02"
npm run test:parte1 -- --env tags="@API-01 or @API-02"
npm run test:open -- --env tags="@API-02"
```

Comandos efetivamente executados neste ambiente:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-02"
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-01 or @API-02"
```

Resultados contra o GitHub real, com Cypress 16.2.1 e Electron headless:

- API-02 isolado: 1 teste passou, 0 falhas, código de saída 0.
- Regressão API-01 + API-02: 2 testes passaram, 0 falhas, código de saída 0.
- Nenhum teste pendente ou ignorado nessas execuções filtradas.

A credencial foi carregada do arquivo local `cypress.env.json`, ignorado pelo Git.
O teste autenticado confirmou limite de 5000/h, usuário `github`, saldo válido
e renovação comparada ao horário do servidor. A tag temporária `@only` foi removida.

O usuário autorizou o avanço ao ciclo 3. Aprovação automatizada não substitui
aprovação explícita do usuário.

## Validação do ciclo 3

API-03 faz uma requisição HTTP ao servidor local e verifica status 403,
header de saldo zero e mensagem de limite atingido. Depois, passa a resposta
recebida ao helper `isRateLimitExceeded` para validar a identificação.
API-01 e API-02 continuam consultando o GitHub real.

O servidor usa somente `node:http`, escuta em `127.0.0.1` e recebe uma porta
atribuída pelo sistema. Inicia durante `setupNodeEvents` e encerra ao terminar
a execução headless, preservando o evento original do Cucumber. No modo
interativo, permanece disponível até fechar o processo. Não recebe credenciais.

Cobertura: requisição HTTP real, resposta de erro simulada e detecção do limite.
Não comprova o bloqueio real do GitHub; essa distinção é parte da entrega.

```bash
npm run test:parte1 -- --env tags="@API-03"
npm run test:parte1 -- --env tags="@api1"
npm run test:open -- --env tags="@API-03"
```

Comandos executados após restaurar o fluxo HTTP:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-03"
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@api1"
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-01" --config screenshotOnRunFailure=false
```

Resultados com Cypress 16.2.1 e Electron headless:

- API-03 isolado: 1 teste passou, 0 falhas, código de saída 0.
- Regressão: API-02 e API-03 passaram; API-01 falhou. Código de saída 1.
- A captura automática de tela falhou durante a primeira falha de API-01.
  A execução diagnóstica sem captura revelou status 504 em `/users/github`,
  onde o cenário real exige 200. A asserção foi preservada.

API-03 está pronto para revisão manual. A regressão completa permanece
pendente de nova execução quando a consulta pública voltar a responder 200.
Não houve substituição da integração real por simulação nem redução de asserções.

Próximo checkpoint: revisão e validação do usuário. No modo interativo,
conferir URL local, resposta 403, saldo zero e identificação do rate limit.

## API-07 — implementação e resultados

O cenário realiza um login e usa o token retornado no comando
`cy.reqresAuthenticatedRequest(path, token)`. Os steps verificam login 200,
token não vazio, consulta 200, usuário id 2 e Bearer efetivamente enviado.
Inicialmente não havia cache entre cenários; a revisão posterior adotou cy.session.
API-09 foi implementado depois da aprovação da primeira versão de API-07.

Comandos executados em 07/11/2026:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-07"
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-07" --config screenshotOnRunFailure=false
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@api1 or @API-07" --config screenshotOnRunFailure=false
```

A primeira execução falhou e a captura de tela apresentou timeout. A execução
diagnóstica preservou as asserções e revelou: login 200 com token, consulta 401.
Uma consulta diagnóstica sem credencial real confirmou `missing_api_key`:
ao enviar Bearer, o serviço exige também `x-api-key` nesse endpoint.

A implementação passou a ler `REQRES_API_KEY` com `cy.env()` e enviá-la no
login e na consulta, sem expor seu valor. A regressão posterior teve 3 testes
GitHub passando e API-07 falhando claramente pela chave ainda ausente.
Resultado inicial: 3 passaram, 1 falhou.

Após o usuário corrigir a chave para `REQRES_API_KEY` em `cypress.env.json`,
os dois comandos com `screenshotOnRunFailure=false` acima foram repetidos:

- API-07 isolado: 1 passou, 0 falhas; código de saída 0.
- Regressão API-01, API-02, API-03 e API-07: 4 passaram, 0 falhas; código de saída 0.
- Nenhum teste pendente ou ignorado dentro dos filtros.

A opção de captura foi somente de execução, após o timeout diagnóstico;
nenhuma asserção foi reduzida. Credenciais não foram expostas ou versionadas.
API-07 foi revisado e aprovado explicitamente pelo usuário, que autorizou o avanço.
Para validar: `npm run test:open -- --env tags="@API-07"`, abrir a feature
da API 2 e conferir login 200, consulta 200, usuário id 2 e reutilização do token.

A consulta de usuários é pública no exemplo clássico. Esta cobertura verifica
login e reutilização do token no envio; não comprova autorização do recurso.

## Plano do API-09

- Requisito 4; objetivo: reconhecer expiração e descartar a credencial recusada.
- Dado: token sintético com validade de 2 minutos; verificar que é aceito antes
  do vencimento. Avançar relógio controlado exatamente até o vencimento.
- Quando: consultar usuário pelo HTTP local, enviando token e horário simulado.
- Então: status 401, código e mensagem de expiração; helper de tratamento
  descarta o token e informa necessidade de nova autenticação.
- Reutilizar o servidor local já existente, adicionando rota independente da
  simulação GitHub. O servidor compara o horário recebido com a validade fixa
  da fixture; aceita antes do prazo e rejeita no limite ou depois dele.
- Usar cy.clock/cy.tick, com constantes semânticas. Não esperar 2 minutos reais,
  não usar cy.intercept para cy.api e não enviar chaves reais ao servidor local.
- Implementar somente API-09. Executar @API-09 e depois @api1 or @api2.
  Atualizar resultados e aguardar revisão, execução manual e aprovação explícita.
- Limite: comprova tratamento da expiração simulada, não expiração no ReqRes.

## API-09 — resultados e revisão

Implementado nos steps da API 2, com fixture sintética de emissão/validade e
helper puro `handleTokenExpiration`. O servidor existente recebe a rota de
simulação e a configuração expõe seu endereço sem credenciais. A rota GitHub
permanece independente; API-07 mantém a integração real.

Na primeira execução, a leitura de `clock.now` não forneceu horário e a
precondição retornou 400. Corrigido para ler `window.Date.now()` após `cy.clock`
e `cy.tick`, mantendo a asserção de precondição 200 e o limite exato de validade.

Comandos executados em 07/11/2026, Cypress 16.2.1 e Electron headless:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-09" --config screenshotOnRunFailure=false
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@api1 or @api2" --config screenshotOnRunFailure=false
```

- API-09 após correção: 1 passou, 0 falhas; código de saída 0.
- Regressão API-01, API-02, API-03, API-07 e API-09: 5 passaram, 0 falhas;
  código de saída 0, nenhum pendente ou ignorado dentro do filtro.
- Verificação direta do helper: preserva sessão em sucesso, 401 por token
  inválido e 403; descarta token somente em 401 com `token_expired`, sem mutar
  a sessão recebida. Verificação passou.

Revisão manual:

```bash
npm run test:open -- --env tags="@API-09"
```

Abrir `api-2-token.feature`. Conferir endereço local, resposta 200 antes do
vencimento, avanço de 120.000 ms, resposta 401 com motivo de expiração,
token descartado e orientação para autenticar novamente. Nenhuma espera real
de dois minutos ou chamada ao ReqRes nesse cenário.

Estado: aguardando revisão, execução manual e aprovação explícita do usuário.

## Revisão do API-07 — credenciais fora dos steps

A pedido do usuário, email e senha migrados para `REQRES_EMAIL` e
`REQRES_PASSWORD` no arquivo local `cypress.env.json`, ignorado pelo Git.
`cy.env()` lê as três configurações ReqRes sem log e falha com mensagem que
identifica somente o nome da variável ausente. O mascaramento foi ampliado
para email, preservando senha, token e headers de autenticação.

Após a alteração, executados novamente em 07/11/2026:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-07" --config screenshotOnRunFailure=false
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@api1 or @api2" --config screenshotOnRunFailure=false
```

API-07: 1 passou. Regressão: 5 passaram. Zero falhas, pendentes ou ignorados;
ambos com código de saída 0. `git diff --check` passou e `git check-ignore`
confirmou que `cypress.env.json` continua ignorado.
Revisão manual: `npm run test:open -- --env tags="@API-07"`; conferir login,
consulta e campos de credenciais mascarados. Ajuste aguardando revisão do usuário.

## Revisão do API-07 — cy.session

Por preferência expressa do usuário, o login foi envolvido em `cy.session()`.
O setup valida status e token e salva o token em cookie de teste Secure,
HttpOnly e restrito ao domínio ReqRes. Após a sessão ser criada/restaurada,
o step lê o cookie e passa o token ao comando de consulta já existente.
O identificador da sessão não inclui email, senha, chave de API ou token.
O cache fica limitado ao spec e pressupõe uma conta configurada por execução.
O mascaramento de headers foi ampliado para Cookie e Set-Cookie no plugin.

A validação verifica token presente e não vazio. O Cypress repete o setup
se essa validação falhar na restauração. Como a consulta clássica é pública,
não há comprovação de validade real, expiração ou revogação no servidor.
API-09 mantém sua simulação independente, sem renovação que esconda o erro.

Para revisão interativa, executar `npm run test:open -- --env tags="@API-07"`.
Na primeira execução, conferir criação da sessão e login. Reexecutar o spec
na mesma interface para conferir restauração da sessão e consulta sem novo
login. Ao alterar credenciais, limpar as sessões salvas antes de reexecutar.

Executados após a revisão de cy.session em 07/11/2026:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-07" --config screenshotOnRunFailure=false
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@api1 or @api2" --config screenshotOnRunFailure=false
```

API-07 isolado: 1 passou. Regressão: 5 passaram. Zero falhas, pendentes ou
ignorados nos filtros; ambos com saída 0. Esses runs verificaram a criação
da sessão e a consulta; a restauração entre reexecuções fica para a revisão
interativa acima. Ajuste aguardando validação e aprovação explícita do usuário.

## Refatoração do API-07 — cy.reqresLogin()

Extraído somente o fluxo de login para `cypress/support/commands.js`:
`cy.reqresLogin()` lê e valida configurações privadas, cria/restaura a sessão,
verifica login e armazenamento e retorna o token ao chamador. O step mantém
contexto, consulta, alias e asserções de identidade e envio do token.
O comportamento de cache e sua limitação de validação permanecem os mesmos.

Comandos executados em 07/11/2026:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@API-07" --config screenshotOnRunFailure=false
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@api1 or @api2" --config screenshotOnRunFailure=false
```

API-07 isolado: 1 passou. Regressão: 5 passaram. Zero falhas, pendentes ou
ignorados; saída 0 nos dois comandos. `git diff --check` passou.
Para revisão: `npm run test:open -- --env tags="@API-07"`; abrir a feature da
API 2 e conferir sessão, consulta e verificações. Refatoração aguardando aprovação.

## Parte 2 — E2E-01: incluir um produto no carrinho

Estado: aprovado explicitamente pelo usuário; avanço ao E2E-02 autorizado.
Requisito: Questão 2.1, inclusão de produtos e limpeza.
Alvo: SauceDemo público, sem simulação. Given/When/Then em `carrinho.feature`:
cliente autenticado com carrinho vazio → adicionar um produto → somente o produto
escolhido, quantidade 1, preço anunciado no catálogo e contagem 1.
E2E-02 e E2E-03 continuam planejados e com `@skip`; não implementar antes
da aprovação explícita do E2E-01.

Suporte: `commands/auth.js` registra `cy.sauceDemoLogin()` com `cy.session()`;
`commands/cart.js` registra `cy.addProductToCart(productName)`, que retorna nome e preço
capturados antes da inclusão. `Specs/carrinho.cy.js` mantém asserções de negócio.
A sessão usa URL/usuário como identificador, sem senha, e `cacheAcrossSpecs`.
A validação acessa o catálogo protegido; uma restauração inválida refaz o login.
O snapshot é criado antes de qualquer inclusão. O hook After limpa cookies,
localStorage e sessionStorage, sem apagar o cache de sessões do Cypress.
Essa validação cobre autenticação demonstrativa na interface, não autorização
ou revogação por um backend de produção.

Configurar `SAUCEDEMO_USERNAME` e `SAUCEDEMO_PASSWORD` em `cypress.env.json`
(ignorado pelo Git), com as credenciais do desafio. URL pública em
`config.expose.sauceDemoBaseUrl`; baseUrl da API preservado.

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-01 and not @skip"
npm run test:open -- --env tags="@E2E-01 and not @skip"
```

Revisão manual: abrir `carrinho.feature`, conferir carrinho vazio, inclusão do
Backpack, único produto, quantidade 1, preço igual ao catálogo e contagem 1.
Reexecutar o mesmo spec sem limpar as sessões salvas: o log de sessão deve
indicar restauração, sem preenchimento do login. A limpeza após o cenário
continua obrigatória. Essa revisão ainda não foi executada ou aprovada pelo usuário.

### E2E-01 — resultados em 07/11/2026

Executados com Cypress 16.2.1, Node.js 24.22.0 e Electron headless:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-01 and not @skip"
env -u ELECTRON_RUN_AS_NODE npm run test:parte1 -- --env tags="@api1 or @api2" --config screenshotOnRunFailure=false
```

- E2E-01: 1 passou, zero falhas, pendentes ou ignorados; saída 0.
- Regressão API-01, API-02, API-03, API-07 e API-09: 5 passaram, zero falhas,
  pendentes ou ignorados; saída 0. Nenhuma alteração nos steps da API.
- Sintaxe JavaScript, Gherkin e `git diff --check` passaram. Preservados 14 casos
  na Parte 2, autenticação nos Contextos e somente E2E-01 habilitado.
- `git check-ignore` confirmou exclusão do arquivo local de credenciais.

A primeira execução no sandbox terminou com código 133 antes de iniciar o
runner. Execuções fora do sandbox permitiram iniciar o Electron. A captura
automática apresentou timeout durante falhas iniciais; foi desativada apenas
nos comandos diagnósticos e na regressão acima. O E2E-01 final passou com a
configuração padrão de captura, sem reduzir asserções.

A inclusão de múltiplas suítes mudou a base usada pelo placeholder `[filepath]`.
A tentativa de carregar todos os steps revelou frases homônimas entre as APIs.
A resolução final no `file:preprocessor` associa o nome de cada feature ao seu
arquivo em `../{specs,Specs}/nome.cy.js`, preservando os diretórios existentes e
evitando carregar steps de outra feature. A regressão final confirmou a correção.

O acesso direto a `/inventory.html` entrega a aplicação com HTTP 404 no host
público, confirmado também pelo Playwright. A navegação dessa rota usa
`failOnStatusCode: false`, mas exige pathname do catálogo e conteúdo autenticado
visível tanto na validação da sessão quanto após a visita. Isso não comprova
HTTP 200 da rota; login negado, erro de aplicação ou catálogo ausente falham.

O run headless confirmou criação da sessão, validação, inclusão e execução do
hook de limpeza. Restauração do cache entre reexecuções e recriação de sessão
inválida não foram exercitadas nesta execução; conferir a restauração pela
revisão interativa descrita acima, sem adicionar outro cenário. Nenhuma aprovação
manual foi inferida. E2E-02 e E2E-03 permanecem sem implementação.

### E2E-01 — command genérico de inclusão

A pedido do usuário, substituído `addBackpackToCart()` por
`cy.addProductToCart(productName)`. O nome é comparado exatamente, com caracteres
de expressão regular escapados. O botão `[data-test^="add-to-cart-"]` fica isolado
em `elements.js` e é consultado somente dentro do item escolhido. O retorno
continua contendo nome e preço anunciados. Produto inexistente ou já adicionado
falha pela ausência do nome/botão esperado, sem escolher outro produto.
O E2E-01 continua usando Sauce Labs Backpack; nenhum cenário adicional habilitado.
README e chamada nos steps atualizados.

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-01 and not @skip"
```

Resultado: 1 passou, zero falhas, pendentes ou ignorados; saída 0, Cypress 16.2.1
com Electron headless. Sintaxe JavaScript e `git diff --check` passaram.
Esta execução valida o uso do command no E2E-01, sem alegar execução de todos os
produtos. Revisão manual: abrir o mesmo cenário no Cypress interativo e conferir
nome, quantidade, preço e contagem. Ajuste aguardando validação e aprovação
explícita do usuário; E2E-02 permanece planejado.

### E2E-01 — produto parametrizado no Gherkin

O step agora recebe `adiciona o produto {string} ao carrinho` e repassa o
nome para `cy.addProductToCart(productName)`. O E2E-01 informa "Sauce Labs Backpack"
na feature. A asserção compara o nome capturado com o parâmetro esperado,
sem nome fixo nos steps. Demais cenários permanecem inalterados.

Executado:
`env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-01 and not @skip"`.
Resultado: 1 passou, zero falhas, pendentes ou ignorados, saída 0. Sintaxe e
`git diff --check` passaram. Para revisão manual, abrir o mesmo cenário no
Cypress interativo e conferir o produto indicado na feature. Ajuste aguardando
validação e aprovação explícita do usuário.

## Parte 2 — E2E-02: incluir dois produtos distintos

E2E-01: revisado e aprovado explicitamente pelo usuário, que autorizou o avanço.
Arquivos atuais renomeados pelo usuário: `feature/cart.feature` e `Specs/cart.cy.js`.
Estado E2E-02: revisado e aprovado explicitamente pelo usuário. Requisito: Questão 2.1, inclusão de produtos.
Alvo: SauceDemo público, sem simulação.

- Dado: cliente autenticado, sessão criada/restaurada, carrinho vazio.
- Quando: adiciona os produtos parametrizados Sauce Labs Backpack e Sauce Labs
  Bike Light, sequencialmente, reutilizando `cy.addProductToCart(productName)`.
- Então: exatamente os dois produtos esperados, uma unidade de cada, preços
  iguais aos anunciados e contagem 2. Comparações independentes da ordem.

Reutilizados Contexto, command, sessão, seletores e hook de limpeza. Não há
novo command ou alteração na configuração. Nome e preço de cada produto são
capturados antes de sua inclusão. E2E-03 continua planejado e com `@skip`.

Comandos executados:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-02 and not @skip"
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="(@E2E-01 or @E2E-02) and not @skip"
```

### E2E-02 — resultados

Cypress 16.2.1, Node.js 24.22.0, Electron headless, serviço SauceDemo real:

- E2E-02 isolado: 1 passou, zero falhas, pendentes ou ignorados; saída 0.
- Regressão E2E-01 + E2E-02: 2 passaram, zero falhas, pendentes ou ignorados; saída 0.
- Sintaxe JavaScript, compilação Gherkin e `git diff --check` passaram.
  Os 14 casos da Parte 2 foram preservados, com autenticação nos Contextos;
  somente E2E-01 e E2E-02 estão habilitados.

A seleção usa nomes parametrizados na feature. O command existente captura
nome/preço antes de cada inclusão. Asserções comparam o conjunto de nomes
exatamente com os parâmetros; quantidade e preço são verificados dentro do item
localizado pelo nome exato, sem depender da ordem ou de preços fixos.
Não houve novo command, espera fixa, mudança na API/configuração ou implementação
do E2E-03. Permanece a limitação documentada de HTTP 404 da rota SPA, com
verificação obrigatória do catálogo autenticado no command de login.

Revisão manual:

```bash
npm run test:open -- --env tags="@E2E-02 and not @skip"
```

Abrir `cart.feature` e conferir autenticação criada/restaurada, carrinho inicial
vazio, Backpack e Bike Light, uma unidade de cada, preços iguais aos anunciados
e contagem 2. Revisar `feature/cart.feature`, `Specs/cart.cy.js`, README e este
registro. O resultado automatizado não constitui aprovação manual. Aguardar
revisão, execução manual e aprovação explícita antes de iniciar E2E-03.

### Refatoração de legibilidade — E2E-01 e E2E-02

Após aprovação explícita do E2E-02 e autorização para os ajustes de legibilidade:

- Dados acessados por `cy.get('@alias')`, sem misturar com contexto `this`.
- Expressão de formato de preço declarada uma vez como `priceFormat`.
- Inclusão dos dois produtos expressa sequencialmente, retornando seus dados
  em um array, sem lista externa mutável ou loop para apenas dois produtos.
- Mensagem de credencial ausente no login aplicável a todos os testes SauceDemo.

Nenhuma asserção removida; sessão, limpeza e seletores preservados.

Executado:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="(@E2E-01 or @E2E-02) and not @skip"
```

Resultado: 2 passaram, zero falhas, pendentes ou ignorados; saída 0.
Cypress 16.2.1, Node.js 24.22.0, Electron headless. Sintaxe JavaScript e
`git diff --check` passaram. Revisão manual do ajuste: executar
`npm run test:open -- --env tags="(@E2E-01 or @E2E-02) and not @skip"`,
abrir `cart.feature` e conferir produtos, quantidades, preços e contagem nos dois
cenários. A aprovação dos cenários foi registrada; esta refatoração aguarda
revisão do usuário. E2E-03 continua sem implementação.

## Parte 2 — E2E-03: remover o último produto

Refatoração anterior de E2E-01 e E2E-02 aprovada pelo usuário ao autorizar
continuidade para E2E-03. Estado E2E-03: revisado e aprovado explicitamente
pelo usuário.
Requisito: Questão 2.1, gerenciamento do carrinho e limpeza após o teste.
Alvo: SauceDemo público, sem simulação.

- Dado: cliente autenticado, somente o produto parametrizado Sauce Labs Backpack
  no carrinho; verificar nome, quantidade 1, único item e contagem 1.
- Quando: remover esse produto por `cy.removeProductFromCart(productName)`.
- Então: carrinho visível sem produtos e contagem ausente.

Reutilizados sessão, command de inclusão e hook After para limpeza inclusive
em falhas. Novo command de remoção busca o nome exato e restringe o seletor
`elements.btn.removeFromCart` ao item escolhido. Asserções permanecem nos steps;
sem POM, esperas fixas, mudança de configuração ou novos cenários.

### E2E-03 — resultados

Comandos executados:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-03 and not @skip"
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@carrinho and not @skip"
```

Resultados com Cypress 16.2.1, Node.js 24.22.0 e Electron headless:

- E2E-03 isolado: 1 passou, zero falhas, pendentes ou ignorados; saída 0.
- Regressão E2E-01, E2E-02 e E2E-03: 3 passaram, zero falhas, pendentes ou
  ignorados; saída 0.
- Sintaxe JavaScript, Gherkin e `git diff --check` passaram. Mantidos 14 casos,
  Contextos de autenticação e somente os três cenários de carrinho habilitados.

Arquivos: `feature/cart.feature`, `Specs/cart.cy.js`, `commands/cart.js`,
`elements.js`, README e este acompanhamento. Produto parametrizado na precondição
e remoção genérica por nome, com botão restrito ao item. Asserções nos steps
comprovam estado antes e depois da ação, sem aceitar contagem zero como substituto
da ausência do indicador. Mantida a limitação já documentada da rota SPA no login.

Revisão manual:

```bash
npm run test:open -- --env tags="@E2E-03 and not @skip"
```

Abrir `cart.feature`; conferir único produto Sauce Labs Backpack, quantidade 1
e contagem 1 antes da remoção. Após remover, conferir carrinho visível sem
produtos e ausência da contagem. E2E-03 revisado e aprovado explicitamente
pelo usuário após a entrega; nenhum próximo cenário foi iniciado.

## Refatoração — ações de navegação do carrinho

Implementado o plano autorizado: `cy.openCart()` abre o carrinho e aguarda seu
conteúdo; `cy.returnToCatalog()` retorna ao catálogo e aguarda seu conteúdo;
`cy.addProductAndOpenCart(productName)` compõe inclusão e abertura, retornando
nome/preço capturados. `cy.addProductToCart()` permanece para inclusões antes
da abertura do carrinho. Ações ficam em `commands/cart.js`, sem novos seletores.
Asserções de produtos, preços, quantidades e contagem permanecem em `Specs/cart.cy.js`.

Restaurada somente a tag `@carrinho` na funcionalidade: o hook After existente
volta a se aplicar aos três cenários, limpando cookies, localStorage e
sessionStorage. Preservadas as demais edições manuais da feature, sessão e Then.
Sem alteração na configuração, na API ou implementação de outros cenários.

Executado:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@carrinho and not @skip"
```

Resultado: 3 passaram, zero falhas, pendentes ou ignorados; saída 0.
Cypress 16.2.1, Node.js 24.22.0, Electron headless. Sintaxe JavaScript, Gherkin,
herança de @carrinho nos três casos e `git diff --check` passaram.

Revisão manual:

```bash
npm run test:open -- --env tags="@carrinho and not @skip"
```

Abrir `cart.feature`, conferir os três comportamentos aprovados e a execução
do hook After com limpeza após cada cenário. Refatoração aguardando revisão do
usuário; aprovação anterior dos cenários preservada. Nenhum próximo cenário iniciado.
