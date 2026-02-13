const { ObjectId } = require("mongodb");
const logger = require("../../utils/logger");
const { DatabaseError } = require("../../middleware/error-handler.middleware");

class UserRepository {
  constructor(db) {
    this.collection = db.collection("users");
  }

  async findByUsername(username) {
    try {
      return await this.collection.findOne({ username });
    } catch (error) {
      logger.error("Error finding user by username:", error);
      throw new DatabaseError("Failed to fetch user");
    }
  }

  async findById(userId) {
    try {
      return await this.collection.findOne({ _id: new ObjectId(userId) });
    } catch (error) {
      logger.error("Error finding user by id:", error);
      throw new DatabaseError("Failed to fetch user");
    }
  }

  async createUser(payload) {
    try {
      const result = await this.collection.insertOne(payload);
      return await this.findById(result.insertedId);
    } catch (error) {
      logger.error("Error creating user:", error);

      if (error && error.code === 11000) {
        throw new DatabaseError("Username already exists");
      }

      throw new DatabaseError("Failed to create user");
    }
  }

  async addSession(userId, session, maxSessions = 5) {
    try {
      const objectId = new ObjectId(userId);

      await this.collection.updateOne(
        { _id: objectId },
        {
          $push: {
            sessions: {
              $each: [session],
              $slice: -Math.max(1, maxSessions),
            },
          },
          $set: {
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      return true;
    } catch (error) {
      logger.error("Error adding user session:", error);
      throw new DatabaseError("Failed to persist session");
    }
  }

  async findBySessionTokenHash(tokenHash, now = new Date()) {
    try {
      return await this.collection.findOne({
        sessions: {
          $elemMatch: {
            tokenHash,
            expiresAt: { $gt: now },
          },
        },
      });
    } catch (error) {
      logger.error("Error finding user by session token:", error);
      throw new DatabaseError("Failed to fetch session");
    }
  }

  async removeSessionByTokenHash(tokenHash) {
    try {
      await this.collection.updateMany(
        { "sessions.tokenHash": tokenHash },
        {
          $pull: { sessions: { tokenHash } },
          $set: { updatedAt: new Date() },
        }
      );
      return true;
    } catch (error) {
      logger.error("Error removing session:", error);
      throw new DatabaseError("Failed to remove session");
    }
  }

  async clearExpiredSessions(now = new Date()) {
    try {
      await this.collection.updateMany(
        { "sessions.expiresAt": { $lte: now } },
        {
          $pull: { sessions: { expiresAt: { $lte: now } } },
          $set: { updatedAt: new Date() },
        }
      );
      return true;
    } catch (error) {
      logger.error("Error clearing expired sessions:", error);
      throw new DatabaseError("Failed to cleanup sessions");
    }
  }

  async updatePasswordByUsername(username, passwordSalt, passwordHash) {
    try {
      await this.collection.updateOne(
        { username },
        {
          $set: {
            passwordSalt,
            passwordHash,
            updatedAt: new Date(),
          },
          $pull: { sessions: {} },
        }
      );

      return true;
    } catch (error) {
      logger.error("Error updating password:", error);
      throw new DatabaseError("Failed to update password");
    }
  }
}

module.exports = UserRepository;
