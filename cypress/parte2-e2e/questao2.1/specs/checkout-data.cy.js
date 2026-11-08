import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { elements } from '../utils/elements';
import { generateCheckoutData } from '../fixtures/checkout-data';
import './common.steps';
import '../commands/cart';
import '../commands/checkout';

const requiredFields = {
  nome: { dataKey: 'firstName', errorMessage: 'Error: First Name is required' },
  sobrenome: { dataKey: 'lastName', errorMessage: 'Error: Last Name is required' },
  CEP: { dataKey: 'postalCode', errorMessage: 'Error: Postal Code is required' },
};

Given('possui produtos no carrinho', () => {
  cy.addProductToCart('Sauce Labs Backpack').then((backpack) => {
    return cy.addProductToCart('Sauce Labs Bike Light').then((bikeLight) => {
      return [backpack, bikeLight];
    });
  }).as('chosenProducts');
});

When('informa nome, sobrenome e CEP válidos para a compra', () => {
  const checkoutData = generateCheckoutData();
  cy.startCheckout();
  cy.submitCheckoutData(checkoutData);
});

When('tenta prosseguir sem informar {string} e com os demais dados válidos', (requiredField) => {
  if (!Object.hasOwn(requiredFields, requiredField)) {
    throw new Error(`Campo obrigatório desconhecido: ${requiredField}.`);
  }

  const checkoutData = generateCheckoutData();
  checkoutData[requiredFields[requiredField].dataKey] = '';
  cy.startCheckout();
  cy.submitCheckoutData(checkoutData);
});

Then('é informado de que {string} é obrigatório', (requiredField) => {
  if (!Object.hasOwn(requiredFields, requiredField)) {
    throw new Error(`Campo obrigatório desconhecido: ${requiredField}.`);
  }

  cy.get(elements.text.error).should('be.visible')
    .and('have.text', requiredFields[requiredField].errorMessage);
});

Then('permanece na identificação da compra', () => {
  cy.location('pathname').should('eq', '/checkout-step-one.html');
  cy.get(elements.container.checkoutInfo).should('be.visible');
  cy.get(elements.container.checkoutSummary).should('not.exist');
});

Then('o resumo do pedido é apresentado com os produtos escolhidos, suas quantidades e os preços anunciados', () => {
  cy.location('pathname').should('eq', '/checkout-step-two.html');
  cy.get(elements.container.checkoutSummary).should('be.visible');

  cy.get('@chosenProducts').then((products) => {
    const expectedNames = products.map((product) => product.name);
    cy.get(elements.container.item).should('have.length', 2).and(($items) => {
      const actualNames = [...$items].map((item) => {
        return Cypress.$(item).find(elements.text.productName).text().trim();
      });
      expect(actualNames, 'produtos apresentados no resumo').to.have.members(expectedNames);
    });

    products.forEach((product) => {
      const exactProductName = new RegExp(`^${Cypress._.escapeRegExp(product.name)}$`);
      cy.contains(elements.text.productName, exactProductName)
        .parents(elements.container.item).within(() => {
          cy.get(elements.text.quantity).should('have.text', '1');
          cy.get(elements.text.productPrice).should('have.text', product.price);
        });
    });
  });
});
