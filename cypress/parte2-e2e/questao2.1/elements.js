export const elements = {
  input: {
    username: '[data-test="username"]',
    password: '[data-test="password"]',
    firstName: '[data-test="firstName"]',
    lastName: '[data-test="lastName"]',
    postalCode: '[data-test="postalCode"]',
  },

  btn: {
    login: '[data-test="login-button"]',
    addToCart: '[data-test^="add-to-cart-"]',
    removeFromCart: '[data-test^="remove-"]',
    addBackpack: '[data-test="add-to-cart-sauce-labs-backpack"]',
    addBikeLight: '[data-test="add-to-cart-sauce-labs-bike-light"]',
    removeBackpack: '[data-test="remove-sauce-labs-backpack"]',
    removeBikeLight: '[data-test="remove-sauce-labs-bike-light"]',
    checkout: '[data-test="checkout"]',
    continueShopping: '[data-test="continue-shopping"]',
    continueCheckout: '[data-test="continue"]',
    cancel: '[data-test="cancel"]',
    finish: '[data-test="finish"]',
    backToProducts: '[data-test="back-to-products"]',
  },

  link: {
    cart: '[data-test="shopping-cart-link"]',
  },

  container: {
    inventory: '[data-test="inventory-container"]',
    item: '[data-test="inventory-item"]',
    cart: '[data-test="cart-contents-container"]',
    checkoutInfo: '[data-test="checkout-info-container"]',
    checkoutSummary: '[data-test="checkout-summary-container"]',
    checkoutComplete: '[data-test="checkout-complete-container"]',
  },

  text: {
    title: '[data-test="title"]',
    productName: '[data-test="inventory-item-name"]',
    productPrice: '[data-test="inventory-item-price"]',
    quantity: '[data-test="item-quantity"]',
    cartBadge: '[data-test="shopping-cart-badge"]',
    error: '[data-test="error"]',
    subtotal: '[data-test="subtotal-label"]',
    tax: '[data-test="tax-label"]',
    total: '[data-test="total-label"]',
    paymentInfo: '[data-test="payment-info-value"]',
    confirmationTitle: '[data-test="complete-header"]',
    confirmationMessage: '[data-test="complete-text"]',
  },
};
