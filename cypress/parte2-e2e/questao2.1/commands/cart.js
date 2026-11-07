import { elements } from '../elements';

Cypress.Commands.add('openCart', () => {
  cy.get(elements.link.cart).click();
  return cy.get(elements.container.cart).should('be.visible');
});

Cypress.Commands.add('returnToCatalog', () => {
  cy.get(elements.btn.continueShopping).click();
  return cy.get(elements.container.inventory).should('be.visible');
});

Cypress.Commands.add('addProductToCart', (productName) => {
  const exactProductName = new RegExp(`^${Cypress._.escapeRegExp(productName)}$`);

  return cy.contains(elements.text.productName, exactProductName)
    .parents(elements.container.item)
    .then(($item) => {
      const product = {
        name: $item.find(elements.text.productName).text().trim(),
        price: $item.find(elements.text.productPrice).text().trim(),
      };

      cy.wrap($item).find(elements.btn.addToCart).click();
      return cy.wrap(product);
    });
});

Cypress.Commands.add('addProductAndOpenCart', (productName) => {
  return cy.addProductToCart(productName).then((product) => {
    cy.openCart();
    return cy.wrap(product);
  });
});

Cypress.Commands.add('removeProductFromCart', (productName) => {
  const exactProductName = new RegExp(`^${Cypress._.escapeRegExp(productName)}$`);

  return cy.contains(elements.text.productName, exactProductName)
    .parents(elements.container.item)
    .find(elements.btn.removeFromCart).click();
});
