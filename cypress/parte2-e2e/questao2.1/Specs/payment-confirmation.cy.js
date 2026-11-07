import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { elements } from '../elements';
import { reviewOrder } from '../fixtures/review-order';
import { generateCheckoutData } from '../fixtures/checkout-data';
import { calculateOrderTotals, formatPrice } from '../utils/order-totals';
import './common.steps';
import '../commands/cart';
import '../commands/checkout';

const expectedTotals = calculateOrderTotals(reviewOrder.items, reviewOrder.taxRateBasisPoints);

Given('que o cliente possui mais de um produto distinto no carrinho', () => {
  expect(reviewOrder.items.length, 'mais de um produto escolhido').to.be.greaterThan(1);
  cy.addProductsToCart(reviewOrder.items);
});

Given('informou dados válidos para a compra', () => {
  cy.startCheckout();
  cy.submitCheckoutData(generateCheckoutData());
});

When('revisa o pedido antes de concluí-lo', () => {
  cy.location('pathname').should('eq', '/checkout-step-two.html');
  cy.get(elements.container.checkoutSummary).should('be.visible');
});

Then('o pedido apresenta os produtos escolhidos com suas quantidades e preços', () => {
  cy.validateProducts(reviewOrder.items);
});

Then('o subtotal corresponde à soma dos valores dos produtos', () => {
  cy.get(elements.text.subtotal).should('be.visible')
    .and('have.text', `Item total: ${formatPrice(expectedTotals.subtotalCents)}`);
});

Then('o imposto corresponde à regra aplicada à compra', () => {
  cy.get(elements.text.tax).should('be.visible')
    .and('have.text', `Tax: ${formatPrice(expectedTotals.taxCents)}`);
});

Then('o total corresponde ao subtotal acrescido do imposto', () => {
  cy.get(elements.text.total).should('be.visible')
    .and('have.text', `Total: ${formatPrice(expectedTotals.totalCents)}`);
});

Then('o cartão previsto para a compra é identificado nas informações de pagamento', () => {
  cy.get(elements.text.paymentInfo).should('be.visible').and('have.text', reviewOrder.paymentInfo);
});

Then('a modalidade de entrega gratuita prevista para a compra é apresentada', () => {
  cy.get(elements.text.shippingInfo).should('be.visible').and('have.text', reviewOrder.shippingInfo);
});
