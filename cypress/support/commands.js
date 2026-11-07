Cypress.Commands.add('reqresLogin', () => {
  return cy.env(['REQRES_API_KEY', 'REQRES_EMAIL', 'REQRES_PASSWORD'], { log: false }).then((credentials) => {
    for (const key of ['REQRES_API_KEY', 'REQRES_EMAIL', 'REQRES_PASSWORD']) {
      if (typeof credentials[key] !== 'string' || credentials[key].trim() === '') {
        throw new Error(`Configure ${key} em cypress.env.json ou CYPRESS_${key} no terminal antes de executar API-07.`);
      }
    }

    const reqresBaseUrl = Cypress.expose('reqresBaseUrl');
    const tokenCookieName = 'reqres-test-token';
    const tokenCookieOptions = { domain: new URL(reqresBaseUrl).hostname, log: false };

    cy.session(['reqres-api-login', reqresBaseUrl], () => {
      cy.api({
        method: 'POST',
        url: `${reqresBaseUrl}/api/login`,
        body: {
          email: credentials.REQRES_EMAIL,
          password: credentials.REQRES_PASSWORD,
        },
        headers: { 'x-api-key': credentials.REQRES_API_KEY },
        failOnStatusCode: false,
        log: false,
      }).then(({ status, body }) => {
        expect(status, 'login no ReqRes').to.equal(200);
        expect(typeof body.token === 'string' && body.token.trim().length > 0,
          'login retorna token não vazio').to.equal(true);

        return cy.setCookie(tokenCookieName, body.token, {
          ...tokenCookieOptions,
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
        });
      });
    }, {
      validate() {
        cy.getCookie(tokenCookieName, tokenCookieOptions).then((cookie) => {
          expect(typeof cookie?.value === 'string' && cookie.value.trim().length > 0,
            'sessão contém token para reutilização').to.equal(true);
        });
      },
    });

    return cy.getCookie(tokenCookieName, tokenCookieOptions).then((cookie) => cookie.value);
  });
});

Cypress.Commands.add('reqresAuthenticatedRequest', (path, token) => {
  return cy.env(['REQRES_API_KEY'], { log: false }).then(({ REQRES_API_KEY: apiKey }) => {
    return cy.api({
      method: 'GET',
      url: `${Cypress.expose('reqresBaseUrl')}${path}`,
      headers: { authorization: `Bearer ${token}`, 'x-api-key': apiKey },
      failOnStatusCode: false,
      log: false,
    });
  });
});

Cypress.Commands.add('githubAuthenticatedRequest', (path) => {
  return cy.env(['GITHUB_TOKEN'], { log: false }).then(({ GITHUB_TOKEN: token }) => {
    if (typeof token !== 'string' || token.trim() === '') {
      throw new Error('Configure CYPRESS_GITHUB_TOKEN no terminal ou GITHUB_TOKEN em cypress.env.json antes de executar API-02.');
    }

    return cy.api({
      method: 'GET',
      url: path,
      headers: { authorization: `Bearer ${token}` },
      failOnStatusCode: false,
      log: false,
    });
  });
});
