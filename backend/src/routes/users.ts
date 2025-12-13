import { Router } from 'express';
import { User, AuditLog } from '../models';
import { 
  verifyAccessToken, 
  requireRole, 
  asyncHandler, 
  AuthRequest,
  validateBody,
  createError
} from '../middleware';
import { updateUserSchema } from '../utils/validationSchemas';

const router = Router();

// GET /api/users - Get all users with pagination (admin only)
router.get(
  '/',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    
    const query: any = {};
    if (role) {
      query.role = role;
    }
    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash -refreshTokenHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// GET /api/users/:id - Get user by ID (admin only)
router.get(
  '/:id',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select('-passwordHash -refreshTokenHash');
    
    if (!user) {
      throw createError('User not found', 404);
    }
    
    res.json({
      success: true,
      data: user,
    });
  })
);

// PUT /api/users/:id - Update user (admin only)
router.put(
  '/:id',
  verifyAccessToken,
  requireRole(['admin']),
  validateBody(updateUserSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw createError('User not found', 404);
    }
    
    const before = user.toObject();
    
    // Update allowed fields
    const { name, role, isVerified } = req.body;
    if (name) user.name = name;
    if (role) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    
    await user.save();
    
    // Create audit log
    await AuditLog.create({
      actorUserId: req.user!._id,
      action: 'update',
      resourceType: 'user',
      resourceId: user._id,
      before,
      after: user.toObject(),
    });
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  })
);

// PUT /api/users/:id/role - Update user role (admin only)
router.put(
  '/:id/role',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      throw createError('Invalid role', 400);
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw createError('User not found', 404);
    }
    
    // Prevent changing own role
    if (user._id.toString() === req.user!._id.toString()) {
      throw createError('Cannot change your own role', 400);
    }
    
    const before = user.toObject();
    user.role = role;
    await user.save();
    
    // Create audit log
    await AuditLog.create({
      actorUserId: req.user!._id,
      action: 'update',
      resourceType: 'user',
      resourceId: user._id,
      before,
      after: user.toObject(),
    });
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  })
);

// PUT /api/users/:id/status - Toggle user active status (block/unblock) (admin only)
router.put(
  '/:id/status',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      throw createError('isActive must be a boolean', 400);
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw createError('User not found', 404);
    }
    
    // Prevent blocking self
    if (user._id.toString() === req.user!._id.toString()) {
      throw createError('Cannot block your own account', 400);
    }
    
    const before = user.toObject();
    user.isActive = isActive;
    
    // If blocking, also clear refresh token to force logout
    if (!isActive) {
      user.refreshTokenHash = undefined;
    }
    
    await user.save();
    
    // Create audit log
    await AuditLog.create({
      actorUserId: req.user!._id,
      action: isActive ? 'unblock' : 'block',
      resourceType: 'user',
      resourceId: user._id,
      before,
      after: user.toObject(),
    });
    
    res.json({
      success: true,
      message: `User ${isActive ? 'unblocked' : 'blocked'} successfully`,
      data: user,
    });
  })
);

export default router;
