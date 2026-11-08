const { defineConfig } = require('cypress');
const path = require('node:path');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin, beforeRunHandler, afterRunHandler } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const { beforeRunHook, afterRunHook } = require('cypress-mochawesome-reporter/lib');
const { restoreReportOwnership } = require('./cypress/support/report-ownership');
const { startRateLimitServer } = require('./cypress/parte1-api/questao1.1/mocks/rate-limit-server');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'artifacts/reports',
    reportFilename: 'index',
    overwrite: true,
    charts: true,
    inlineAssets: true,
    embeddedScreenshots: true,
  },
  expose: {
    hideCredentials: true,
    hideCredentialsOptions: {
      auth: ['user', 'username', 'pass', 'password', 'bearer'],
      headers: ['authorization', 'cookie', 'set-cookie', 'password', 'username', 'token', 'api-key', 'x-api-key', 'apiKey'],
      body: ['email', 'pass', 'password', 'token', 'secret', 'apiKey', 'api_key'],
      qs: ['token', 'key', 'apiKey', 'api_key', 'secret', 'password'],
    },
    reqresBaseUrl: 'https://reqres.in',
    sauceDemoBaseUrl: 'https://www.saucedemo.com',
    fileUploadBaseUrl: 'https://the-internet.herokuapp.com',
  },
  e2e: {
    baseUrl: 'https://api.github.com',
    specPattern: [
      'cypress/parte1-api/questao1.1/feature/**/*.feature',
      'cypress/parte2-e2e/questao2.1/feature/**/*.feature',
      'parte{2-e2e,3-arquivos}/**/testes/**/*.feature',
      'cypress/parte3-arquivos/questao3.1/feature/**/*.feature',
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
      await addCucumberPreprocessorPlugin(on, config, {
        omitBeforeRunHandler: true,
        omitAfterRunHandler: true,
      });
      // Os dois plugins compartilham eventos; compor hooks evita sobrescrevê-los.
      on('before:run', async (details) => {
        await beforeRunHandler(config);
        if (!config.isInteractive) {
          await beforeRunHook(details);
        }
      });
      on('file:preprocessor', (file) => {
        // Resolver pelo nome da feature mantém steps homônimos de suítes distintas isolados.
        const stepDefinitions = [path.join(
          path.dirname(file.filePath), '..', 'specs',
          `${path.basename(file.filePath, '.feature')}.cy.js`,
        )];
        return createBundler({
          plugins: [createEsbuildPlugin({
            ...config,
            expose: { ...config.expose, stepDefinitions },
          })],
        })(file);
      });

      const rateLimitServer = await startRateLimitServer();
      config.expose.githubRateLimitMockUrl = rateLimitServer.url;
      config.expose.tokenExpirationMockUrl = rateLimitServer.url;

      on('after:run', async (results) => {
        try {
          await afterRunHandler(config, results);
        } finally {
          try {
            if (!config.isInteractive) {
              try {
                await afterRunHook();
              } finally {
                await restoreReportOwnership(config);
              }
            }
          } finally {
            if (!config.isInteractive) {
              await rateLimitServer.close();
            }
          }
        }
      });
      return config;
    },
  },
});
