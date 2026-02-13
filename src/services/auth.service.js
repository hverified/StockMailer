const crypto = require("crypto");
const mongodb = require("../config/mongodb");
const UserRepository = require("./repositories/user.repository");
const {
  ValidationError,
  AppError,
  NotFoundError,
} = require("../middleware/error-handler.middleware");

const MIN_PASSWORD_LENGTH = 5;
const SESSION_COOKIE_NAME = "stockmailer_auth";
const SESSION_MS = 1000 * 60 * 60 * 12; // 12 hours
const REMEMBER_ME_SESSION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

class AuthService {
  normalizeUsername(username) {
    return String(username || "")
      .trim()
      .toLowerCase();
  }

  sanitizeUser(userDoc) {
    if (!userDoc) return null;

    return {
      id: String(userDoc._id),
      name: userDoc.name,
      username: userDoc.username,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };
  }

  validatePassword(password) {
    if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      );
    }
  }

  validateSignupInput({ name, username, password }) {
    if (!name || !String(name).trim()) {
      throw new ValidationError("Name is required");
    }

    const normalizedUsername = this.normalizeUsername(username);
    if (!normalizedUsername) {
      throw new ValidationError("Username is required");
    }

    this.validatePassword(password);
  }

  hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return {
      salt,
      hash: derivedKey.toString("hex"),
    };
  }

  verifyPassword(password, salt, expectedHash) {
    if (!salt || !expectedHash) return false;
    const { hash } = this.hashPassword(password, salt);
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(expectedHash, "hex")
    );
  }

  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  createSessionToken() {
    return crypto.randomBytes(48).toString("hex");
  }

  async getRepository() {
    if (!mongodb.db) {
      await mongodb.connect();
    }
    return new UserRepository(mongodb.getDb());
  }

  async createSessionForUser(userId, rememberMe = true, userAgent = "") {
    const repo = await this.getRepository();
    const rawToken = this.createSessionToken();
    const tokenHash = this.hashToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + (rememberMe ? REMEMBER_ME_SESSION_MS : SESSION_MS)
    );

    await repo.addSession(
      userId,
      {
        tokenHash,
        createdAt: now,
        expiresAt,
        rememberMe: Boolean(rememberMe),
        userAgent: String(userAgent || "").slice(0, 250),
      },
      5
    );

    return {
      token: rawToken,
      expiresAt,
    };
  }

  async signup({ name, username, password, rememberMe = true, userAgent = "" }) {
    this.validateSignupInput({ name, username, password });

    const repo = await this.getRepository();
    const normalizedUsername = this.normalizeUsername(username);
    const existingUser = await repo.findByUsername(normalizedUsername);

    if (existingUser) {
      throw new ValidationError("Username is already taken");
    }

    const { salt, hash } = this.hashPassword(String(password));
    const now = new Date();

    const user = await repo.createUser({
      name: String(name).trim(),
      username: normalizedUsername,
      passwordSalt: salt,
      passwordHash: hash,
      sessions: [],
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });

    const session = await this.createSessionForUser(
      user._id,
      rememberMe,
      userAgent
    );

    return {
      user: this.sanitizeUser(user),
      session,
    };
  }

  async signin({ username, password, rememberMe = true, userAgent = "" }) {
    const normalizedUsername = this.normalizeUsername(username);
    if (!normalizedUsername || !password) {
      throw new ValidationError("Username and password are required");
    }

    const repo = await this.getRepository();
    const user = await repo.findByUsername(normalizedUsername);
    if (!user) {
      throw new AppError("Invalid username or password", 401);
    }

    const isValid = this.verifyPassword(
      String(password),
      user.passwordSalt,
      user.passwordHash
    );
    if (!isValid) {
      throw new AppError("Invalid username or password", 401);
    }

    const session = await this.createSessionForUser(
      user._id,
      rememberMe,
      userAgent
    );

    return {
      user: this.sanitizeUser(user),
      session,
    };
  }

  async getUserFromSessionToken(token) {
    if (!token) return null;
    const repo = await this.getRepository();
    await repo.clearExpiredSessions(new Date());

    const tokenHash = this.hashToken(token);
    const user = await repo.findBySessionTokenHash(tokenHash, new Date());
    return this.sanitizeUser(user);
  }

  async signout(token) {
    if (!token) return true;
    const repo = await this.getRepository();
    const tokenHash = this.hashToken(token);
    await repo.removeSessionByTokenHash(tokenHash);
    return true;
  }

  async forgotPassword({ username, newPassword }) {
    const normalizedUsername = this.normalizeUsername(username);
    if (!normalizedUsername) {
      throw new ValidationError("Username is required");
    }

    this.validatePassword(newPassword);

    const repo = await this.getRepository();
    const existingUser = await repo.findByUsername(normalizedUsername);
    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    const { salt, hash } = this.hashPassword(String(newPassword));
    await repo.updatePasswordByUsername(normalizedUsername, salt, hash);
    return true;
  }
}

module.exports = {
  AuthService,
  MIN_PASSWORD_LENGTH,
  SESSION_COOKIE_NAME,
};
