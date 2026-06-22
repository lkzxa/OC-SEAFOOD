const { z } = require('zod');
const { vietnamesePhone } = require('./shared');

const RecruitmentSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: vietnamesePhone,
  email: z.string().email('Invalid email format'),
  position: z.string().min(1, 'Position is required'),
  intro: z.string().optional().nullable(),
});

module.exports = {
  RecruitmentSchema,
};
