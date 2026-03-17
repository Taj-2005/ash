const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive').max(9999),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  isAvailable: z.boolean().default(true),
  popular: z.boolean().default(false),
});

const checkoutSchema = z.object({
  totalAmount: z.number().positive('Total amount must be positive'),
  items: z.array(z.object({
    menuItemId: z.number().int().positive(),
    quantity: z.number().int().positive('Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
});

const confirmOrderSchema = z.object({
  totalAmount: z.number().positive('Total amount must be positive'),
  items: z.array(z.object({
    menuItemId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })).min(1, 'At least one item is required'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
  menuItemSchema,
  checkoutSchema,
  confirmOrderSchema,
  updateOrderStatusSchema,
};