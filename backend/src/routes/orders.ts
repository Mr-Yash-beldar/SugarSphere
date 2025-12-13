import { Router } from 'express';
import mongoose from 'mongoose';
import { Order, Sweet, InventoryTransaction, Notification, User } from '../models';
import { paymentService, emailService } from '../services';
import { 
  verifyAccessToken, 
  requireRole,
  asyncHandler, 
  AuthRequest,
  validateBody,
  createError
} from '../middleware';
import { createOrderSchema, verifyPaymentSchema } from '../utils/validationSchemas';

const router = Router();

// POST /api/orders/create - Create new order
router.post(
  '/create',
  verifyAccessToken,
  validateBody(createOrderSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { items } = req.body;
    const userId = req.user!._id;
    
    // Fetch sweets and validate availability
    const sweetIds = items.map((item: any) => item.sweetId);
    const sweets = await Sweet.find({ _id: { $in: sweetIds }, isActive: true });
    
    if (sweets.length !== sweetIds.length) {
      throw createError('Some sweets are not available', 400);
    }
    
    // Build order items and calculate total
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const sweet = sweets.find(s => s._id.toString() === item.sweetId);
      if (!sweet) {
        throw createError(`Sweet ${item.sweetId} not found`, 400);
      }
      if (sweet.quantity < item.quantity) {
        throw createError(`Insufficient stock for ${sweet.name}`, 400);
      }
      
      const subtotal = sweet.price * item.quantity;
      totalAmount += subtotal;
      
      return {
        sweetId: sweet._id,
        name: sweet.name,
        unitPrice: sweet.price,
        quantity: item.quantity,
        subtotal,
      };
    });
    
    // Create Razorpay order
    console.log('Creating Razorpay order for user:', userId, 'Total amount:', totalAmount);
    const razorpayOrder = await paymentService.createOrder({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: userId.toString(),
      },
    });
    
    // Create order in database
    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      currency: 'INR',
      status: 'created',
      razorpayOrderId: razorpayOrder.id,
    });
    
    console.log('Order created in database:', order._id);
    
    // Send real-time notification to admin about new order
    try {
      const { socketEvents } = await import('../sockets');
      const populatedOrder = await Order.findById(order._id).populate('userId', 'name email');
      socketEvents.newOrder(populatedOrder);
    } catch (error) {
      console.error('Failed to send socket notification:', error);
    }
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        currency: 'INR',
        items: orderItems,
      },
    });
  })
);

// POST /api/orders/verify - Verify payment and complete order
router.post(
  '/verify',
  verifyAccessToken,
  validateBody(verifyPaymentSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user!._id;
    
    const order = await Order.findOne({ _id: orderId, userId });
    
    if (!order) {
      throw createError('Order not found', 404);
    }
    
    if (order.status !== 'created') {
      throw createError('Order already processed', 400);
    }
    
    // Verify signature
    const isValid = paymentService.verifyPaymentSignature(
      order.razorpayOrderId!,
      razorpayPaymentId,
      razorpaySignature
    );
    
    if (!isValid) {
      order.status = 'failed';
      await order.save();
      throw createError('Payment verification failed', 400);
    }
    
    // Start a session for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Decrement inventory atomically
      for (const item of order.items) {
        const result = await Sweet.findOneAndUpdate(
          { _id: item.sweetId, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { session, new: true }
        );
        
        if (!result) {
          throw createError(`Insufficient stock for ${item.name}`, 400);
        }
        
        // Record inventory transaction
        await InventoryTransaction.create([{
          sweetId: item.sweetId,
          userId,
          type: 'purchase',
          quantityChange: -item.quantity,
          note: `Order ${order._id}`,
        }], { session });
        
        // Check for low stock and notify admin
        if (result.quantity <= 10) {
          const admins = await User.find({ role: 'admin' });
          for (const admin of admins) {
            await Notification.create([{
              userId: admin._id,
              type: 'inventory',
              title: 'Low Stock Alert',
              message: `${result.name} is running low (${result.quantity} left)`,
            }], { session });
          }
        }
      }
      
      // Update order
      order.status = 'paid';
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;
      await order.save({ session });
      
      // Create notification for user
      await Notification.create([{
        userId,
        type: 'order',
        title: 'Order Confirmed',
        message: `Your order #${order._id} has been confirmed!`,
      }], { session });
      
      await session.commitTransaction();
      
      // Send invoice email after successful payment
      try {
        const user = await User.findById(userId);
        if (user) {
          await emailService.sendInvoiceEmail(
            user.email,
            user.name,
            order._id.toString(),
            razorpayPaymentId,
            order.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
            order.totalAmount,
            order.createdAt
          );
          console.log('Invoice email sent to:', user.email);
        }
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
        // Don't fail the order if email fails
      }
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          status: 'paid',
          order,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  })
);

// GET /api/orders/my - Get current user's orders with pagination
router.get(
  '/my',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    const query: any = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.json({
      success: true,
      data: {
        orders,
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

// GET /api/orders - Get user's orders
router.get(
  '/',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    const isAdmin = req.user!.role === 'admin';
    
    const query = isAdmin ? {} : { userId };
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: orders,
    });
  })
);

// GET /api/orders/:id - Get single order
router.get(
  '/:id',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    const isAdmin = req.user!.role === 'admin';
    
    const query: any = { _id: req.params.id };
    if (!isAdmin) {
      query.userId = userId;
    }
    
    const order = await Order.findOne(query);
    
    if (!order) {
      throw createError('Order not found', 404);
    }
    
    res.json({
      success: true,
      data: order,
    });
  })
);

// POST /api/orders/:id/cancel - Cancel order
router.post(
  '/:id/cancel',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    const isAdmin = req.user!.role === 'admin';
    
    const query: any = { _id: req.params.id };
    if (!isAdmin) {
      query.userId = userId;
    }
    
    const order = await Order.findOne(query);
    
    if (!order) {
      throw createError('Order not found', 404);
    }
    
    if (order.status !== 'created') {
      throw createError('Only pending orders can be cancelled', 400);
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  })
);

// Admin routes
// GET /api/orders/admin/all - Get all orders (admin only)
router.get(
  '/admin/all',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (_req, res) => {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: orders,
    });
  })
);

// PATCH /api/orders/admin/:id/status - Update order status (admin only)
router.put(
  '/admin/:id/status',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { status } = req.body;
    const orderId = req.params.id;
    
    const validStatuses = ['paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw createError('Invalid status', 400);
    }
    
    const order = await Order.findById(orderId).populate('userId', 'name email');
    
    if (!order) {
      throw createError('Order not found', 404);
    }
    
    const oldStatus = order.status;
    order.status = status;
    await order.save();
    
    // Get user details
    const user = order.userId as any;
    
    // Create notification for user
    await Notification.create({
      userId: user._id,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order #${orderId} status changed to: ${status}`,
    });
    
    // Send email notification
    const { emailService } = await import('../services');
    const statusMessages: Record<string, string> = {
      paid: 'Your payment has been confirmed.',
      processing: 'Your order is being processed and will be shipped soon.',
      shipped: 'Your order has been shipped and is on its way!',
      delivered: 'Your order has been delivered. Enjoy your sweets!',
      cancelled: 'Your order has been cancelled.',
    };
    
    emailService.sendOrderStatusUpdate(
      user.email,
      user.name,
      orderId,
      status,
      statusMessages[status] || 'Your order status has been updated.'
    ).catch((error) => {
      console.error('Failed to send order status email:', error);
    });
    
    // Send real-time notification via socket
    const { getIO } = await import('../sockets');
    const io = getIO();
    if (io) {
      io.to(`user:${user._id}`).emit('order-status-update', {
        orderId,
        status,
        message: statusMessages[status],
      });
    }
    
    res.json({
      success: true,
      message: `Order status updated from ${oldStatus} to ${status}`,
      data: order,
    });
  })
);

export default router;
