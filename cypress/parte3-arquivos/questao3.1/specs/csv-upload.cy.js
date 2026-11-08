import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { generateCsv } from '../utils/csv-generator';
import { elements } from '../utils/elements';
import '../commands/upload';

const generatedEmailPattern = /^teste-[a-f0-9-]+-\d+@example\.invalid$/;
const lineBreakPattern = /\r?\n/;
const unclosedQuotedFieldPattern = /^"[^"]+$/;
const basicEmailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const negativeIntegerPattern = /^-\d+$/;

Given('que possuo um arquivo CSV válido com {int} registros', (rowCount) => {
  const contents = generateCsv(rowCount);
  const [header, ...records] = contents.trimEnd().split('\r\n');
  expect(header, 'cabeçalho do CSV').to.equal('nome,email,idade,cidade');
  expect(records, 'registros sem contar cabeçalho').to.have.length(rowCount);
  const emails = records.map((record, index) => {
    const fields = record.split(',');
    expect(fields, `colunas do registro ${index + 1}`).to.have.length(4);
    const [name, email, age, city] = fields;
    expect(name).to.equal(`João Teste ${index + 1}`);
    expect(email).to.match(generatedEmailPattern);
    expect(Number(age)).to.equal(18 + (index % 63));
    expect(city).to.equal('São Paulo');
    return email;
  });
  expect(new Set(emails).size, 'emails distintos').to.equal(rowCount);

  cy.wrap({ contents, fileName: `csv-${globalThis.crypto.randomUUID()}.csv` }).as('csvFile');
});

Given('que possuo um arquivo CSV vazio', () => {
  cy.readCsvFixture('vazio.csv').then((file) => {
    const { contents } = file;
    expect(contents, 'fixture sem conteúdo').to.equal('');
    expect(Cypress.Buffer.byteLength(contents, 'utf8'), 'tamanho da fixture em bytes').to.equal(0);

    return file;
  }).as('csvFile');
});

Given('que possuo um arquivo CSV com formato incorreto', () => {
  cy.readCsvFixture('corrompido.csv').then((file) => {
    const { contents } = file;
    const [header, ...records] = contents.trimEnd().split(lineBreakPattern);
    expect(header, 'cabeçalho preservado').to.equal('nome,email,idade,cidade');
    expect(records, 'registro corrompido').to.have.length(1);
    expect(records[0], 'aspas abertas sem fechamento').to.match(unclosedQuotedFieldPattern);

    return file;
  }).as('csvFile');
});

Given('que possuo um arquivo CSV com dados malformados', () => {
  cy.readCsvFixture('invalido.csv').then((file) => {
    const { contents } = file;
    const [header, ...records] = contents.trimEnd().split(lineBreakPattern);
    expect(header, 'cabeçalho preservado').to.equal('nome,email,idade,cidade');
    expect(records, 'registro com dados inválidos').to.have.length(1);
    expect(records[0], 'registro sem aspas').not.to.include('"');
    const fields = records[0].split(',');
    expect(fields, 'estrutura preservada com quatro colunas').to.have.length(4);
    const [name, email, age, city] = fields;
    expect(name, 'nome presente').not.to.equal('');
    expect(city, 'cidade presente').not.to.equal('');
    expect(email, 'email malformado').not.to.match(basicEmailPattern);
    expect(age, 'idade inteira negativa').to.match(negativeIntegerPattern);
    expect(Number(age), 'idade abaixo de zero').to.be.lessThan(0);

    return file;
  }).as('csvFile');
});

When('há o upload do arquivo', () => {
  cy.get('@csvFile').then((file) => cy.uploadCsv(file));
});

Then('recebo confirmação identificando que o arquivo foi enviado', () => {
  cy.wait('@csvUpload').then(({ response }) => {
    expect(response.statusCode, 'resposta real do upload').to.equal(200);
  });
  cy.get(elements.confirmation).should('be.visible').and('have.text', 'File Uploaded!');
  cy.get('@csvFile').then(({ fileName }) => {
    cy.get(elements.uploadedFile).should('be.visible')
      .and(($element) => expect($element.text().trim()).to.equal(fileName));
  });
});
