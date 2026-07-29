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
      where.categories = {
        some: {
          id: categoryId
        }
      };
    }

    // Optional pagination — default: page 1, up to 100 items
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 100));
    const skip = (page - 1) * pageSize;

    const [list, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categories: true
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const mappedList = list.map(product => {
      const categoryIds = product.categories ? product.categories.map(c => c.id) : [];
      return {
        ...product,
        categoryId: categoryIds[0] || null,
        categoryIds
      };
    });

    return res.status(200).json({
      data: mappedList,
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
      include: { categories: true }
    });
    if (!item) {
      return res.status(404).json({ error: { message: 'Product not found', status: 404 } });
    }
    const categoryIds = item.categories ? item.categories.map(c => c.id) : [];
    const mapped = {
      ...item,
      category: item.categories ? item.categories[0] || null : null,
      categoryId: categoryIds[0] || null,
      categoryIds
    };
    return res.status(200).json(mapped);
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
    const item = await prisma.product.findFirst({
      where: { id, isVisible: true },
      include: { categories: true }
    });
    if (!item) {
      return res.status(404).json({ error: { message: 'Product not found', status: 404 } });
    }
    const categoryIds = item.categories ? item.categories.map(c => c.id) : [];
    const mapped = {
      ...item,
      category: item.categories ? item.categories[0] || null : null,
      categoryId: categoryIds[0] || null,
      categoryIds
    };
    return res.status(200).json(mapped);
  } catch (err) {
    next(err);
  }
});

// POST /products - Admin only
router.post('/', auth, authorize('ADMIN'), validateBody(ProductSchema), async (req, res, next) => {
  try {
    const { categoryIds, categoryId, ...rest } = req.body;
    const ids = categoryIds || (categoryId ? [categoryId] : []);
    const item = await prisma.product.create({
      data: {
        ...rest,
        categories: {
          connect: ids.map(id => ({ id }))
        }
      },
      include: {
        categories: true
      }
    });
    const mapped = {
      ...item,
      categoryId: ids[0] || null,
      categoryIds: ids
    };
    return res.status(201).json(mapped);
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
    const { categoryIds, categoryId, ...rest } = req.body;
    const ids = categoryIds || (categoryId ? [categoryId] : []);

    const item = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        categories: {
          set: ids.map(id => ({ id }))
        }
      },
      include: {
        categories: true
      }
    });
    const mapped = {
      ...item,
      categoryId: ids[0] || null,
      categoryIds: ids
    };
    return res.status(200).json(mapped);
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
