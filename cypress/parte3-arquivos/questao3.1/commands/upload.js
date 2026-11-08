import { elements } from '../utils/elements';

Cypress.Commands.add('readCsvFixture', (fixtureName) => {
  return cy.readFile(`cypress/parte3-arquivos/questao3.1/fixtures/${fixtureName}`, 'utf8')
    .then((contents) => ({
      contents,
      fileName: `${fixtureName.replace(/\.csv$/, '')}-${globalThis.crypto.randomUUID()}.csv`,
    }));
});

Cypress.Commands.add('uploadCsv', (file) => {
  const uploadUrl = `${Cypress.expose('fileUploadBaseUrl')}/upload`;
  cy.visit(uploadUrl);
  cy.intercept('POST', uploadUrl).as('csvUpload');
  cy.get(elements.fileInput).selectFile({
    contents: Cypress.Buffer.from(file.contents, 'utf8'),
    fileName: file.fileName,
    mimeType: 'text/csv',
  });
  return cy.get(elements.submit).click();
});
