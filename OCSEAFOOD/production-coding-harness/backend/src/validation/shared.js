const { z } = require('zod');

// Regex for Vietnamese mobile numbers (starts with 0, 84, or +84 followed by 9 mobile prefix digits starting with 3, 5, 7, 8, 9)
const VIETNAMESE_PHONE_REGEX = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/;

const vietnamesePhone = z
  .string()
  .min(1, 'Phone number is required')
  .regex(VIETNAMESE_PHONE_REGEX, 'Invalid Vietnamese phone number format');

const threeLevelAddress = z.object({
  province: z.string().min(1, 'Province/City is required'),
  district: z.string().min(1, 'District is required'),
  ward: z.string().min(1, 'Ward/Commune is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
});

module.exports = {
  vietnamesePhone,
  threeLevelAddress,
};
