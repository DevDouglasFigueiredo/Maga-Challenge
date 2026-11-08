import { Given, After } from '@badeball/cypress-cucumber-preprocessor';
import '../commands/auth';

Given('que o cliente está autenticado', () => {
  cy.sauceDemoLogin();
});

After({ tags: '@cart or @CheckoutData or @paymentConfirmation' }, () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
});
