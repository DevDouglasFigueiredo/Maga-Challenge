## 1.1.a) Como você estruturaria seus testes automatizados para validar que o rate limiting está funcionando corretamente, e como testaria o comportamento quando o limite é excedido?
- Para validar o rate limiting, eu estruturaria os testes automatizados da seguinte forma:
1. **Configuração Inicial**: Configuraria o ambiente de teste para garantir que a cota de consultas esteja disponível e que o limite de rate limiting seja conhecido (por exemplo, 60 consultas por hora para usuários não autenticados e 5000 consultas por hora para usuários autenticados).
2. **Testes de Consulta Dentro do Limite**: Criaria testes que realizassem consultas dentro do limite permitido, verificando se as respostas são bem-sucedidas e se os cabeçalhos de resposta indicam a quantidade restante de consultas e o momento de renovação da cota.
3. **Testes de Consulta Excedendo o Limite**: Criaria testes que realizassem consultas até atingir o limite e, em seguida, tentariam realizar uma consulta adicional para verificar se a resposta indica que o limite foi excedido (por exemplo, recebendo um status HTTP 403 e cabeçalhos indicando que a cota está esgotada).
4. **Testes de Comportamento Após Exceder o Limite**: Criaria testes que verificassem o comportamento do sistema após exceder o limite, como a resposta de erro apropriada e a informação de que não restam consultas na janela atual. Além disso, verificaria se o sistema informa corretamente o momento de renovação da cota para que o usuário saiba quando poderá realizar novas consultas.

## 1.1.b) Como você implementaria um mecanismo simples para obter e reutilizar um token de autenticação entre os testes, evitando fazer login a cada teste?

Centralizei a autenticação no comando `cy.reqresLogin()`, em
[`commands.js`](../../support/commands.js), usando `cy.session()` para salvar e
restaurar o estado de autenticação. Assim, cada teste pode chamar o comando
sem depender da execução de um teste anterior.

Na primeira chamada, o comando lê `REQRES_EMAIL`, `REQRES_PASSWORD` e
`REQRES_API_KEY` com `cy.env()`, realiza o login e verifica status 200 e token
não vazio. O token retornado é armazenado em um cookie de teste, restrito ao
domínio ReqRes, com `Secure`, `HttpOnly` e `SameSite=Strict`. Esse cookie é um
recurso do teste para permitir o cache do Cypress; não é um cookie de sessão
fornecido pelo ReqRes.

Nas chamadas seguintes com o mesmo identificador de sessão, o Cypress restaura
o cookie e executa `validate()`. Se a sessão restaurada não passar na validação,
o Cypress refaz o login. O comando retorna o token armazenado, que é passado a
`cy.reqresAuthenticatedRequest(path, token)` para compor o header
`Authorization: Bearer {token}`. A chave `x-api-key`, exigida pelo serviço,
é enviada separadamente e não substitui o token obtido no login.

As credenciais ficam no ambiente ou em `cypress.env.json`, ignorado pelo Git.
A leitura e as chamadas desabilitam os logs padrão, e o plugin mascara os
campos de credenciais. O identificador da sessão não contém dados sensíveis.
O cache fica limitado ao mesmo spec, sem `cacheAcrossSpecs`, e considera uma
única conta configurada por execução. Ao trocar credenciais no modo interativo,
é necessário limpar as sessões salvas.

O cenário API-09 exercita a restauração dentro de um único teste independente.
Limpa o cache antes da preparação, realiza login e uma primeira consulta,
remove o cookie ativo e confirma sua ausência. Ao chamar `cy.reqresLogin()`
novamente, verifica que o token original foi restaurado e enviado na nova
consulta. Um spy observa as chamadas reais de `cy.api()`, sem substituir
respostas, e a asserção exige exatamente um POST de login nas duas chamadas.
Comparar somente o token seria insuficiente, pois um novo login poderia
retornar o mesmo valor.

**Limitação da implementação:** `validate()` verifica apenas a presença de um
token não vazio. Como o endpoint clássico de usuários é público, uma resposta
200 não comprova que o token continua válido. Em uma API com recurso protegido,
eu validaria a sessão por um endpoint que realmente rejeitasse tokens expirados
ou revogados, permitindo ao `cy.session()` recriar a sessão quando necessário.
Não considero a simples presença do cookie uma validação de expiração.

## 1.1.c) Como você detectaria que um token expirou e trataria esse cenário no seu teste?

Detectaria a expiração pela resposta da API, considerando o status HTTP e
o motivo informado no corpo. Na simulação implementada, o helper
[`handleTokenExpiration(response, session)`](utils/token-helper.js) reconhece
a combinação de **status 401** com **`error: 'token_expired'`**. Um 401 isolado
não é suficiente para distinguir expiração de outras falhas de autenticação.

Ao reconhecer essa combinação, o helper retorna um novo estado com o token
descartado (`token: null`), `requiresAuthentication: true` e a mensagem
“Sua sessão expirou. Autentique-se novamente.” Para outras respostas, preserva
o estado recebido. O teste verifica a resposta HTTP e o resultado desse
tratamento, sem realizar um novo login automaticamente e esconder a recusa.

No API-08, a expiração é controlada por um servidor HTTP local e uma fixture
com token sintético e validade de dois minutos. Primeiro, confirmo uma consulta
200 antes do vencimento. Depois, avanço o relógio com `cy.clock()` e `cy.tick()`
até o instante exato de expiração, sem aguardar dois minutos reais. O horário
controlado é enviado ao servidor pelo parâmetro de simulação `now`, pois
`cy.clock()` não altera o relógio do processo Node.

A nova consulta usa `failOnStatusCode: false` para permitir a inspeção da
resposta 401. As asserções verificam status, código e mensagem de expiração,
descarte do token e indicação de nova autenticação.

**Limites:** esse cenário comprova o tratamento da expiração simulada, não
a expiração do token no ReqRes público. O estado tratado no API-08 é independente
do cookie e do cache de `cy.session()` usados no API-07 e no API-09; o helper não limpa esse
cache nem implementa renovação automática. Em uma integração com expiração real,
também seria necessário invalidar a credencial armazenada e validar a sessão
num recurso protegido antes de reutilizá-la.
