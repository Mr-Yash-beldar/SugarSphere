import { Router } from 'express';
import { Notification } from '../models';
import { verifyAccessToken, asyncHandler, AuthRequest, createError } from '../middleware';

const router = Router();

// GET /api/notifications - Get user's notifications
router.get(
  '/',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  })
);

// POST /api/notifications/read/:id - Mark notification as read
router.post(
  '/read/:id',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      throw createError('Notification not found', 404);
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  })
);

// POST /api/notifications/read-all - Mark all notifications as read
router.post(
  '/read-all',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    
    await Notification.updateMany({ userId, read: false }, { read: true });
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  })
);

export default router;
