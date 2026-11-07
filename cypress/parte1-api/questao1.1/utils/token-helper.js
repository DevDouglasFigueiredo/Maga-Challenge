function handleTokenExpiration(response, session) {
  if (response.status === 401 && response.body.error === 'token_expired') {
    return {
      token: null,
      requiresAuthentication: true,
      message: 'Sua sessão expirou. Autentique-se novamente.',
    };
  }

  return session;
}

module.exports = { handleTokenExpiration };
