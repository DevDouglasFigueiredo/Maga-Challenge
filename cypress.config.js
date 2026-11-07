const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin, afterRunHandler } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const { startRateLimitServer } = require('./cypress/parte1-api/mocks/rate-limit-server');

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
      on('task', {
        logResponse(response) {
          console.dir(response, { depth: null });
          return null;
        },
      });
      if (config.env.tags !== undefined) {
        config.expose.tags = config.env.tags;
      }
      // Combina o encerramento do servidor com o evento original do Cucumber.
      await addCucumberPreprocessorPlugin(on, config, { omitAfterRunHandler: true });
      on('file:preprocessor', createBundler({
        plugins: [createEsbuildPlugin(config)],
      }));

      const rateLimitServer = await startRateLimitServer();
      config.expose.githubRateLimitMockUrl = rateLimitServer.url;

      on('after:run', async (results) => {
        try {
          await afterRunHandler(config, results);
        } finally {
          if (!config.isInteractive) {
            await rateLimitServer.close();
          }
        }
      });
      return config;
    },
  },
});
