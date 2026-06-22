const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/hash');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { z } = require('zod');

// Protect all routes under /users with auth & authorize('ADMIN')
router.use(auth, authorize('ADMIN'));

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['CUSTOMER', 'ADMIN']),
});

const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  name: z.string().min(1, 'Name is required').optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
});

// GET / - List users with query search, role filter, pagination
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 100;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const where = {};

    if (role === 'ADMIN' || role === 'CUSTOMER') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    const totalItems = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json({
      data: users,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST / - Create a new user (customer or admin)
router.post('/', async (req, res, next) => {
  try {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          status: 400,
          details: parsed.error.format()
        }
      });
    }

    const { email, password, name, role } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        error: {
          message: 'Email is already registered',
          status: 400
        }
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - Update user details (including role or optional password)
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: {
          message: 'Invalid user ID',
          status: 400
        }
      });
    }

    const parsed = UpdateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          status: 400,
          details: parsed.error.format()
        }
      });
    }

    const { email, password, name, role } = parsed.data;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    // Check if new email is taken
    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({
          error: {
            message: 'Email is already registered',
            status: 400
          }
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;

    if (password) {
      updateData.password = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - Delete user (prevent self-deletion)
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: {
          message: 'Invalid user ID',
          status: 400
        }
      });
    }

    if (id === req.user.id) {
      return res.status(400).json({
        error: {
          message: 'You cannot delete your own account',
          status: 400
        }
      });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    await prisma.user.delete({ where: { id } });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
