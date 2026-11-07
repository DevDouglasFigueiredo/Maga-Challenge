const millisecondsPerSecond = 1000;
const secondsPerMinute = 60;
const tokenValidityMinutes = 2;
const tokenIssuedAt = Date.UTC(2026, 0, 1);
const tokenValidityMilliseconds = tokenValidityMinutes * secondsPerMinute * millisecondsPerSecond;

module.exports = {
  token: 'local-expiration-test-token',
  tokenIssuedAt,
  tokenValidityMinutes,
  tokenExpiresAt: tokenIssuedAt + tokenValidityMilliseconds,
  tokenValidityMilliseconds,
};
