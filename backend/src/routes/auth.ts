import { Router } from 'express';
import { authService, emailService, cloudinaryService } from '../services';
import { validateBody, asyncHandler, AuthRequest, verifyAccessToken, createError } from '../middleware';
import { registerSchema, loginSchema, refreshSchema } from '../utils/validationSchemas';
import { User } from '../models';
import multer from 'multer';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/auth/register
router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    
    const { user, tokens } = await authService.register(name, email, password);
    
    // Create verification token and send email
    const verificationToken = await authService.createVerificationToken(
      user._id.toString(),
      email
    );
    
    emailService.sendVerificationEmail(email, name, verificationToken).catch((error) => {
      console.error('Failed to send verification email:', error);
    });
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        tokens,
      },
    });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const { user, tokens } = await authService.login(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        tokens,
      },
    });
  })
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  validateBody(refreshSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    const tokens = await authService.refresh(refreshToken);
    
    res.json({
      success: true,
      message: 'Tokens refreshed',
      data: { tokens },
    });
  })
);

// POST /api/auth/logout
router.post(
  '/logout',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    await authService.logout(req.user!._id.toString());
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = req.user!;
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
    });
  })
);

// POST /api/auth/verify-email - Verify email address
router.post(
  '/verify-email',
  asyncHandler(async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
      throw createError('Verification token is required', 400);
    }
    
    const user = await authService.verifyEmail(token);
    
    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  })
);

// PUT /api/auth/profile - Update own profile
router.put(
  '/profile',
  verifyAccessToken,
  upload.single('avatar'),
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    const { name } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }
    
    if (name) user.name = name;
    
    // Handle avatar upload
    if (req.file) {
      const result = await cloudinaryService.uploadImage(req.file.buffer, 'avatars');
      user.avatarUrl = result.url;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
    });
  })
);

// PUT /api/auth/password - Change password (logged in user)
router.put(
  '/password',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw createError('Current password and new password are required', 400);
    }
    
    if (newPassword.length < 6) {
      throw createError('New password must be at least 6 characters', 400);
    }
    
    await authService.changePassword(userId.toString(), currentPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

// POST /api/auth/forgot-password - Request password reset email
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      throw createError('Email is required', 400);
    }
    
    const result = await authService.createPasswordResetToken(email);
    
    // Send email if user exists (but don't reveal if email exists)
    if (result) {
      emailService.sendPasswordResetEmail(result.user.email, result.user.name, result.token).catch((error) => {
        console.error('Failed to send password reset email:', error);
      });
    }
    
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  })
);

// POST /api/auth/reset-password - Reset password with token
router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      throw createError('Token and new password are required', 400);
    }
    
    if (newPassword.length < 6) {
      throw createError('Password must be at least 6 characters', 400);
    }
    
    const user = await authService.resetPassword(token, newPassword);
    
    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
      data: {
        user: {
          id: user._id,
          email: user.email,
        },
      },
    });
  })
);

export default router;
