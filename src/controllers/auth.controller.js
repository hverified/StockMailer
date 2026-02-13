const {
  AuthService,
  MIN_PASSWORD_LENGTH,
  SESSION_COOKIE_NAME,
} = require("../services/auth.service");

class AuthController {
  constructor() {
    this.authService = new AuthService();

    this.signUp = this.signUp.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.me = this.me.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
  }

  getCookieOptions(expiresAt) {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
    };

    if (expiresAt instanceof Date) {
      cookieOptions.expires = expiresAt;
    }

    return cookieOptions;
  }

  setAuthCookie(res, token, expiresAt) {
    res.cookie(
      SESSION_COOKIE_NAME,
      token,
      this.getCookieOptions(expiresAt instanceof Date ? expiresAt : undefined)
    );
  }

  clearAuthCookie(res) {
    res.clearCookie(SESSION_COOKIE_NAME, this.getCookieOptions());
  }

  async signUp(req, res) {
    const { name, username, password, rememberMe } = req.body || {};

    const result = await this.authService.signup({
      name,
      username,
      password,
      rememberMe: rememberMe !== false,
      userAgent: req.headers["user-agent"],
    });

    this.setAuthCookie(res, result.session.token, result.session.expiresAt);

    res.status(201).json({
      success: true,
      message: "Signup successful",
      minPasswordLength: MIN_PASSWORD_LENGTH,
      user: result.user,
    });
  }

  async signIn(req, res) {
    const { username, password, rememberMe } = req.body || {};

    const result = await this.authService.signin({
      username,
      password,
      rememberMe: rememberMe !== false,
      userAgent: req.headers["user-agent"],
    });

    this.setAuthCookie(res, result.session.token, result.session.expiresAt);

    res.json({
      success: true,
      message: "Signin successful",
      minPasswordLength: MIN_PASSWORD_LENGTH,
      user: result.user,
    });
  }

  async signOut(req, res) {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    await this.authService.signout(token);
    this.clearAuthCookie(res);

    res.json({
      success: true,
      message: "Signed out successfully",
    });
  }

  async me(req, res) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    res.json({
      success: true,
      user: req.user,
    });
  }

  async forgotPassword(req, res) {
    const { username, newPassword } = req.body || {};
    await this.authService.forgotPassword({ username, newPassword });

    res.json({
      success: true,
      message: "Password reset successful. Please sign in again.",
      minPasswordLength: MIN_PASSWORD_LENGTH,
    });
  }
}

module.exports = new AuthController();
