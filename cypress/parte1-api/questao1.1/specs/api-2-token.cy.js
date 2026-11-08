import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import tokenFixture from '../mocks/token-expiration-fixture';
import { handleTokenExpiration } from '../utils/token-helper';

Given('que possuo credenciais válidas no ReqRes', function () {
  this.userId = 2;
});

When('realizo login e consulto um usuário', function () {
  cy.reqresLogin().then((token) => {
    this.token = token;
    return cy.reqresAuthenticatedRequest(`/api/users/${this.userId}`, token)
      .as('reqresResponse');
  });
});

Then('recebo os dados do usuário solicitado', function () {
  cy.get('@reqresResponse', { log: false }).then(({ status, body, requestHeaders }) => {
    expect(status, 'consulta do usuário no ReqRes').to.equal(200);
    expect(body.data.id, 'identidade do usuário').to.equal(this.userId);
    const authorization = Object.entries(requestHeaders)
      .find(([name]) => name.toLowerCase() === 'authorization')?.[1];
    expect(authorization === `Bearer ${this.token}`,
      'consulta envia o mesmo token recebido no login').to.equal(true);
  });
});

Given('que já realizei uma consulta com autenticação válida', function () {
  this.userId = 2;
  cy.then(() => Cypress.session.clearAllSavedSessions());
  // Observa as chamadas reais, sem substituir respostas ou exibir credenciais.
  cy.spy(cy, 'api').log(false).as('reqresApiCalls');

  cy.reqresLogin().then((token) => {
    this.token = token;
    return cy.reqresAuthenticatedRequest(`/api/users/${this.userId}`, token);
  }).then(({ status, body }) => {
    expect(status, 'consulta antes da restauração').to.equal(200);
    expect(body.data.id, 'usuário antes da restauração').to.equal(this.userId);
  });
});

When('consulto novamente os dados de um usuário', function () {
  const cookieOptions = {
    domain: new URL(Cypress.expose('reqresBaseUrl')).hostname,
    log: false,
  };

  cy.clearCookie('reqres-test-token', cookieOptions);
  cy.getCookie('reqres-test-token', cookieOptions).should((cookie) => {
    expect(cookie === null, 'cookie ativo removido antes da restauração').to.equal(true);
  });

  cy.reqresLogin().then((token) => {
    this.restoredToken = token;
    return cy.reqresAuthenticatedRequest(`/api/users/${this.userId}`, token)
      .as('reqresResponse');
  });
});

Then('utilizo a autenticação original sem realizar novo login', function () {
  expect(this.restoredToken === this.token, 'cookie restaurado contém o token original')
    .to.equal(true);

  cy.get('@reqresApiCalls', { log: false }).then((apiCalls) => {
    const loginUrl = `${Cypress.expose('reqresBaseUrl')}/api/login`;
    const loginCount = apiCalls.getCalls().filter(({ args: [options] }) => {
      return options.method === 'POST' && options.url === loginUrl;
    }).length;

    expect(loginCount, 'somente o primeiro acesso realiza login').to.equal(1);
  });
});

Given('que possuo um token com validade simulada de {int} minutos', function (validityMinutes) {
  expect(validityMinutes, 'validade configurada para a simulação')
    .to.equal(tokenFixture.tokenValidityMinutes);
  this.session = {
    token: tokenFixture.token,
    requiresAuthentication: false,
    message: null,
  };
  this.tokenMockUrl = Cypress.expose('tokenExpirationMockUrl');
  expect(this.tokenMockUrl, 'endereço da simulação local')
    .to.match(/^http:\/\/127\.0\.0\.1:\d+$/);

  cy.clock(tokenFixture.tokenIssuedAt, ['Date']);
  cy.window({ log: false }).then((window) => {
    this.simulatedNow = window.Date.now();
    cy.api({
      method: 'GET',
      url: `${this.tokenMockUrl}/api/users/2`,
      qs: { now: this.simulatedNow },
      headers: { authorization: `Bearer ${this.session.token}` },
      failOnStatusCode: false,
      log: false,
    }).then(({ status, body }) => {
      expect(status, 'consulta antes da expiração').to.equal(200);
      expect(body.data.id, 'usuário antes da expiração').to.equal(2);
    });
  });
});

Given('esse prazo de validade já foi atingido', function () {
  cy.tick(tokenFixture.tokenValidityMilliseconds);
  cy.window({ log: false }).then((window) => {
    this.simulatedNow = window.Date.now();
    expect(this.simulatedNow, 'horário no limite da validade').to.equal(tokenFixture.tokenExpiresAt);
  });
});

When('tento realizar uma consulta utilizando esse token', function () {
  cy.api({
    method: 'GET',
    url: `${this.tokenMockUrl}/api/users/2`,
    qs: { now: this.simulatedNow },
    headers: { authorization: `Bearer ${this.session.token}` },
    failOnStatusCode: false,
    log: false,
  }).as('expiredTokenResponse').then((response) => {
    this.session = handleTokenExpiration(response, this.session);
  });
});

Then('a consulta é recusada por expiração da autenticação', () => {
  cy.get('@expiredTokenResponse', { log: false }).then(({ status, body }) => {
    expect(status, 'consulta após a expiração').to.equal(401);
    expect(body.error, 'motivo da recusa').to.equal('token_expired');
  });
});

Then('o erro informa que o token expirou', () => {
  cy.get('@expiredTokenResponse', { log: false }).then(({ body }) => {
    expect(body.message, 'mensagem do serviço').to.equal('Token expired');
  });
});

Then('o token expirado é descartado', function () {
  expect(this.session.token === null, 'token removido da sessão').to.equal(true);
});

Then('sou informado de que preciso me autenticar novamente', function () {
  expect(this.session.requiresAuthentication, 'necessidade de novo login').to.equal(true);
  expect(this.session.message, 'orientação após expiração')
    .to.equal('Sua sessão expirou. Autentique-se novamente.');
});
