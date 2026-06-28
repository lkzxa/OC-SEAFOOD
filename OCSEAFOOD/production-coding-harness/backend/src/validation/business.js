const { z } = require('zod');

// Slug format validation regex
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required').regex(SLUG_REGEX, 'Invalid slug format'),
  description: z.string().optional().nullable(),
});

const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required').regex(SLUG_REGEX, 'Invalid slug format'),
  description: z.string().min(1, 'Description is required'),
  detailDescription: z.string().optional().nullable(),
  image: z.string().min(1, 'Image is required'),
  unit: z.string().min(1, 'Unit is required'),
  priceReference: z.number().positive('Price reference must be positive').optional().nullable(),
  showContact: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  categoryId: z.number().int().positive('Category ID must be a positive integer'),
  weightOptions: z.array(z.string()).optional(),
});

const BlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(SLUG_REGEX, 'Invalid slug format'),
  content: z.string().min(1, 'Content is required'),
  image: z.string().optional().nullable(),
  isVisible: z.boolean().default(true),
  metaTitle: z.string().max(100, 'Meta title limit 100 chars').optional().nullable(),
  metaDescription: z.string().max(255, 'Meta description limit 255 chars').optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  imageAlt: z.string().optional().nullable(),
});

module.exports = {
  CategorySchema,
  ProductSchema,
  BlogPostSchema,
};
