import { Router, Request, Response } from 'express';
import { Order } from '../models';
import { paymentService } from '../services';

const router = Router();

// POST /api/webhooks/razorpay - Handle Razorpay webhooks
// Note: Webhook signature verification is disabled since webhook secret is not configured
router.post('/razorpay', async (req: Request, res: Response): Promise<void> => {
  try {
    // Webhook signature verification skipped (webhook secret not available)
    // In production, you should enable signature verification for security
    
    const event = req.body;
    console.log('Webhook event:', event.event);
    
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const order = await Order.findOne({ 
          razorpayOrderId: payment.order_id 
        });
        
        if (order && order.status === 'created') {
          order.status = 'paid';
          order.razorpayPaymentId = payment.id;
          await order.save();
          console.log(`Order ${order._id} marked as paid via webhook`);
        }
        break;
      }
      
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const order = await Order.findOne({ 
          razorpayOrderId: payment.order_id 
        });
        
        if (order && order.status === 'created') {
          order.status = 'failed';
          await order.save();
          console.log(`Order ${order._id} marked as failed via webhook`);
        }
        break;
      }
      
      case 'refund.created': {
        const refund = event.payload.refund.entity;
        const order = await Order.findOne({ 
          razorpayPaymentId: refund.payment_id 
        });
        
        if (order) {
          order.status = 'refunded';
          await order.save();
          console.log(`Order ${order._id} marked as refunded via webhook`);
        }
        break;
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
