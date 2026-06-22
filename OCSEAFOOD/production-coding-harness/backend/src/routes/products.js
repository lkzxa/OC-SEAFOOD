const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateBody } = require('../middleware/validate');
const { ProductSchema } = require('../validation/business');

// GET /products - Public list (supports categoryId filter + optional pagination)
router.get('/', async (req, res, next) => {
  try {
    const where = { isVisible: true };
    if (req.query.categoryId) {
      const categoryId = parseInt(req.query.categoryId, 10);
      if (isNaN(categoryId)) {
        return res.status(400).json({ error: { message: 'Invalid categoryId format', status: 400 } });
      }
      where.categoryId = categoryId;
    }

    // Optional pagination — default: page 1, up to 100 items
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 100));
    const skip = (page - 1) * pageSize;

    const [list, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return res.status(200).json({
      data: list,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /products/slug/:slug - Public detail by slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const item = await prisma.product.findUnique({
      where: { slug, isVisible: true },
      include: { category: true }
    });
    if (!item) {
      return res.status(404).json({ error: { message: 'Product not found', status: 404 } });
    }
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// GET /products/:id - Public detail
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    const item = await prisma.product.findFirst({ where: { id, isVisible: true } });
    if (!item) {
      return res.status(404).json({ error: { message: 'Product not found', status: 404 } });
    }
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// POST /products - Admin only
router.post('/', auth, authorize('ADMIN'), validateBody(ProductSchema), async (req, res, next) => {
  try {
    const item = await prisma.product.create({ data: req.body });
    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /products/:id - Admin only
router.put('/:id', auth, authorize('ADMIN'), validateBody(ProductSchema), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    const item = await prisma.product.update({ where: { id }, data: req.body });
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /products/:id - Admin only
router.delete('/:id', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ status: 'success', message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
