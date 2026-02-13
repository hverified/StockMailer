const { AuthService, SESSION_COOKIE_NAME } = require("../services/auth.service");
const { AppError } = require("./error-handler.middleware");

const authService = new AuthService();

function parseCookies(cookieHeader = "") {
  const cookies = {};
  if (!cookieHeader) return cookies;

  const pairs = String(cookieHeader).split(";");
  for (const pair of pairs) {
    const index = pair.indexOf("=");
    if (index < 0) continue;
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    cookies[key] = decodeURIComponent(value);
  }

  return cookies;
}

function cookieParser(req, res, next) {
  req.cookies = parseCookies(req.headers.cookie);
  next();
}

async function attachCurrentUser(req, res, next) {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (!token) {
      req.user = null;
      return next();
    }

    const user = await authService.getUserFromSessionToken(token);
    req.user = user || null;
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return next(new AppError("Authentication required", 401));
  }
  return next();
}

module.exports = {
  cookieParser,
  attachCurrentUser,
  requireAuth,
};
