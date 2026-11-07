import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import 'cypress-plugin-api';

Given('que existe cota disponível para consultas públicas sem autenticação', () => {
  cy.api({
    method: 'GET',
    url: 'https://api.github.com/rate_limit',
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
    url: `https://api.github.com/users/${encodeURIComponent(userLogin)}`,
    failOnStatusCode: false,
  }).as('githubResponse');
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
    const serverSeconds = Date.parse(headers.date) / 1000;

    expect(Number.isSafeInteger(resetSeconds), 'reset em segundos inteiros').to.equal(true);
    expect(Number.isFinite(serverSeconds), 'data válida do servidor').to.equal(true);
    expect(resetSeconds, 'renovação posterior ao horário da resposta').to.be.greaterThan(serverSeconds);
    // Compara com o servidor, permitindo 60 segundos de tolerância na janela.
    expect(resetSeconds - serverSeconds, 'renovação dentro de uma hora com tolerância')
      .to.be.at.most(3660);
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
