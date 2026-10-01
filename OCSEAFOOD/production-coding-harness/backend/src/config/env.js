const dotenv = require('dotenv');
const { z } = require('zod');
const path = require('path');

// Load environment variables from .env file (if present)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long').default(
    process.env.NODE_ENV === 'test' ? 'testsecret-testsecret-testsecret-testsecret' : undefined
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
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:3000'),
  CORS_ORIGIN: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  RECRUITMENT_TELEGRAM_BOT_TOKEN: z.string().optional(),
  RECRUITMENT_TELEGRAM_CHAT_ID: z.string().optional(),
  ZALO_OA_ACCESS_TOKEN: z.string().optional(),
  ZALO_USER_ID: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  ALLOW_ADMIN_PASSWORD_LOGIN: z.string().optional().transform((val) => val === 'true'),
  MEDIA_PROVIDER: z.enum(['local', 'cloudinary']).default('local'),
  MEDIA_ROOT: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NOTIFICATION_WORKER_INTERVAL_MS: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10000),
  MAX_NOTIFICATION_RETRIES: z.string().optional().transform((val) => val ? parseInt(val, 10) : 5),
  HEALTHCHECK_TIMEOUT_MS: z.coerce.number().int().min(100).max(30000).default(2000),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(10000),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  const error = new Error(`Invalid environment configuration: ${details}`);
  error.code = 'INVALID_ENVIRONMENT';
  throw error;
}

module.exports = result.data;
