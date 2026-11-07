const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');

module.exports = defineConfig({
  expose: {
    hideCredentials: true,
  },
  e2e: {
    specPattern: [
      'cypress/parte1-api/feature/**/*.feature',
      'parte{2-e2e,3-arquivos}/**/testes/**/*.feature',
    ],
    supportFile: 'cypress/support/e2e.js',
    async setupNodeEvents(on, config) {
      // O preprocessor usa expose no Cypress 16; preserva o filtro --env tags.
      on('task', {
        logResponse(response) {
          console.dir(response, { depth: null });
          return null;
        },
      });
      if (config.env.tags !== undefined) {
        config.expose.tags = config.env.tags;
      }
      await addCucumberPreprocessorPlugin(on, config);
      on('file:preprocessor', createBundler({
        plugins: [createEsbuildPlugin(config)],
      }));
      return config;
    },
  },
});
