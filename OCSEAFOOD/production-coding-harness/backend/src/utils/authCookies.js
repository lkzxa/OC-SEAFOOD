const env = require('../config/env');

const SESSION_COOKIE_DEV = 'ocseafood_session';
const SESSION_COOKIE_PROD = '__Host-ocseafood_session';
const OAUTH_STATE_COOKIE_DEV = 'ocseafood_oauth_state';
const OAUTH_STATE_COOKIE_PROD = '__Host-ocseafood_oauth_state';

const isProduction = () => env.NODE_ENV === 'production';

const getSessionCookieName = () => isProduction() ? SESSION_COOKIE_PROD : SESSION_COOKIE_DEV;
const getOAuthStateCookieName = () => isProduction() ? OAUTH_STATE_COOKIE_PROD : OAUTH_STATE_COOKIE_DEV;

const parseCookies = (req) => {
  const header = req.headers.cookie;
  if (!header) return {};

  return header.split(';').reduce((cookies, item) => {
    const separator = item.indexOf('=');
    if (separator === -1) return cookies;

    const name = item.slice(0, separator).trim();
    const rawValue = item.slice(separator + 1).trim();
    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      cookies[name] = rawValue;
    }
    return cookies;
  }, {});
};

const sessionCookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: 'lax',
  path: '/',
  ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
});

const oauthStateCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: 'lax',
  path: '/',
  maxAge: 10 * 60 * 1000,
});

const setSessionCookie = (res, token, rememberMe = false) => {
  res.cookie(getSessionCookieName(), token, sessionCookieOptions(rememberMe));
};

const clearSessionCookie = (res) => {
  res.clearCookie(getSessionCookieName(), sessionCookieOptions(false));
};

const getSessionToken = (req) => parseCookies(req)[getSessionCookieName()] || null;

const setOAuthStateCookie = (res, state) => {
  res.cookie(getOAuthStateCookieName(), state, oauthStateCookieOptions());
};

const clearOAuthStateCookie = (res) => {
  res.clearCookie(getOAuthStateCookieName(), oauthStateCookieOptions());
};

const getOAuthState = (req) => parseCookies(req)[getOAuthStateCookieName()] || null;

module.exports = {
  clearOAuthStateCookie,
  clearSessionCookie,
  getOAuthState,
  getOAuthStateCookieName,
  getSessionCookieName,
  getSessionToken,
  setOAuthStateCookie,
  setSessionCookie,
};
