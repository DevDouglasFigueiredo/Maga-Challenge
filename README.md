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
