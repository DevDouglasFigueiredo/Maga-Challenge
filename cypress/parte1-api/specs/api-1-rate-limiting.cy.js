import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import 'cypress-plugin-api';
import { isRateLimitExceeded } from '../utils/rate-limit-helper';

const millisecondsPerSecond = 1000;
const rateLimitWindowSeconds = 3600;
const resetToleranceSeconds = 60;

Given('que existe cota disponível para consultas públicas sem autenticação', function () {
  this.apiBaseUrl = '';

  cy.api({
    method: 'GET',
    url: '/rate_limit',
    failOnStatusCode: false,
  }).then(({ status, body }) => {
    expect(status, 'consulta da cota pública').to.equal(200);
    expect(body.resources.core.limit, 'limite sem autenticação').to.equal(60);
    expect(body.resources.core.remaining, 'cota pública disponível para executar o cenário')
      .to.be.greaterThan(0);
  });
});

When('consulto o usuário público {string}', function (userLogin) {
  this.userLogin = userLogin;

  cy.api({
    method: 'GET',
    url: `${this.apiBaseUrl}/users/${encodeURIComponent(userLogin)}`,
    failOnStatusCode: false,
  }).as('githubResponse');
});

Given('que possuo autenticação válida no GitHub com cota padrão de {int} consultas por hora', function (expectedLimit) {
  this.authenticatedRateLimit = expectedLimit;

  cy.env(['GITHUB_TOKEN'], { log: false }).then(({ GITHUB_TOKEN: token }) => {
    if (typeof token !== 'string' || token.trim() === '') {
      throw new Error('Configure CYPRESS_GITHUB_TOKEN no terminal ou GITHUB_TOKEN em cypress.env.json antes de executar API-02.');
    }
  });
});

Given('existe cota disponível para consultas autenticadas', function () {
  cy.githubAuthenticatedRequest('/rate_limit').then(({ status, body }) => {
    expect(status, 'consulta autenticada da cota; 401 indica token inválido ou expirado').to.equal(200);
    expect(body.resources.core.limit, 'limite com autenticação').to.equal(this.authenticatedRateLimit);
    expect(body.resources.core.remaining, 'cota autenticada disponível para executar o cenário')
      .to.be.greaterThan(0);
  });
});

When('consulto o usuário público {string} com minha autenticação', function (userLogin) {
  this.userLogin = userLogin;

  cy.githubAuthenticatedRequest(`/users/${encodeURIComponent(userLogin)}`)
    .as('githubResponse');
});

Then('recebo os dados do usuário solicitado', function () {
  cy.get('@githubResponse').then(({ status, body }) => {
    expect(status, 'consulta do usuário público').to.equal(200);
    expect(body.login, 'identidade do usuário').to.equal(this.userLogin);
  });
});

Then('sou informado do limite de {int} consultas por hora', (expectedLimit) => {
  cy.get('@githubResponse').then(({ headers }) => {
    expect(headers['x-ratelimit-limit'], 'X-RateLimit-Limit').to.match(/^\d+$/);
    expect(Number(headers['x-ratelimit-limit']), 'limite por hora').to.equal(expectedLimit);
  });
});

Then('sou informado da quantidade restante e do momento de renovação da cota', () => {
  cy.get('@githubResponse').then(({ headers }) => {
    expect(headers['x-ratelimit-remaining'], 'X-RateLimit-Remaining').to.match(/^\d+$/);
    expect(headers['x-ratelimit-reset'], 'X-RateLimit-Reset').to.match(/^\d+$/);
    expect(headers.date, 'Date do servidor').to.be.a('string').and.not.be.empty;

    const resetSeconds = Number(headers['x-ratelimit-reset']);
    const serverSeconds = Date.parse(headers.date) / millisecondsPerSecond;

    expect(Number.isSafeInteger(resetSeconds), 'reset em segundos inteiros').to.equal(true);
    expect(Number.isFinite(serverSeconds), 'data válida do servidor').to.equal(true);
    expect(resetSeconds, 'renovação posterior ao horário da resposta').to.be.greaterThan(serverSeconds);
    expect(resetSeconds - serverSeconds, 'renovação dentro de uma hora com tolerância')
      .to.be.at.most(rateLimitWindowSeconds + resetToleranceSeconds);
  });
});

Then('a quantidade restante está dentro do limite permitido', () => {
  cy.get('@githubResponse').then(({ headers }) => {
    const remaining = Number(headers['x-ratelimit-remaining']);
    const limit = Number(headers['x-ratelimit-limit']);

    expect(Number.isSafeInteger(remaining), 'saldo inteiro').to.equal(true);
    expect(remaining, 'saldo após a consulta').to.be.within(0, limit - 1);
  });
});

Given('que a cota de consultas da janela atual está esgotada', function () {
  const mockUrl = Cypress.expose('githubRateLimitMockUrl');
  expect(mockUrl, 'endereço da simulação local').to.match(/^http:\/\/127\.0\.0\.1:\d+$/);
  this.apiBaseUrl = mockUrl;
});

Then('a consulta é recusada por esgotamento da cota', () => {
  cy.get('@githubResponse').then(({ status, body }) => {
    expect(status, 'consulta recusada').to.equal(403);
    expect(body.message, 'motivo da recusa').to.equal('API rate limit exceeded');
  });
});

Then('sou informado de que não restam consultas nessa janela', () => {
  cy.get('@githubResponse').then(({ headers }) => {
    expect(headers, 'header de saldo disponível').to.have.property('x-ratelimit-remaining', '0');
  });
});

Then('identifico que o limite de consultas foi atingido', () => {
  cy.get('@githubResponse').then((response) => {
    expect(isRateLimitExceeded(response), 'identificação do esgotamento da cota').to.equal(true);
  });
});
