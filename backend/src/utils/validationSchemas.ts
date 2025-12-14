import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const createSweetSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(1).max(50),
  description: z.string().max(1000),
  price: z.number().positive().or(z.string().transform(Number)),
  quantity: z.number().int().min(0).optional().or(z.string().transform(Number).optional()),
  isActive: z.boolean().optional().or(z.string().transform(v => v === 'true').optional()),
});

export const updateSweetSchema = createSweetSchema.partial();

export const searchSweetsSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('12'),
});

export const restockSchema = z.object({
  quantity: z.number().int().positive(),
  note: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      sweetId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).min(1),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  role: z.enum(['user', 'admin']).optional(),
  isVerified: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSweetInput = z.infer<typeof createSweetSchema>;
export type UpdateSweetInput = z.infer<typeof updateSweetSchema>;
export type SearchSweetsInput = z.infer<typeof searchSweetsSchema>;
export type RestockInput = z.infer<typeof restockSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
