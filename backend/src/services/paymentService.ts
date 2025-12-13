import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export interface RazorpayOrderOptions {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export const paymentService = {
  async createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
    try {
      console.log('Creating Razorpay order with options:', {
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
      });
      
      const order = await razorpay.orders.create({
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        notes: options.notes,
      });
      
      console.log('Razorpay order created successfully:', order.id);
      return order as RazorpayOrder;
    } catch (error: any) {
      console.error('Razorpay order creation failed:', {
        message: error.message,
        statusCode: error.statusCode,
        description: error.error?.description,
      });
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  },

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body)
      .digest('hex');
    
    return expectedSignature === signature;
  },

  async fetchPayment(paymentId: string) {
    try {
      return await razorpay.payments.fetch(paymentId);
    } catch (error) {
      console.error('Failed to fetch payment:', error);
      throw error;
    }
  },

  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refundOptions: Record<string, unknown> = {};
      if (amount) {
        refundOptions.amount = amount;
      }
      
      return await razorpay.payments.refund(paymentId, refundOptions);
    } catch (error) {
      console.error('Refund failed:', error);
      throw error;
    }
  },
};
