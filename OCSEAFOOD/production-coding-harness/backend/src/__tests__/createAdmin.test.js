const {
  main,
  parseAdminInput,
  upsertAdmin,
} = require('../../create-admin');

describe('Admin account bootstrap', () => {
  const validInput = {
    ADMIN_EMAIL: 'Admin@OCSEAFOOD.vn',
    ADMIN_PASSWORD: 'a-strong-local-password',
    ADMIN_NAME: 'Local Admin',
  };

  it('requires a valid email and a password of at least 12 characters', () => {
    expect(() => parseAdminInput({ ADMIN_EMAIL: 'invalid', ADMIN_PASSWORD: 'short' }))
      .toThrow('Invalid Admin account configuration');
  });

  it('normalizes input without exposing the password in errors or output', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(({ data }) => Promise.resolve({ id: 1, ...data })),
      },
      $disconnect: jest.fn().mockResolvedValue(undefined),
    };
    const passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
    };
    const output = { log: jest.fn() };

    const result = await main({
      runtimeEnv: validInput,
      prisma,
      passwordHasher,
      output,
    });

    expect(result.action).toBe('created');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'admin@ocseafood.vn',
        password: 'hashed-password',
        name: 'Local Admin',
        role: 'ADMIN',
      },
    });
    expect(output.log.mock.calls.flat().join(' ')).not.toContain(validInput.ADMIN_PASSWORD);
    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('updates and promotes an existing account instead of creating a duplicate', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          email: 'admin@ocseafood.vn',
          role: 'CUSTOMER',
        }),
        create: jest.fn(),
        update: jest.fn(({ data }) => Promise.resolve({
          id: 7,
          email: 'admin@ocseafood.vn',
          ...data,
        })),
      },
    };
    const passwordHasher = { hash: jest.fn().mockResolvedValue('new-hash') };

    const result = await upsertAdmin(
      prisma,
      parseAdminInput(validInput),
      passwordHasher
    );

    expect(result.action).toBe('updated');
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'admin@ocseafood.vn' },
      data: {
        password: 'new-hash',
        name: 'Local Admin',
        role: 'ADMIN',
      },
    });
  });
});
