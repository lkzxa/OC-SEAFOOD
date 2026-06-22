const { z } = require('zod');
const { vietnamesePhone } = require('./shared');

const CheckoutSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phone: vietnamesePhone,
  province: z.string().min(1, 'Province/City is required'),
  district: z.string().min(1, 'District is required'),
  ward: z.string().min(1, 'Ward/Commune is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  note: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.number().int().positive('Product ID must be a positive integer'),
      quantity: z.number().int().positive('Quantity must be a positive integer'),
      selectedWeight: z.string().optional(),
    })
  ).min(1, 'At least one item is required'),
});

module.exports = {
  CheckoutSchema,
};
