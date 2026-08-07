const { z } = require('zod');

const JobOpeningSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  salary: z.string().min(1, 'Salary is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string().min(1, 'Requirement content cannot be empty')).min(1, 'Job opening must contain at least one requirement'),
  isVisible: z.boolean().default(true),
});

module.exports = {
  JobOpeningSchema,
};
