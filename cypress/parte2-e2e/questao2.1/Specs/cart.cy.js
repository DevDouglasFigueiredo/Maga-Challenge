import { Given, When, Then, After } from '@badeball/cypress-cucumber-preprocessor';
import { elements } from '../elements';
import '../commands/auth';
import '../commands/cart';

const priceFormat = /^\$\d+\.\d{2}$/;

Given('que o cliente está autenticado', () => {
  cy.sauceDemoLogin();
});

Given('que o cliente possui um carrinho vazio', () => {
  cy.openCart();
  cy.get(elements.container.item).should('not.exist');
  cy.get(elements.text.cartBadge).should('not.exist');
  cy.returnToCatalog();
});

When('adiciona o produto {string} ao carrinho', (productName) => {
  cy.wrap(productName).as('expectedProductName');
  cy.addProductAndOpenCart(productName).as('chosenProduct');
});

Then('o carrinho contém somente o produto escolhido', () => {
  cy.get('@expectedProductName').then((expectedName) => {
    cy.get('@chosenProduct').then((product) => {
      expect(product.name, 'produto escolhido no catálogo').to.equal(expectedName);
      cy.get(elements.container.item).should('have.length', 1).within(() => {
        cy.get(elements.text.productName).should('have.text', product.name);
      });
    });
  });
});

Then('apresenta uma unidade com o preço anunciado', () => {
  cy.get('@chosenProduct').then((product) => {
    expect(product.price, 'preço anunciado no catálogo').to.match(priceFormat);
    cy.get(elements.container.item).should('have.length', 1).within(() => {
      cy.get(elements.text.quantity).should('have.text', '1');
      cy.get(elements.text.productPrice).should('have.text', product.price);
    });
  });
});

Then('a contagem do carrinho indica um item', () => {
  cy.get(elements.text.cartBadge).should('be.visible').and('have.text', '1');
});

When('adiciona os produtos {string} e {string} ao carrinho', (firstProductName, secondProductName) => {
  const productNames = [firstProductName, secondProductName];
  expect(firstProductName, 'produtos escolhidos são distintos').not.to.equal(secondProductName);
  cy.wrap(productNames).as('expectedProductNames');

  cy.addProductToCart(firstProductName).then((firstProduct) => {
    return cy.addProductToCart(secondProductName).then((secondProduct) => {
      return [firstProduct, secondProduct];
    });
  }).as('chosenProducts');

  cy.openCart();
});

Then('o carrinho contém somente os dois produtos escolhidos', () => {
  cy.get('@expectedProductNames').then((expectedNames) => {
    cy.get(elements.container.item).should('have.length', 2).and(($items) => {
      const actualNames = [...$items].map((item) => {
        return Cypress.$(item).find(elements.text.productName).text().trim();
      });
      expect(actualNames, 'produtos no carrinho').to.have.members(expectedNames);
    });
  });
});

Then('apresenta uma unidade de cada produto com os preços anunciados', () => {
  cy.get('@chosenProducts').each((product) => {
    expect(product.price, `preço anunciado de ${product.name}`).to.match(priceFormat);
    const exactProductName = new RegExp(`^${Cypress._.escapeRegExp(product.name)}$`);
    cy.contains(elements.text.productName, exactProductName)
      .parents(elements.container.item).within(() => {
        cy.get(elements.text.quantity).should('have.text', '1');
        cy.get(elements.text.productPrice).should('have.text', product.price);
      });
  });
});

Then('a contagem do carrinho indica dois itens', () => {
  cy.get(elements.text.cartBadge).should('be.visible').and('have.text', '2');
});

Given('que o cliente possui somente o produto {string} no carrinho', (productName) => {
  cy.addProductAndOpenCart(productName).as('chosenProduct');
  cy.get(elements.container.item).should('have.length', 1).within(() => {
    cy.get(elements.text.productName).should('have.text', productName);
    cy.get(elements.text.quantity).should('have.text', '1');
  });
  cy.get(elements.text.cartBadge).should('be.visible').and('have.text', '1');
});

When('remove esse produto do carrinho', () => {
  cy.get('@chosenProduct').then((product) => {
    cy.removeProductFromCart(product.name);
  });
});

Then('o carrinho fica vazio', () => {
  cy.get(elements.container.cart).should('be.visible');
  cy.get(elements.container.item).should('not.exist');
});

Then('a contagem do carrinho deixa de indicar itens', () => {
  cy.get(elements.text.cartBadge).should('not.exist');
});

After({ tags: '@carrinho' }, () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
});
