# Automação incremental — API 1 e API 2

## Parte 3 — plano aprovado de CSV

### Aprovação da entrega para commit e push

Usuário informou cenários passando e autorizou commit e push da Parte 3,
incluindo refatorações e respostas teóricas. Última execução automatizada:
seis cenários passaram, zero falhas, pendentes ou ignorados. Conferência final
do diff passou. Artefatos Playwright, instruções locais e credenciais excluídos
do commit. O arquivo `CASOS_DE_TESTE.txt` anteriormente citado no README não
está presente na pasta atual e não será incluído; pendência da entrega em TXT.

### Refatoração — cy.readCsvFixture(fixtureName)

Extraída a preparação repetida dos três Given inválidos para `commands/upload.js`.
O novo command lê a fixture da questão em UTF-8 e retorna `{ contents, fileName }`,
preservando o conteúdo e acrescentando UUID ao nome de upload. Não cria alias
nem contém asserções. Os steps mantêm todas as verificações da massa e retornam
o objeto em `.then()` antes de `.as('csvFile')`, sem `cy.wrap()` repetido.
`cy.uploadCsv()`, When/Then, geração dos válidos, feature, configuração,
dependências e fixtures preservados. README atualizado.

Comando executado: `env -u ELECTRON_RUN_AS_NODE npm run test:parte3`.
Resultado no serviço real: 6 passaram, zero falhas, pendentes ou ignorados;
saída 0. Cypress 16.2.1, Electron 146 headless e Node.js 24.22.0; duração
aproximada de um minuto. Os nomes com UUID e as mesmas asserções de conteúdo,
HTTP 200, título e nome correspondente foram preservados.
SHA-256 dos quatro arquivos permaneceu idêntico antes/depois da execução;
fixture vazia continua com zero bytes. `git diff --check` passou.
Para revisão manual: `npm run test:open -- --env tags="@csvInvalido"`;
conferir preparação pelo novo command, asserções nos steps e confirmação real.
Refatoração aguardando validação do usuário.

### CSV-05 e CSV-06 — implementação autorizada dos casos restantes

O usuário aprovou o avanço após CSV-04 e solicitou implementar os demais casos
de `@csvInvalido`, autorizando CSV-05 e CSV-06 neste ciclo. CSV-04 aprovado.
Criadas fixtures físicas `corrompido.csv` (aspas sem fechamento) e `invalido.csv`
(estrutura correta, email inválido e idade negativa), no diretório da questão.
Steps específicos em `specs/csv-upload.cy.js` leem esses arquivos com
`cy.readFile()` em UTF-8, qualificam o defeito e enviam conteúdo sem transformação.
Nomes recebem UUID para evitar colisões; fixtures não são reescritas ou excluídas.

CSV-05 verifica cabeçalho esperado e um registro com aspas abertas sem fechamento.
CSV-06 verifica cabeçalho, um registro com quatro campos sem aspas, nome/cidade
presentes, email malformado e idade inteira negativa. São verificações das massas
controladas, não um parser ou validador genérico implementado pelo teste.
Reutilizados command e Then existentes: POST real 200, `File Uploaded!` e nome
correspondente. Gerador de válidos, feature, seletores e configuração preservados.
Nenhuma nova dependência ou simulação. Casos TXT e README atualizados.

Comando executado: `env -u ELECTRON_RUN_AS_NODE npm run test:parte3`.
Resultado no serviço real: 6 passaram (CSV-01 a CSV-06), zero falhas,
pendentes ou ignorados; saída 0. Cypress 16.2.1, Electron 146 headless,
Node.js 24.22.0. Duração aproximada: um minuto; CSV-03 levou cerca de 53 segundos.
Nenhuma espera fixa ou relaxamento das asserções foi introduzido.
SHA-256 dos quatro arquivos permaneceu idêntico antes/depois da execução;
fixture vazia continua com zero bytes. `git diff --check` passou.

Revisão manual: `npm run test:open -- --env tags="@csvInvalido"`.
Abrir `csv-upload.feature`, conferir as três leituras de fixtures e os defeitos
de cada massa antes do envio; verificar POST 200, título e nome correspondente
em todos. CSV-05 e CSV-06 aguardam revisão, execução manual e aprovação explícita.
Isso comprova recebimento, não validação ou importação dos dados pelo serviço.

### Correção da execução headless após mudança para cypress/

Reproduzidos dois erros de configuração:
- `npm run test:parte3 -- --env tags="@CSV-01"`: saída 1, nenhuma spec
  encontrada porque o script ainda buscava `parte3-arquivos/` na raiz.
- Execução direta no caminho atual: saída 3, três falhas de step ausente,
  pois a configuração buscava `.cy.js` em vez do `.spec.js` existente.
  A tag temporária `@only` no esquema válido selecionava os três exemplos,
  mesmo com filtro `@CSV-01`; nenhuma requisição de upload ocorreu nessas falhas.

Corrigidos caminho do script e condição de resolução dos steps para
`cypress/parte3-arquivos/`. Removido `@only`, preservando os cenários e tags
individuais. Nenhum gerador, command ou asserção de negócio foi alterado.
README atualizado para a estrutura atual. Casos inválidos ainda sem steps:
uma execução sem filtro não deve ser interpretada como suíte concluída.

Verificação após correção, Cypress 16.2.1, Electron 146 headless e Node 24.22.0:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte3 -- --env tags="@CSV-01"
env -u ELECTRON_RUN_AS_NODE npm run test:parte1
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="not @skip"
```

Resultados: CSV-01 com 1 passando; Parte 1 com 5 passando; Parte 2 com
10 passando. Todas com saída 0, sem falhas, pendentes ou ignorados nas seleções.
Asserções preservadas. Sintaxe da configuração, JSON do package e
git diff --check passaram. Nenhum cenário seguinte implementado neste ajuste.

Alvo real: https://the-internet.herokuapp.com/upload. Sem simulação.
Upload confirma recebimento, não importação ou validação das linhas.
Todos os casos: Quando solicita o envio do arquivo; Então recebe confirmação
identificando o arquivo enviado. Casos inválidos caracterizam a limitação do
serviço, conforme código público consultado, a confirmar durante sua execução.

| Ordem / ID | Requisito 3.1 | Objetivo / Dado | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| 1 / CSV-01 | 1 pequeno, 2 e 4 | Enviar CSV válido com 10 registros | Upload confirmado com nome exato | Aguardando validação do usuário |
| 2 / CSV-02 | 1 médio, 2 e 4 | Enviar CSV válido com 100 registros | Upload confirmado com nome exato | Passou na regressão; aguardando validação do usuário |
| 3 / CSV-03 | 1 grande, 2 e 4 | Enviar CSV válido com 1.000 registros | Upload confirmado com nome exato | Passou na regressão; aguardando validação do usuário |
| 4 / CSV-04 | 3 vazio | Enviar CSV vazio, zero bytes | Upload confirmado apesar de vazio | Aprovado pelo usuário ao autorizar os demais |
| 5 / CSV-05 | 3 formato incorreto | Enviar CSV com aspas sem fechamento | Upload confirmado apesar da estrutura corrompida | Aguardando validação do usuário |
| 6 / CSV-06 | 3 dados malformados | Enviar CSV com email inválido e idade negativa | Upload confirmado apesar dos dados inválidos | Aguardando validação do usuário |

Primeiro escrever os cenários na feature e aguardar revisão e aprovação
explícita antes de implementar código. O usuário aprovou os dois esquemas e
seus seis exemplos. Essa aprovação refere-se aos cenários, não à validação
manual da automação. Implementar um caso por ciclo, executar e aguardar revisão,
execução manual e aprovação explícita antes do seguinte. Para CSV-05 e CSV-06,
o usuário autorizou a implementação dos dois restantes neste ciclo. As quatro
fixtures físicas estão disponíveis; respostas 3.1.a e 3.1.b disponíveis em
`cypress/parte3-arquivos/questao3.1/RESPOSTA_TEORICA.md`, aguardando revisão.
3.1.a abordará reconciliação por identificador/conteúdo e contagens;
3.1.b abordará erros por linha/campo, duplicatas, relacionamentos e atomicidade.
Sem regras de importação implementadas neste alvo, essa estratégia será teórica.

### CSV-04 — fixture vazia e upload real

Após revisão da feature e autorização do usuário para iniciar `@csvInvalido`,
implementado somente CSV-04, conforme ciclo individual. Novo Given específico
em `specs/csv-upload.cy.js` lê a fixture por caminho relativo à raiz, exige
conteúdo vazio e zero bytes, cria nome único e reutiliza command/Then existentes.
Sem alterações no gerador, configuração, cenários válidos ou suas asserções.

Criados `fixtures/vazio.csv` (zero bytes) e `fixtures/valido.csv` (cabeçalho e
dois registros sintéticos). Arquivos são exemplos físicos da entrega, permanecem
no repositório e não são reescritos/excluídos pelos testes. Os inválidos usam
essas massas físicas; volumes válidos continuam com geração dinâmica em memória.
CSV-05/CSV-06 e respectivas fixtures não foram implementados neste ciclo.

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte3 -- --env tags="@CSV-04"
```

Resultado real: 1 passou, zero falhas, pendentes ou ignorados; saída 0.
Cypress 16.2.1, Electron 146 headless, Node.js 24.22.0. Comprovados POST 200,
`File Uploaded!` e nome exato do arquivo vazio. Conferência local também confirmou
zero bytes na fixture vazia e duas linhas de dados sintéticos no exemplo válido.
Sucesso comprova recebimento, não importação nem validação de dados pelo alvo.

Revisão manual: `npm run test:open -- --env tags="@CSV-04"`; abrir a feature,
conferir leitura da fixture, zero bytes, POST real 200, título e nome correspondente.
CSV-04 aguarda revisão, execução manual e aprovação explícita antes de CSV-05.

Regressão do arquivo de steps: executado
`env -u ELECTRON_RUN_AS_NODE npm run test:parte3 -- --env tags="@CSV-01"`.
Resultado: 1 passou, zero falhas, pendentes ou ignorados; saída 0.
`git diff --check` passou; fixture vazia permaneceu com zero bytes após o upload.

### CSV-01 — implementação e resultado em 07/11/2026

Revalidação após aprovação dos esquemas: preservada a estrutura reorganizada
pelo usuário (`feature/`, `specs/`, `commands/`, `utils/` e `elements.js`).
Corrigidos import dos seletores no spec e descoberta das features/steps.
Cada exemplo recebeu tag própria em seu grupo de Exemplos; mesmos textos,
mesmos seis casos. Isso permite executar somente CSV-01 sem rodar os demais.
Gerador e command existentes preservados; nenhum step de dados inválidos criado.

Executado novamente:
`env -u ELECTRON_RUN_AS_NODE npm run test:parte3 -- --env tags="@CSV-01"`.
Resultado: somente CSV-01, 1 passou; zero falhas, pendentes ou ignorados,
saída 0. Cypress 16.2.1, Electron 146 headless, Node.js 24.22.0.
Parser Gherkin confirmou seis exemplos e tags individuais, incluindo isolamento
de CSV-01. Sintaxe da configuração e git diff --check passaram.
Regressão repetida após correção dos caminhos: Parte 1 (`npm run test:parte1`),
5 passaram; Parte 2 (`npm run test:parte2 -- --env tags="not @skip"`),
10 passaram. Ambos com prefixo `env -u ELECTRON_RUN_AS_NODE`, saída 0,
zero falhas, pendentes ou ignorados nas seleções.
CSV-01 aguarda validação manual e aprovação explícita antes do próximo caso.

Histórico da implementação inicial (antes da revisão dos esquemas):

Feature e steps adjacentes em `parte3-arquivos/questao3.1/testes/`.
Gerador usa dados sintéticos variáveis e emails distintos, sem dependência nova.
Antes do envio, confere cabeçalho, 10 registros sem contar cabeçalho e conteúdo
de cada registro. Command seleciona arquivo em memória; intercept observa
POST real, sem mock. Steps exigem 200, título de sucesso e nome exato visível.
IDs existentes são fallback por ausência de data-test; seletores isolados.
A configuração resolve steps adjacentes somente para a Parte 3; partes 1 e 2
mantêm a resolução anterior. Scripts existentes preservados.

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte3 -- --env tags="@CSV-01"
```

Resultado: 1 passou, zero falhas, pendentes ou ignorados; saída 0.
Cypress 16.2.1, Electron 146 headless, Node.js 24.22.0. A tentativa no sandbox
encerrou com código 133 antes de iniciar o runner; execução fora dele passou.
Verificação direta do gerador passou: escape de vírgulas, aspas, CR/LF,
preservação UTF-8, quantidade 10, variação entre gerações e entrada inválida.
Sintaxe da configuração e git diff --check passaram.

Revisão manual: `npm run test:open -- --env tags="@CSV-01"`, abrir
`csv-upload.feature`; conferir massa de 10 registros, POST real 200,
`File Uploaded!` e mesmo nome selecionado. Reexecutar para conferir nova massa.
Casos detalhados em `parte3-arquivos/questao3.1/CASOS_DE_TESTE.txt`.
Comprova recebimento, não importação ou integridade do arquivo armazenado.
Sem limpeza remota pelo teste; retenção sob responsabilidade do serviço público.

CSV-01 aguarda revisão, execução manual e aprovação explícita do usuário.
CSV-02 não será iniciado antes desse checkpoint.

Regressão após ajuste compartilhado de configuração:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte1
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="not @skip"
```

Parte 1: 5 passaram. Parte 2: 10 passaram. Zero falhas, pendentes ou ignorados
nas seleções; saída 0 nas duas execuções. Nenhuma alteração nos cenários anteriores.

Regra: implementar um cenário, executar com sucesso e aguardar revisão,
execução manual e aprovação explícita do usuário antes de iniciar o próximo.
Os passos Dado/Quando/Então aprovados estão em
[api-1-rate-limiting.feature](cypress/parte1-api/questao1.1/feature/api-1-rate-limiting.feature).

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

Decisões de configuração: localizar os passos em `cypress/parte1-api/questao1.1/specs/`
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

## Parte 2 — E2E-04: avançar com dados válidos

CI anterior: execução bem-sucedida informada pelo usuário após push manual;
sem verificação independente dessa execução. Refatoração anterior do carrinho
autorizada para continuidade pelo usuário.
Estado E2E-04: revisado e aprovado explicitamente pelo usuário. Requisitos: Questão 2.1, dados dinâmicos, avanço
no checkout e limpeza após cada teste. Alvo: SauceDemo público, sem simulação.

- Dado: autenticação pelo step comum, Backpack e Bike Light no carrinho.
- Quando: gerar nome/sobrenome/CEP com Faker e informar na identificação.
- Então: revisão visível, URL correta, exatamente os produtos escolhidos, uma
  unidade de cada e preços iguais ao catálogo, sem depender da ordem.

Extraídos login e After para `Specs/common.steps.js`, importado diretamente
pelos dois specs. Hook restrito a `@cart or @dadosCheckout`; cache de sessão
preservado. Commands de checkout separados; seletores existentes reutilizados.
Gerador `fixtures/checkout-data.js` com Faker 10.5.0 pt_BR, sem seed fixa.
Ajustado requisito Node 22 para 22.13+; Node 24 da CI preservado. Dados sintéticos
podem se repetir e CEP não comprova existência postal. Apenas E2E-04 habilitado
na feature; E2E-05 e seus três exemplos continuam ignorados, sem steps próprios.

### E2E-04 — resultados

Comandos efetivamente executados na versão final:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-04 and not @skip"
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="(@cart or @E2E-04) and not @skip"
```

- E2E-04 isolado: 1 passou, zero falhas, pendentes ou ignorados; saída 0.
- Regressão E2E-01 a E2E-04: 4 passaram, zero falhas, pendentes ou ignorados; saída 0.
- Cypress 16.2.1, Node.js 24.22.0 e Electron headless, SauceDemo real.
- Gerador Faker: 20 amostras com nomes não vazios e CEP de oito dígitos.
- Sintaxe JavaScript, Gherkin e `git diff --check` passaram. Os 14 casos foram
  preservados; E2E-05 mantém três exemplos ignorados.
- Login definido uma única vez em common.steps.js; ambos os specs importam
  esse módulo. Os quatro testes habilitados estão cobertos pelo hook After.

A feature de carrinho já utiliza `@cart` no estado atual do projeto, em vez de
`@carrinho`. Preservada essa escolha do usuário, adaptando hook e filtro de
regressão. O primeiro comando com filtro antigo selecionou apenas E2E-04 e não
foi contado como regressão; a execução corrigida acima confirmou os quatro casos.

Arquivos novos: common steps, spec de dados, commands de checkout e gerador Faker.
Alterados spec de carrinho para consumir o módulo comum, feature de dados,
manifesto/lockfile e documentação. Nenhuma configuração de descoberta ou workflow
foi alterada. Não valida totais, pagamento ou finalização nesta etapa.

Revisão manual:

```bash
npm run test:open -- --env tags="@E2E-04 and not @skip"
```

Abrir dados-checkout.feature, conferir preenchimento dos três dados gerados,
avanço para revisão, Backpack e Bike Light, quantidade 1 por produto e os preços
anunciados. E2E-04 aguarda aprovação explícita; nenhum exemplo de campo
obrigatório foi implementado.

## Parte 2 — E2E-05: nome obrigatório

E2E-04 aprovado explicitamente pelo usuário. Estado E2E-05/nome: aguardando revisão, execução manual e aprovação explícita do usuário.
Requisito: Questão 2.1, validação de identificação antes da revisão.
Alvo: SauceDemo público, sem simulação.

- Dado: autenticação compartilhada e produtos no carrinho pelo Contexto.
- Quando: gerar dados Faker e deixar somente firstName vazio antes de prosseguir.
- Então: erro exato `Error: First Name is required`, permanência na identificação
  e ausência do resumo.

Mantido esquema com tag @E2E-05 e três exemplos em dois blocos: nome habilitado
com @nomeObrigatorio; sobrenome e CEP com @skip. Steps recusam explicitamente
campos ainda não implementados. Command ajustado somente para limpar e permitir
nome vazio, evitando type de string vazia. Demais campos preenchidos e conferidos;
sem novas dependências, seletores ou configuração. Limpeza compartilhada mantida.

### E2E-05/nome — resultados

Comandos executados:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-05 and @nomeObrigatorio and not @skip"
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="(@cart or @dadosCheckout) and not @skip"
```

Resultado no SauceDemo real, Cypress 16.2.1, Node.js 24.22.0, Electron headless:

- Nome obrigatório isolado: 1 passou; zero falhas, pendentes ou ignorados; saída 0.
- Regressão dos três cenários de carrinho, E2E-04 e E2E-05/nome: 5 passaram;
  zero falhas, pendentes ou ignorados; saída 0.
- Sintaxe JavaScript, Gherkin e `git diff --check` passaram. Preservados três
  exemplos com E2E-05 compartilhado; somente nome habilitado. Sobrenome e CEP
  excluídos por @skip não representam cobertura executada.

Alterados feature de dados, spec correspondente e command de checkout, além de
README e acompanhamento. Steps verificam mensagem específica, URL, identificação
visível e resumo ausente; o command confirma nome vazio e demais dados preenchidos.
Não implementado comportamento de sobrenome/CEP, nem modificado login ou limpeza.

Revisão manual:

```bash
npm run test:open -- --env tags="@E2E-05 and @nomeObrigatorio and not @skip"
```

Abrir dados-checkout.feature. Conferir nome vazio, sobrenome e CEP preenchidos,
mensagem `Error: First Name is required` e permanência na identificação sem resumo.
Aguardar aprovação explícita antes de implementar o exemplo de sobrenome.

## E2E-05 — tabela única e três exemplos

O usuário pediu preservar a escrita original do esquema, com uma única tabela
contendo nome, sobrenome e CEP. Após esclarecer o impacto sobre a execução,
autorizou explicitamente implementar e validar os três exemplos neste ciclo,
como exceção à regra de um caso por vez. A feature já havia sido restaurada
pelo usuário e foi preservada sem alterações nesta etapa.
Estado: esquema revisado e aprovado explicitamente pelo usuário.

O spec mapeia campo de negócio para propriedade dos dados e mensagem específica.
Cada execução gera dados Faker e esvazia somente a propriedade indicada. O
command limpa e confere todos os campos, evitando type de string vazia.
Asserções mantidas nos steps: erro visível/exato, URL da identificação,
formulário visível e resumo ausente. Sessão e limpeza preservadas.

### E2E-05 — resultados dos três exemplos

Comandos executados:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-05 and not @skip"
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="(@cart or @dadosCheckout) and not @skip"
```

- E2E-05: 3 passaram, zero falhas, pendentes ou ignorados; saída 0.
- Regressão Parte 2 habilitada: 7 passaram, zero falhas, pendentes ou ignorados; saída 0.
- Cypress 16.2.1, Node.js 24.22.0, Electron headless, SauceDemo real.
- Sintaxe JavaScript, Gherkin e `git diff --check` passaram. Uma única tabela
  contém nome, sobrenome e CEP, todos com E2E-05 e sem skip.

Alterados spec de dados e command de checkout, README e acompanhamento. Feature
original do usuário preservada nesta etapa. Mensagens exatas verificadas:
First Name is required, Last Name is required e Postal Code is required, todas
com prefixo Error:. Para cada caso, somente o campo indicado fica vazio; demais
dados gerados por Faker são preenchidos e conferidos antes de prosseguir.

Revisão manual:

```bash
npm run test:open -- --env tags="@E2E-05 and not @skip"
```

Abrir dados-checkout.feature e conferir os três exemplos, campos vazios,
mensagens específicas e bloqueio do avanço. Aguardar aprovação explícita
do esquema antes de iniciar outro cenário.

## Parte 2 — E2E-08: revisão de valores, pagamento e entrega

E2E-05 revisado e aprovado explicitamente pelo usuário. Estado E2E-08: aguardando revisão, execução manual e aprovação explícita do usuário.
Requisito: Questão 2.1, revisão da compra. SauceDemo público, sem simulação.

- Dado: cliente autenticado; Backpack e Bike Light, uma unidade de cada, com
  preços do catálogo comparados à fixture; identificação com Faker.
- Quando: revisa o pedido antes de concluir.
- Então: produtos e quantidades corretos; subtotal, imposto e total calculados
  independentemente; cartão e entrega com textos exatos.

Fixture: Backpack 2999 centavos; Bike Light 999; taxa 800 pontos-base (8%),
expectativa explícita desta massa e não regra fiscal geral; pagamento SauceCard
#31337; entrega Free Pony Express Delivery!, gratuita. Totais esperados:
subtotal 3998, imposto 320 e total 4318 centavos.

Helper puro calcula preço × quantidade, imposto com arredondamento ao centavo
mais próximo (meio centavo para cima) e total, usando centavos e pontos-base.
Não usa valores obtidos da tela. Comparações visíveis nos steps; commands já
existentes reutilizados. Hook de limpeza ampliado para @pagamentoConfirmacao.
Apenas E2E-08 habilitado nessa feature; E2E-09, E2E-10 e PAG-01 seguem com skip.
Não finaliza compra, simula cobrança ou comprova persistência financeira em backend.

### E2E-08 — resultados

Comandos executados:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-08 and not @skip"
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="(@parte2 or @cart) and not @skip"
```

O comando sem `not @skip` foi intencionalmente omitido para não executar casos
ainda planejados ou indisponíveis no alvo público.

- E2E-08 isolado: 1 passou, zero falhas, pendentes ou ignorados; saída 0.
- Regressão Parte 2 habilitada: 8 passaram, zero falhas, pendentes ou ignorados; saída 0.
- Cypress 16.2.1, Node.js 24.22.0, Electron headless, SauceDemo real.
- Helper verificado diretamente com assert estrito: compra esperada
  (3998/320/4318 centavos), 5 centavos a 10% (meio centavo → 1), 4 centavos a
  10% (abaixo de meio → 0), três unidades de 10 centavos sem imposto
  (subtotal/total 30) e formatação de 320 como $3.20. Todos passaram.
- Sintaxe JavaScript, Gherkin e `git diff --check` passaram; 14 casos preservados,
  oito habilitados e todos cobertos pelo hook compartilhado.

Arquivos novos: fixture review-order.js, helper utils/order-totals.js e spec
pagamento-confirmacao.cy.js. Alterados feature, seletor de entrega, hook comum,
README e acompanhamento. Nenhuma configuração, dependência ou cenário posterior
implementado. Valores esperados não são derivados do resumo exibido.

Revisão manual:

```bash
npm run test:open -- --env tags="@E2E-08 and not @skip"
```

Abrir pagamento-confirmacao.feature e conferir Backpack e Bike Light, uma
unidade por produto, preços $29.99/$9.99, subtotal $39.98, imposto $3.20, total
$43.18, SauceCard #31337 e Free Pony Express Delivery!. O cenário termina
na revisão. Aguardar aprovação explícita antes de implementar E2E-09.

## Refatoração E2E-08 — listas de produtos

Usuário autorizou encapsular inclusão e validação de listas em commands e
escolheu três produtos para demonstrar mais de dois. Estado: aguardando revisão
e aprovação explícita da refatoração.
Resultados anteriores com dois produtos preservados como histórico.

- `cy.addProductsToCart(items)` valida lista não vazia, nomes distintos e
  quantidade 1; reutiliza inclusão individual e confere nome/preço no catálogo.
- `cy.validateProducts(items)` verifica conjunto exato de produtos, quantidade
  de itens, quantidades e preços por produto, sem depender da ordem.
- Given alterado para mais de um produto distinto, com verificação da massa
  e chamada do command. Then de produtos delega a validação reutilizável.
- Fixture atual: Backpack 2999, Bike Light 999 e Bolt T-Shirt 1599 centavos,
  quantidade 1 por produto. Subtotal 5597, imposto 448 e total 6045 centavos,
  calculados pelo helper existente sem alterações; cartão e entrega preservados.

Sem novas dependências, seletores, POM, configuração ou cenários habilitados.

### Listas de produtos — resultados

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-08 and not @skip"
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="(@parte2 or @cart) and not @skip"
```

- E2E-08 isolado com três produtos: 1 passou, zero falhas, pendentes ou ignorados; saída 0.
- Regressão dos oito testes habilitados: 8 passaram, zero falhas, pendentes ou ignorados; saída 0.
- Cypress 16.2.1, Node.js 24.22.0, Electron headless, SauceDemo real.
- Cálculo direto da nova fixture confirmado com assert estrito:
  subtotal 5597, imposto 448 e total 6045 centavos. Helper preservado.
- Sintaxe JavaScript, Gherkin e `git diff --check` passaram. Nenhum novo cenário habilitado.

Revisão manual: `npm run test:open -- --env tags="@E2E-08 and not @skip"`.
Abrir pagamento-confirmacao.feature e conferir três produtos distintos, uma
unidade de cada, preços $29.99/$9.99/$15.99, subtotal $55.97, imposto $4.48, total
$60.45, cartão e entrega gratuita. Aguardar aprovação antes de E2E-09.

## Verificação antes do commit — renomes em inglês

O usuário renomeou as features para checkout-data.feature, coupon.feature e
payment-confirmation.feature, com tag @CheckoutData na identificação. Preservados
os renomes; corrigido o spec de pagamento para payment-confirmation.cy.js,
conforme descoberta configurada. Hook compartilhado adaptado a @CheckoutData
para manter limpeza. README atualizado para nomes e tags atuais.

O filtro antigo (@parte2 or @cart) selecionou apenas quatro testes após os renomes;
essa execução não foi contada como regressão completa. Executado em seguida:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="not @skip"
```

Resultado final: 8 passaram, zero falhas, pendentes ou ignorados; saída 0.
Gherkin e associação feature/spec conferidos: 14 casos, oito habilitados e todos
cobertos pela limpeza. git diff --check passou. Sem implementação de E2E-09.
Commit solicitado pelo usuário; excluídos AGENTS.md, desafio.md, credenciais
locais e artefatos Playwright, conforme decisão anterior.

## E2E-09 — cancelar na revisão preservando o carrinho

Estado: aguardando validação e aprovação explícita do usuário.
Alvo: SauceDemo público, sem simulação. Questão 2.1, alternativa de cancelamento.

- Dado um pedido em revisão com os três produtos de review-order e dados Faker,
  validar produtos, quantidades e preços antes da ação.
- Quando cancelar, reutilizar cy.cancelCheckout(), com seletor existente e
  espera por catálogo visível, sem espera fixa.
- Então retornar a /inventory.html, sem resumo ou confirmação; conferir contagem
  e abrir carrinho para validar produtos exatos, quantidades e preços preservados.
- Autenticação por sessão e hook de limpeza compartilhado preservados, inclusive
  em falhas. Removido @skip somente de E2E-09; alterações manuais preservadas.

### Execuções reais

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-09 and not @skip"
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="not @skip"
```

- Isolado: 1 passou; zero falhas, pendentes ou ignorados; saída 0.
- Regressão: 9 passaram (carrinho 3, identificação 4, revisão/cancelamento 2);
  zero falhas, pendentes ou ignorados; saída 0.
- Cypress 16.2.1, Electron 146 headless, Node.js 24.22.0.
- Sintaxe JavaScript e Gherkin conferidas: 14 casos preservados, nove habilitados,
  todos com autenticação herdada e tags abrangidas pela limpeza compartilhada.
- git diff --check passou. Casos com @skip não contam como cobertura executada.

### Revisão manual

```bash
npm run test:open -- --env tags="@E2E-09 and not @skip"
```

Abrir payment-confirmation.feature. Conferir três produtos na revisão, cancelar,
verificar retorno ao catálogo e ausência de confirmação; conferir carrinho com
Backpack, Bike Light e Bolt T-Shirt, quantidade 1 e preços $29.99, $9.99 e $15.99.
A ausência de confirmação na interface não comprova estado de pedido em backend.
Aguardar aprovação explícita antes de implementar E2E-10.

### Refatoração E2E-09 — ausência de confirmação

Conforme pedido do usuário, as quatro verificações de ausência de resumo,
conclusão, título e mensagem foram movidas para cy.validateNoOrderConfirmation()
em commands/checkout.js. O Then chama somente o command; seletores e condições
preservados. Estado: aguardando revisão do usuário.

Reexecutados os mesmos comandos de validação do E2E-09: isolado com 1 passando
e regressão com 9 passando, zero falhas, pendentes ou ignorados; saída 0 em ambos.
Sintaxe dos dois arquivos JavaScript e git diff --check passaram.

## E2E-10 — confirmar compra completa de produtos

E2E-09 e sua refatoração: aprovados pelo usuário ao autorizar o prosseguimento
e a implementação deste plano. Histórico das execuções anteriores preservado.
E2E-10: aguardando validação e aprovação explícita do usuário.
Questão 2.1: fluxo completo, dados dinâmicos, confirmação e limpeza.
Alvo: SauceDemo público, sem simulação.

- Dado cliente autenticado por sessão com os três produtos distintos da fixture.
- Quando realiza a compra, gerar dados Faker, iniciar identificação e avançar;
  conferir revisão visível, URL e produtos antes de finalizar.
- Então validar URL /checkout-complete.html, conclusão visível e textos exatos:
  Thank you for your order!
  Your order has been dispatched, and will arrive just as fast as the pony can get there!
- Depois verificar ausência da contagem, abrir carrinho e confirmar que não há
  produtos. A confirmação é validada antes dessa navegação.
- Commands finishCheckout e validateOrderConfirmation usam seletores existentes.
  Sessão e limpeza compartilhadas preservadas; E2E-08 mantém cálculos detalhados.
- Título atualizado para produtos, sem restringir a dois. Removido @skip somente
  de E2E-10; cupom e recusa financeira continuam documentais e ignorados.

### Execuções reais

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="@E2E-10 and not @skip"
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="not @skip"
```

- Isolado: 1 passou; zero falhas, pendentes ou ignorados; saída 0.
- Regressão: 10 passaram (carrinho 3, identificação 4, revisão/conclusão 3);
  zero falhas, pendentes ou ignorados; saída 0.
- Cypress 16.2.1, Electron 146 headless, Node.js 24.22.0.
- Sintaxe JavaScript e Gherkin conferidas: 14 casos preservados, dez habilitados,
  todos com autenticação herdada e tags abrangidas pela limpeza compartilhada.
- git diff --check passou. Casos ignorados não contam como cobertura executada.

### Revisão manual

```bash
npm run test:open -- --env tags="@E2E-10 and not @skip"
```

Abrir payment-confirmation.feature. Conferir dados gerados, Backpack, Bike Light
e Bolt T-Shirt na revisão, confirmação após finalizar e carrinho vazio.
Confirmação limitada à interface: não comprova cobrança, envio ou pedido em backend.
Aguardar aprovação explícita antes de outra implementação.


## Encerramento do ciclo da Parte 2 — aprovação do usuário

Usuário revisou e aprovou E2E-10 e autorizou commit e push. E2E-10 aprovado;
trabalho da Parte 2 encerrado por ora, preservando limitações documentadas.

Revisão final preservou mudanças manuais: step de carrinho vazio delega a
cy.emptyCart(), feature usa @paymentConfirmation e inclui proposta documental
ignorada para múltiplas unidades do mesmo produto. Corrigida grafia Cenário
para compilação Gherkin e ajustado hook compartilhado à tag atual, garantindo
limpeza também nos três cenários de revisão/conclusão. Removida linha vazia
extra ao final de cart.js. Nenhum novo cenário foi habilitado.

Sintaxe JavaScript e Gherkin conferidas: 15 casos no catálogo, dez habilitados,
cinco ignorados. Autenticação herdada e tags do hook conferidas; ignorados não
contam como cobertura executada. Histórico anterior de 14 casos preservado.

Verificação final antes do commit:

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="not @skip"
```

Resultado: 10 passaram, zero falhas, pendentes ou ignorados na seleção; saída 0.
Cypress 16.2.1, Electron 146 headless, Node.js 24.22.0. git diff --check passou.
Commit inclui somente implementação e documentação revisadas; excluídos
AGENTS.md, desafio.md, .playwright-mcp/ e credenciais locais ignoradas.

## Reorganização da Parte 1 — questao1.1

Preservada a estrutura movida pelo usuário para cypress/parte1-api/questao1.1/.
Corrigidos require do servidor de simulação na configuração, script test:parte1
e referências de documentação. A descoberta das features já havia sido ajustada
pelo usuário; resolução dos steps por feature preservada. Imports relativos de
specs, helpers e mocks conferidos: todos resolvidos, sem alteração necessária.

```bash
env -u ELECTRON_RUN_AS_NODE npm run test:parte1
env -u ELECTRON_RUN_AS_NODE npm run test:parte2 -- --env tags="not @skip"
```

Resultados: Parte 1 com 5 passando; Parte 2 com 10 passando. Zero falhas,
pendentes ou ignorados nas seleções; saída 0 em ambas. Cypress 16.2.1,
Electron headless, Node.js 24.22.0. Sintaxe da configuração e git diff --check
passaram. Sem alteração de regras ou novos cenários.
