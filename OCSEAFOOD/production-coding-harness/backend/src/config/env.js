const dotenv = require('dotenv');
const { z } = require('zod');
const path = require('path');

// Load environment variables from .env file (if present)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required').default(
    process.env.NODE_ENV === 'test' ? 'testsecret' : undefined
  ),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string').default(
    process.env.NODE_ENV === 'test' ? 'postgresql://mockuser:mockpass@localhost:5432/mockdb' : undefined
  ),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional().transform((val) => val ? parseInt(val, 10) : 587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.string().optional().transform((val) => val === 'true'),
  EMAIL_FROM: z.string().default('no-reply@ocseafood.com'),
  EMAIL_TO_ADMIN: z.string().default('admin@ocseafood.com'),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  ZALO_OA_ACCESS_TOKEN: z.string().optional(),
  ZALO_USER_ID: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  NOTIFICATION_WORKER_INTERVAL_MS: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10000),
  MAX_NOTIFICATION_RETRIES: z.string().optional().transform((val) => val ? parseInt(val, 10) : 5),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

module.exports = result.data;
