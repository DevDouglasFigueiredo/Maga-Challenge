import { elements } from '../elements';
import { formatPrice } from '../utils/order-totals';

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

Cypress.Commands.add('addProductsToCart', (items) => {
  expect(items, 'produtos a incluir').to.be.an('array').and.not.be.empty;
  const productNames = items.map((item) => item.name);
  expect(new Set(productNames).size, 'produtos distintos na lista').to.equal(items.length);
  items.forEach((item) => {
    expect(item.quantity, `SauceDemo permite uma unidade de ${item.name}`).to.equal(1);
  });

  return cy.wrap(items).each((item) => {
    return cy.addProductToCart(item.name).then((product) => {
      expect(product.name, 'produto escolhido no catálogo').to.equal(item.name);
      expect(product.price, `preço anunciado de ${item.name}`)
        .to.equal(formatPrice(item.unitPriceCents));
    });
  });
});

Cypress.Commands.add('validateProducts', (items) => {
  const expectedNames = items.map((item) => item.name);
  cy.get(elements.container.item).should('have.length', items.length).and(($items) => {
    const actualNames = [...$items].map((item) => {
      return Cypress.$(item).find(elements.text.productName).text().trim();
    });
    expect(actualNames, 'produtos apresentados').to.have.members(expectedNames);
  });

  return cy.wrap(items).each((item) => {
    const exactProductName = new RegExp(`^${Cypress._.escapeRegExp(item.name)}$`);
    return cy.contains(elements.text.productName, exactProductName)
      .parents(elements.container.item).within(() => {
        cy.get(elements.text.quantity).should('have.text', String(item.quantity));
        cy.get(elements.text.productPrice).should('have.text', formatPrice(item.unitPriceCents));
      });
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

Cypress.Commands.add('emptyCart', () => {
  cy.get(elements.text.cartBadge).should('not.exist');
  cy.openCart();
  cy.get(elements.container.item).should('not.exist');
});
