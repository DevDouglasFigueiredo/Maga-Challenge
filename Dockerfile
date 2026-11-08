FROM cypress/browsers:node-24.22.1-chrome-156.0.8078.73-1-ff-159.0-edge-156.0.4314.50-1@sha256:348cf0242c31155e85b2a90fdd5f95afc1f3aaeca830ba98acadb3ce5d77c4e0

WORKDIR /e2e

COPY package.json package-lock.json ./
RUN npm ci --include=dev && npx cypress verify

COPY cypress.config.js ./
COPY cypress/ ./cypress/

CMD ["npm", "test", "--", "--browser", "chrome", "--env", "tags=not @skip"]
