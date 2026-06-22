const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateBody } = require('../middleware/validate');
const { CategorySchema } = require('../validation/business');

// GET /categories - Public list (with optional pagination)
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 100));
    const skip = (page - 1) * pageSize;

    const [list, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: pageSize,
        orderBy: { name: 'asc' }
      }),
      prisma.category.count()
    ]);

    return res.status(200).json({
      data: list,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    });
  } catch (err) {
    next(err);
  }
});

// GET /categories/:id - Public detail
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    const item = await prisma.category.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: { message: 'Category not found', status: 404 } });
    }
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// POST /categories - Admin only
router.post('/', auth, authorize('ADMIN'), validateBody(CategorySchema), async (req, res, next) => {
  try {
    const item = await prisma.category.create({ data: req.body });
    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /categories/:id - Admin only
router.put('/:id', auth, authorize('ADMIN'), validateBody(CategorySchema), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    const item = await prisma.category.update({ where: { id }, data: req.body });
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /categories/:id - Admin only
router.delete('/:id', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    await prisma.category.delete({ where: { id } });
    return res.status(200).json({ status: 'success', message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
