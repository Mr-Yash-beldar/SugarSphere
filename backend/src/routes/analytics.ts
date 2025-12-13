import { Router } from 'express';
import { Order, Sweet, User } from '../models';
import { verifyAccessToken, requireRole, asyncHandler } from '../middleware';

const router = Router();

// GET /api/analytics/overview - Get analytics overview (admin only)
router.get(
  '/overview',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (_req, res) => {
    // Include all completed order statuses (paid, processing, shipped, delivered)
    const completedStatuses = ['paid', 'processing', 'shipped', 'delivered'];
    
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalSweets,
      pendingOrders,
      lowStockItems,
    ] = await Promise.all([
      Order.countDocuments({ status: { $in: completedStatuses } }),
      Order.aggregate([
        { $match: { status: { $in: completedStatuses } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      User.countDocuments({ role: 'user' }),
      Sweet.countDocuments({ isActive: true }),
      Order.countDocuments({ status: 'created' }),
      Sweet.countDocuments({ isActive: true, quantity: { $lte: 10 } }),
    ]);
    
    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers,
        totalSweets,
        pendingOrders,
        lowStockItems,
      },
    });
  })
);

// GET /api/analytics/top-sweets - Get top selling sweets (admin only)
router.get(
  '/top-sweets',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (_req, res) => {
    const completedStatuses = ['paid', 'processing', 'shipped', 'delivered'];
    const topSweets = await Order.aggregate([
      { $match: { status: { $in: completedStatuses } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.sweetId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);
    
    res.json({
      success: true,
      data: topSweets,
    });
  })
);

// GET /api/analytics/revenue - Get revenue data (admin only)
router.get(
  '/revenue',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (req, res) => {
    const range = (req.query.range as string) || '7d';
    const completedStatuses = ['paid', 'processing', 'shipped', 'delivered'];
    
    let startDate: Date;
    const endDate = new Date();
    
    switch (range) {
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: completedStatuses },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    res.json({
      success: true,
      data: {
        range,
        revenueData,
      },
    });
  })
);

// GET /api/analytics/inventory - Get inventory analytics (admin only)
router.get(
  '/inventory',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (_req, res) => {
    const inventoryData = await Sweet.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          name: 1,
          category: 1,
          quantity: 1,
          price: 1,
          stockValue: { $multiply: ['$quantity', '$price'] },
          stockStatus: {
            $cond: {
              if: { $lte: ['$quantity', 0] },
              then: 'out_of_stock',
              else: {
                $cond: {
                  if: { $lte: ['$quantity', 10] },
                  then: 'low_stock',
                  else: 'in_stock',
                },
              },
            },
          },
        },
      },
      { $sort: { quantity: 1 } },
    ]);
    
    const summary = await Sweet.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          avgPrice: { $avg: '$price' },
        },
      },
    ]);
    
    res.json({
      success: true,
      data: {
        inventory: inventoryData,
        summary: summary[0] || { totalItems: 0, totalValue: 0, avgPrice: 0 },
      },
    });
  })
);

export default router;
