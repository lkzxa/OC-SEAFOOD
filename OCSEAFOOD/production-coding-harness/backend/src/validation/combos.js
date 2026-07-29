const { z } = require('zod');

const ComboSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be greater than 0').optional().nullable(),
  originalPrice: z.number().positive('Original price must be greater than 0').optional().nullable(),
  showContact: z.boolean().default(false),
  image: z.string().min(1, 'Image is required'),
  tag: z.string().optional().nullable(),
  discountBadge: z.string().optional().nullable(),
  items: z.array(z.string().min(1, 'Item content cannot be empty')).min(1, 'Combo must contain at least one item'),
  isVisible: z.boolean().default(true),
});

module.exports = {
  ComboSchema,
};
