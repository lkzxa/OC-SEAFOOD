const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const AdminInputSchema = z.object({
  ADMIN_EMAIL: z.string().trim().email('ADMIN_EMAIL must be a valid email address'),
  ADMIN_PASSWORD: z.string()
    .min(12, 'ADMIN_PASSWORD must contain at least 12 characters')
    .max(128, 'ADMIN_PASSWORD must contain at most 128 characters'),
  ADMIN_NAME: z.string().trim().min(1).max(100).default('Quản trị viên OCSEAFOOD'),
});

function parseAdminInput(runtimeEnv = process.env) {
  const result = AdminInputSchema.safeParse(runtimeEnv);
  if (result.success) return {
    email: result.data.ADMIN_EMAIL.toLowerCase(),
    password: result.data.ADMIN_PASSWORD,
    name: result.data.ADMIN_NAME,
  };

  const details = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid Admin account configuration: ${details}`);
}

async function upsertAdmin(prisma, input, passwordHasher = bcrypt) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  const password = await passwordHasher.hash(input.password, 12);

  if (!existing) {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password,
        name: input.name,
        role: 'ADMIN',
      },
    });
    return { action: 'created', user };
  }

  const user = await prisma.user.update({
    where: { email: input.email },
    data: {
      password,
      name: input.name,
      role: 'ADMIN',
    },
  });
  return { action: 'updated', user };
}

async function main(options = {}) {
  const runtimeEnv = options.runtimeEnv || process.env;
  const output = options.output || console;
  const input = parseAdminInput(runtimeEnv);
  const prisma = options.prisma || new (require('@prisma/client').PrismaClient)();

  try {
    const result = await upsertAdmin(prisma, input, options.passwordHasher || bcrypt);
    output.log(`Admin account ${result.action}: ${result.user.email}`);
    output.log('Admin password was accepted from the process environment and was not printed.');
    return result;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  AdminInputSchema,
  main,
  parseAdminInput,
  upsertAdmin,
};
