import { elements } from '../elements';

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
