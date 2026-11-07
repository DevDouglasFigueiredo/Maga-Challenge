export function calculateOrderTotals(items, taxRateBasisPoints) {
  const subtotalCents = items.reduce((sum, item) => {
    return sum + item.unitPriceCents * item.quantity;
  }, 0);
  const basisPointsPerWhole = 10000;
  // Arredondamento ao centavo: metade ou mais arredonda para cima.
  const taxCents = Math.floor(
    (subtotalCents * taxRateBasisPoints + basisPointsPerWhole / 2) / basisPointsPerWhole,
  );

  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
