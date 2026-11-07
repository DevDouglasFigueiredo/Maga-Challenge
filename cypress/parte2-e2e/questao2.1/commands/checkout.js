import { elements } from '../elements';

Cypress.Commands.add('finishCheckout', () => {
  cy.get(elements.btn.finish).click();
  return cy.get(elements.container.checkoutComplete).should('be.visible');
});

Cypress.Commands.add('validateOrderConfirmation', () => {
  cy.location('pathname').should('eq', '/checkout-complete.html');
  cy.get(elements.container.checkoutComplete).should('be.visible');
  cy.get(elements.text.confirmationTitle).should('be.visible')
    .and('have.text', 'Thank you for your order!');
  return cy.get(elements.text.confirmationMessage).should('be.visible')
    .and('have.text', 'Your order has been dispatched, and will arrive just as fast as the pony can get there!');
});

Cypress.Commands.add('validateNoOrderConfirmation', () => {
  cy.get(elements.container.checkoutSummary).should('not.exist');
  cy.get(elements.container.checkoutComplete).should('not.exist');
  cy.get(elements.text.confirmationTitle).should('not.exist');
  return cy.get(elements.text.confirmationMessage).should('not.exist');
});

Cypress.Commands.add('cancelCheckout', () => {
  cy.get(elements.btn.cancel).click();
  return cy.get(elements.container.inventory).should('be.visible');
});

Cypress.Commands.add('startCheckout', () => {
  cy.openCart();
  cy.get(elements.btn.checkout).click();
  return cy.get(elements.container.checkoutInfo).should('be.visible');
});

Cypress.Commands.add('submitCheckoutData', ({ firstName, lastName, postalCode }) => {
  const fields = [
    { selector: elements.input.firstName, value: firstName },
    { selector: elements.input.lastName, value: lastName },
    { selector: elements.input.postalCode, value: postalCode },
  ];

  fields.forEach(({ selector, value }) => {
    cy.get(selector).clear();
    if (value !== '') {
      cy.get(selector).type(value);
    }
    cy.get(selector).should('have.value', value);
  });
  return cy.get(elements.btn.continueCheckout).click();
});
