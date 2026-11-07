import { elements } from '../elements';

Cypress.Commands.add('sauceDemoLogin', () => {
  const baseUrl = Cypress.expose('sauceDemoBaseUrl');

  return cy.env(['SAUCEDEMO_USERNAME', 'SAUCEDEMO_PASSWORD'], { log: false }).then((credentials) => {
    for (const key of ['SAUCEDEMO_USERNAME', 'SAUCEDEMO_PASSWORD']) {
      if (typeof credentials[key] !== 'string' || credentials[key].trim() === '') {
        throw new Error(`Configure ${key} em cypress.env.json ou CYPRESS_${key} antes de executar os testes do SauceDemo.`);
      }
    }

    cy.session(['saucedemo-login', baseUrl, credentials.SAUCEDEMO_USERNAME], () => {
      cy.visit(baseUrl);
      cy.get(elements.input.username).type(credentials.SAUCEDEMO_USERNAME, { log: false });
      cy.get(elements.input.password).type(credentials.SAUCEDEMO_PASSWORD, { log: false });
      cy.get(elements.btn.login).click();
      cy.location('pathname').should('eq', '/inventory.html');
      cy.get(elements.container.inventory).should('be.visible');
      cy.get(elements.text.cartBadge).should('not.exist');
    }, {
      cacheAcrossSpecs: true,
      validate() {
        cy.visit(`${baseUrl}/inventory.html`, { failOnStatusCode: false });
        cy.location('pathname').should('eq', '/inventory.html');
        cy.get(elements.container.inventory).should('be.visible');
      },
    });

    cy.visit(`${baseUrl}/inventory.html`, { failOnStatusCode: false });
    cy.location('pathname').should('eq', '/inventory.html');
    return cy.get(elements.container.inventory).should('be.visible');
  });
});
