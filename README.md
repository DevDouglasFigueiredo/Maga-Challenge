# Teste QA Sênior - Magazord

Projeto de testes de API, checkout e upload de arquivos para o desafio Magazord. As partes práticas usam Cypress, JavaScript e cenários BDD em português.

As Partes 4 e 5 contêm respostas teóricas sobre [automação mobile](parte4-mobile/questao4.1/RESPOSTA_TEORICA.md) e [mocks de APIs externas](parte5-mocks/questao5.1/RESPOSTA_TEORICA.md). Não exigem instalação de ferramentas mobile nem execução de testes.

## Tecnologias

- Node.js 24 e npm, conforme o ambiente da CI.
- Cypress 16.2.1.
- Cucumber com `@badeball/cypress-cucumber-preprocessor`.
- esbuild, Faker e `cypress-plugin-api`.
- Docker para execução em container local e na CI; Docker Compose v2 para simplificar execução local.

As versões das dependências estão em [package.json](package.json) e [package-lock.json](package-lock.json).

## Pré-requisitos

Para executar com Docker, instale Docker Engine ou Docker Desktop com containers Linux e Docker Compose v2. Configure as credenciais conforme a seção [Configuração](#configuração) e execute `docker compose up`. Node.js, npm e Chrome são instalados na imagem; os passos de instalação no host abaixo são dispensáveis. Veja [Execução com Docker Compose](#execução-com-docker-compose).

Para executar diretamente no host, instale Node.js 24 com npm. O manifesto também aceita as versões de Node.js especificadas em `engines`. Ambas as formas precisam de internet para baixar dependências e consultar serviços públicos.

O Electron acompanha o Cypress e é usado por padrão na execução headless. Para executar com `--browser chrome`, instale o Google Chrome no sistema antes de iniciar os testes. No Linux, confira também as [dependências de sistema do Cypress](https://docs.cypress.io/app/get-started/install-cypress#Linux-Prerequisites).

## Instalação

Na raiz do projeto:

```bash
npm ci
npx cypress verify
```

O lockfile já está versionado; `npm ci` instala as versões registradas nele. Como alternativa prevista no desafio:

```bash
npm install
```

O Cypress é instalado pelas dependências do projeto; não é necessária instalação global. Para conferir os navegadores detectados:

```bash
npx cypress info
```

## Configuração

Crie a configuração local a partir do exemplo, caso ainda não tenha esse arquivo:

```bash
cp cypress.env.example cypress.env.json
```

Preencha os valores conforme os testes que pretende executar. Se o arquivo já existir, preserve as configurações presentes.

| Variável | Uso | Necessária para |
| --- | --- | --- |
| `GITHUB_TOKEN` | Token pessoal GitHub válido, com a cota padrão esperada pelo teste | Parte 1: `@API-02` |
| `REQRES_API_KEY` | Chave de API válida do ReqRes | Parte 1: `@API-07` |
| `REQRES_EMAIL` | Email de login indicado no desafio | Parte 1: `@API-07` |
| `REQRES_PASSWORD` | Senha correspondente ao login do ReqRes | Parte 1: `@API-07` |
| `SAUCEDEMO_USERNAME` | Usuário de demonstração do SauceDemo indicado no desafio | Parte 2 |
| `SAUCEDEMO_PASSWORD` | Senha correspondente ao usuário do SauceDemo | Parte 2 |

`@API-01` não exige credenciais; `@API-03` e `@API-08` usam simulações locais. A Parte 3 não exige credenciais. Para executar todas as partes, preencha as seis variáveis.

`cypress.env.json` é ignorado pelo Git. Também é possível fornecer as mesmas variáveis pelo ambiente com o prefixo `CYPRESS_`, por exemplo, `CYPRESS_GITHUB_TOKEN`. Arquivos `.env` não são carregados automaticamente. Não versione credenciais.

## Execução dos testes

### Todos os testes

```bash
npm test
```

Para executar somente os cenários implementados, excluindo as propostas documentais marcadas com `@skip`:

```bash
npm test -- --env tags="not @skip"
```

### Por parte

```bash
npm run test:parte1
npm run test:parte2 -- --env tags="not @skip"
npm run test:parte3
```

O comando `npm run test:parte2` também está disponível; sem filtro, inclui as propostas com `@skip` como cenários ignorados. As Partes 4 e 5 são teóricas e não possuem scripts de execução.

### Interface interativa

```bash
npm run test:open -- --env tags="not @skip"
```

Selecione **E2E Testing**, escolha um navegador e abra a feature desejada. Para aplicar uma configuração alterada, reinicie o Cypress. Ao trocar credenciais durante a mesma sessão interativa, limpe as sessões salvas pelo runner.

### Filtros por cenário ou grupo

```bash
npm run test:parte1 -- --env tags="@API-08"
npm run test:parte2 -- --env tags="@E2E-10"
npm run test:parte3 -- --env tags="@csvInvalido"
npm run test:open -- --env tags="@CSV-01"
```

Os identificadores e grupos disponíveis estão nas próprias features. Na Parte 3, `@csvValido` seleciona os volumes de 10, 100 e 1.000 registros; `@csvInvalido` seleciona vazio, formato incorreto e dados malformados. Não deixe a tag temporária `@only` nas features, pois ela sobrepõe a seleção por tags no preprocessor instalado.

### Navegador e integração contínua

Para usar Chrome instalado localmente:

```bash
npm test -- --browser chrome --env tags="not @skip"
```

Esse é o comando padrão da imagem Docker usada pela [CI](.github/workflows/tests.yml). O runner Ubuntu 24.04 constrói a imagem para `linux/amd64`; Node.js 24, Chrome e dependências dos testes executam dentro dela. As credenciais são fornecidas por secrets do repositório; o secret do token GitHub se chama `GH_API_TOKEN` e é exposto ao processo como `CYPRESS_GITHUB_TOKEN`. Os demais secrets têm os nomes das variáveis da tabela, sem o prefixo `CYPRESS_`.

## Execução com Docker Compose

Na primeira utilização, crie `cypress.env.json` a partir de `cypress.env.example`, caso o arquivo ainda não exista, e preencha as seis credenciais da seção [Configuração](#configuração). Preserve o arquivo já configurado em execuções seguintes.

Com Docker Compose v2 instalado e credenciais preenchidas, basta executar na raiz:

```bash
docker compose up
```

Na primeira execução, [compose.yml](compose.yml) constrói a imagem definida no [Dockerfile](Dockerfile) e instala dependências automaticamente. O serviço `tests` executa os cenários implementados das Partes 1, 2 e 3 em Chrome headless e encerra ao terminar; as cinco propostas `@skip` ficam excluídas. As Partes 4 e 5 são somente documentos. A configuração local já existente é montada somente para leitura; credenciais continuam fora da imagem. Não é necessário criar `.env.docker` para usar Compose. Sem `cypress.env.json`, a execução falha em vez de criar uma pasta no lugar do arquivo.

Depois de alterar código ou dependências, reconstrua:

```bash
docker compose up --build
```

Para obter no terminal o código de saída dos testes, use:

```bash
docker compose up --build --exit-code-from tests
```

Validação local: `docker compose up --exit-code-from tests` construiu a imagem automaticamente e executou 21 testes com sucesso, saída 0. Montagem somente para leitura e memória compartilhada de 2 GiB conferidas. Log sanitizado em `artifacts/docker-compose.log`.

Para remover container e rede criados pelo Compose:

```bash
docker compose down
```

## Execução com Docker

Requer Docker Engine ou Docker Desktop com containers Linux e acesso ao daemon. Node.js e navegadores no host são dispensáveis. Build e testes reais precisam de internet. Referência suportada: `linux/amd64`, mesma arquitetura da CI; outras arquiteturas podem exigir emulação e não foram homologadas.

```bash
docker build --platform linux/amd64 --tag desafio-magazord:local .
docker run --rm --platform linux/amd64 desafio-magazord:local npx cypress info
```

O [Dockerfile](Dockerfile) fixa imagem oficial `cypress/browsers` por tag completa e digest: Node.js 24.22.1 e Chrome 156.0.8078.73. Cypress 16.2.1 e preprocessadores são instalados pelo lockfile com `npm ci --include=dev`. O build executa `cypress verify`; não instala pacotes na execução. Para atualizar a base, conferir tag e digest no registry e repetir as validações. Não trocar por `latest`.

Crie localmente `.env.docker` com os valores necessários, sem aspas e sem espaços em torno de `=`:

```dotenv
CYPRESS_GITHUB_TOKEN=
CYPRESS_REQRES_API_KEY=
CYPRESS_REQRES_EMAIL=
CYPRESS_REQRES_PASSWORD=
CYPRESS_SAUCEDEMO_USERNAME=
CYPRESS_SAUCEDEMO_PASSWORD=
```

Preencha as seis variáveis para a suíte completa. `.env.docker` é ignorado pelo Git e pelo contexto Docker. Não inclua credenciais em comandos de build. `cypress.env.json` local não entra na imagem; no container, use `--env-file` ou `--env NOME` para encaminhar variáveis já exportadas no terminal.

Executar suíte completa, com o comando padrão que exclui propostas `@skip`:

```bash
docker run --rm --platform linux/amd64 --shm-size=2g \
  --env-file .env.docker desafio-magazord:local
```

Executar por parte ou tag, substituindo o comando padrão:

```bash
docker run --rm --platform linux/amd64 --shm-size=2g --env-file .env.docker \
  desafio-magazord:local npm run test:parte1 -- --browser chrome

docker run --rm --platform linux/amd64 --shm-size=2g --env-file .env.docker \
  desafio-magazord:local npm run test:parte2 -- --browser chrome --env 'tags=not @skip'

docker run --rm --platform linux/amd64 --shm-size=2g \
  desafio-magazord:local npm run test:parte3 -- --browser chrome

docker run --rm --platform linux/amd64 --shm-size=2g \
  desafio-magazord:local npm run test:parte1 -- --browser chrome --env 'tags=@API-03 or @API-08'
```

Último comando executa somente simulações locais, sem credenciais ou chamadas aos serviços públicos. Servidor de simulação e Cypress ficam no mesmo container; nenhuma porta precisa ser publicada. A imagem atende execução headless; interface `cypress open` continua no host.

Para preservar screenshots de falhas, execute sem `--rm`, copie antes de remover o container e confira o código de saída:

```bash
docker run --name magazord-local --platform linux/amd64 --shm-size=2g \
  --env-file .env.docker desafio-magazord:local
# No terminal, anote a saída do docker run antes de executar outros comandos.
docker inspect --format '{{.State.ExitCode}}' magazord-local
mkdir -p artifacts
docker cp magazord-local:/e2e/cypress/screenshots artifacts/screenshots
docker rm magazord-local
```

A pasta de screenshots pode não existir quando não houve falha; nesse caso, `docker cp` informa ausência. Vídeos não estão habilitados. Evidências podem conter dados exibidos durante os testes; revise antes de compartilhar. Não monte o projeto inteiro em `/e2e`: isso esconderia as dependências instaladas na imagem.

### Pipeline e riscos operacionais

- A CI preserva execução em `push`, valida presença dos seis secrets sem imprimir valores e executa a mesma imagem local. Secret ausente ou teste com falha mantém o job vermelho; não há fallback automático para simulação.
- `GH_API_TOKEN` deve ser token pessoal válido com cota de 5.000 exigida pelo API-02. O token automático `GITHUB_TOKEN` do Actions normalmente tem cota de 1.000 por repositório e não é substituto nesse teste. [Limites oficiais](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).
- Bibliotecas Linux e Chrome vêm da [imagem oficial Cypress](https://github.com/cypress-io/cypress-docker-images). `--shm-size=2g` reduz risco de encerramento do navegador por pouca memória compartilhada; ainda é necessário recurso suficiente no host.
- A imagem oficial inclui outros navegadores além do Chrome e ocupa aproximadamente 4,94 GB locais nesta validação. Essa escolha evita manutenção manual das bibliotecas Linux; considere espaço e tempo de download no runner.
- O build atual apontou quatro ocorrências moderadas no `npm audit`, na árvore do preprocessor Cucumber (`glob`, `minimatch` e `mocha`, além do próprio preprocessor). Dependências preservadas; correção automática sugerida pelo npm envolve mudança incompatível de versão e exige avaliação separada.
- O job tem limite de 30 minutos para acomodar download e build frios. Indisponibilidade do Docker Hub, npm ou download do Cypress ainda pode interromper instalação. Mudanças somente nos testes reutilizam a camada de dependências quando existe cache Docker local.
- A CI coleta screenshots mesmo após falha, publica `cypress-screenshots` por sete dias quando existem arquivos e remove o container ao final. Falta de screenshot não transforma falha de teste em sucesso.
- Serviços GitHub, ReqRes, SauceDemo e Heroku continuam externos: expiração de credenciais, cotas, indisponibilidade e mudanças de comportamento podem quebrar testes. Docker estabiliza ambiente, sem garantir disponibilidade desses serviços.
- Parte 2 usa somente `specs/` em minúsculas. As cópias antigas `Specs/` precisam permanecer removidas no commit para evitar divergências em checkout Linux.
- Infraestrutura atende ao item de execução em container do checklist da avaliação. A entrega Docker não altera os cenários nem encerra a avaliação das demais entregas.

### Validação desta entrega — 08/11/2026

- Build inicial com instalação limpa via `npm ci --include=dev` e `cypress verify`: passou. Rebuild em snapshot limpo dos arquivos versionados existentes e das alterações propostas gerou a mesma imagem, sem `node_modules` ou credenciais locais.
- Versões dentro do container: Node.js 24.22.1, Chrome 156.0.8078.73 e Cypress 16.2.1. Conteúdo e histórico da imagem conferidos: nenhuma credencial local incorporada.
- Simulações `@API-03 or @API-08`: 2 passaram, saída 0.
- Comando padrão da imagem com as seis variáveis de ambiente: 21 passaram (API: 5; checkout: 10; CSV: 6), zero falhas, pendentes ou ignorados na seleção, saída 0. Cinco propostas `@skip` excluídas. Duração dos testes: aproximadamente 1 minuto e 29 segundos. Log local sanitizado em `artifacts/docker-suite.log`, ignorado pelo Git.
- Workflow validado com actionlint 1.7.12, ferramenta temporária fora das dependências do projeto. Preflight rejeitou secrets ausentes/em branco e aceitou valores preenchidos. Falha controlada manteve saída 7 após coleta de artefato sintético; comando inexistente retornou erro e limpeza funcionou também sem screenshots. Nenhum cenário ou asserção de negócio alterado.
- Execução remota no GitHub Actions ainda pendente: este workflow modificado precisa ser publicado por commit/push. Resultado local e análise estática não comprovam configuração dos secrets nem execução no runner remoto.

## Estrutura do projeto

```text
cypress/
├── support/             # Suporte compartilhado
├── parte1-api/questao1.1/
├── parte2-e2e/questao2.1/
└── parte3-arquivos/questao3.1/
parte4-mobile/
└── questao4.1/
    └── RESPOSTA_TEORICA.md
parte5-mocks/
└── questao5.1/
    └── RESPOSTA_TEORICA.md
compose.yml
Dockerfile
.dockerignore
.github/workflows/tests.yml
cypress.config.js
cypress.env.example
package.json
package-lock.json
README.md
PLANO_AUTOMACAO.md
```

Nas partes práticas, `feature/` contém os cenários e `specs/` contém os steps `.cy.js`. Commands, seletores, helpers, fixtures e simulações ficam nas respectivas questões, conforme a necessidade de cada suíte.

Respostas teóricas disponíveis:

- [Parte 1 — API](cypress/parte1-api/questao1.1/RESPOSTA_TEORICA.md).
- [Parte 2 — E2E](cypress/parte2-e2e/questao2.1/RESPOSTA_TEORICA.md).
- [Parte 3 — Arquivos](cypress/parte3-arquivos/questao3.1/RESPOSTA_TEORICA.md).
- [Parte 4 — Automação mobile](parte4-mobile/questao4.1/RESPOSTA_TEORICA.md).
- [Parte 5 — Mocks e integrações](parte5-mocks/questao5.1/RESPOSTA_TEORICA.md).

As Partes 4 e 5 ficam na raiz do projeto e não possuem scripts de execução. O entregável de casos de teste em DOCX, PDF ou TXT ainda não está disponível no projeto.

## Observações operacionais

- Os testes reais dependem da disponibilidade dos serviços públicos, das credenciais e da cota GitHub. Falhas externas não são substituídas automaticamente por mocks.
- Os cinco cenários `@skip` da Parte 2 são propostas documentais de cupons, compra de mais de uma unidade do mesmo produto e recusa financeira. Não representam cobertura executada. O filtro `not @skip` os exclui, como na CI.
- Na Parte 3, sucesso significa recebimento do arquivo. O alvo também confirma arquivos inválidos; isso não comprova importação de registros. Os uploads usam dados sintéticos; arquivos locais permanecem intactos e não há remoção remota pelo teste.
