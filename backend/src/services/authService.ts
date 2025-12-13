import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config';
import { User, IUser, EmailVerification, PasswordReset } from '../models';

interface TokenPayload {
  userId: string;
  role: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  generateTokens(user: IUser): Tokens {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  },

  async hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  },

  async verifyRefreshToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  },

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
  },

  verifyRefreshTokenJWT(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  },

  async register(name: string, email: string, password: string): Promise<{ user: IUser; tokens: Tokens }> {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: password,
    });

    const tokens = this.generateTokens(user);
    user.refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
    
    await user.save();

    return { user, tokens };
  },

  async login(email: string, password: string): Promise<{ user: IUser; tokens: Tokens }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is blocked
    if (user.isActive === false) {
      throw new Error('Your account has been blocked. Please contact admin for assistance.');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    user.refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  },

  async refresh(refreshToken: string): Promise<Tokens> {
    const decoded = this.verifyRefreshTokenJWT(refreshToken);
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokenHash) {
      throw new Error('Invalid refresh token');
    }

    const isValid = await this.verifyRefreshToken(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new Error('Invalid refresh token');
    }

    const tokens = this.generateTokens(user);
    user.refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
    await user.save();

    return tokens;
  },

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  },

  async createVerificationToken(userId: string, email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    await EmailVerification.create({
      userId,
      email,
      token,
      expiresAt,
    });

    return token;
  },

  async verifyEmail(token: string): Promise<IUser> {
    const verification = await EmailVerification.findOne({ token });
    
    if (!verification) {
      throw new Error('Invalid or expired verification token');
    }

    if (verification.expiresAt < new Date()) {
      await EmailVerification.deleteOne({ _id: verification._id });
      throw new Error('Verification token has expired');
    }

    const user = await User.findById(verification.userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isVerified = true;
    await user.save();

    // Delete the verification token
    await EmailVerification.deleteOne({ _id: verification._id });

    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    await user.save();
  },

  async createPasswordResetToken(email: string): Promise<{ token: string; user: IUser } | null> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return null; // Don't reveal if email exists
    }

    // Invalidate any existing tokens for this user
    await PasswordReset.updateMany({ userId: user._id, isUsed: false }, { isUsed: true });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    await PasswordReset.create({
      userId: user._id,
      email: user.email,
      token,
      expiresAt,
    });

    return { token, user };
  },

  async resetPassword(token: string, newPassword: string): Promise<IUser> {
    const resetRecord = await PasswordReset.findOne({ token, isUsed: false });
    
    if (!resetRecord) {
      throw new Error('Invalid or expired reset token');
    }

    if (resetRecord.expiresAt < new Date()) {
      await PasswordReset.updateOne({ _id: resetRecord._id }, { isUsed: true });
      throw new Error('Reset token has expired');
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    await user.save();

    // Mark token as used
    resetRecord.isUsed = true;
    await resetRecord.save();

    return user;
  },
};
