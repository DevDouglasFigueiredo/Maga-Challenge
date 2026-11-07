const exhaustedQuota = '0';

function isRateLimitExceeded(response) {
  return response.status === 403
    && response.headers['x-ratelimit-remaining'] === exhaustedQuota;
}

module.exports = { isRateLimitExceeded };
