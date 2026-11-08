function serializeCsv(rows) {
  return rows.map((row) => row.map((value) => {
    const field = String(value);
    return /[",\r\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field;
  }).join(',')).join('\r\n') + '\r\n';
}

function generateCsv(rowCount) {
  if (!Number.isInteger(rowCount) || rowCount < 1) {
    throw new Error('A quantidade de registros deve ser um inteiro positivo.');
  }

  const executionId = globalThis.crypto.randomUUID();
  const rows = Array.from({ length: rowCount }, (_, index) => [
    `João Teste ${index + 1}`,
    `teste-${executionId}-${index + 1}@example.invalid`,
    18 + (index % 63),
    'São Paulo',
  ]);

  return serializeCsv([['nome', 'email', 'idade', 'cidade'], ...rows]);
}

module.exports = { generateCsv, serializeCsv };
