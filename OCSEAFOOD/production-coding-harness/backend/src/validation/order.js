const { z } = require('zod');

const OrderUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
  note: z.string().optional(),
  totalFinal: z.number().positive('Total final must be positive').optional(),
  items: z.array(
    z.object({
      id: z.number().int().positive('Item ID must be a positive integer'),
      quantity: z.number().int().positive('Quantity must be a positive integer'),
      priceFinal: z.number().nonnegative('Price final must be non-negative').optional(),
    })
  ).optional(),
});

module.exports = {
  OrderUpdateSchema,
};
