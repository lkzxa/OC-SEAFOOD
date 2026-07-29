const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateBody } = require('../middleware/validate');
const { ComboSchema } = require('../validation/combos');

// GET /combos - Public visible list
router.get('/', async (req, res, next) => {
  try {
    const list = await prisma.combo.findMany({
      where: { isVisible: true },
      orderBy: { id: 'asc' }
    });
    return res.status(200).json(list);
  } catch (err) {
    next(err);
  }
});

// GET /combos/slug/:slug - Public detail by slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const item = await prisma.combo.findUnique({
      where: { slug }
    });
    if (!item) {
      return res.status(404).json({ error: { message: 'Combo not found', status: 404 } });
    }
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// GET /combos/admin - Admin view list (includes hidden ones)
router.get('/admin', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const list = await prisma.combo.findMany({
      orderBy: { id: 'asc' }
    });
    return res.status(200).json(list);
  } catch (err) {
    next(err);
  }
});

// GET /combos/:id - Public/Admin detail by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    const item = await prisma.combo.findUnique({
      where: { id }
    });
    if (!item) {
      return res.status(404).json({ error: { message: 'Combo not found', status: 404 } });
    }
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// POST /combos - Admin only create
router.post('/', auth, authorize('ADMIN'), validateBody(ComboSchema), async (req, res, next) => {
  try {
    const { slug } = req.body;
    const existing = await prisma.combo.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: { message: 'Slug already exists', status: 400 } });
    }
    const item = await prisma.combo.create({ data: req.body });
    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /combos/:id - Admin only update
router.put('/:id', auth, authorize('ADMIN'), validateBody(ComboSchema), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }

    const existing = await prisma.combo.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: { message: 'Combo not found', status: 404 } });
    }

    const { slug } = req.body;
    const existingSlug = await prisma.combo.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });
    if (existingSlug) {
      return res.status(400).json({ error: { message: 'Slug already exists', status: 400 } });
    }

    const item = await prisma.combo.update({
      where: { id },
      data: req.body
    });
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /combos/:id - Admin only delete
router.delete('/:id', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }

    const existing = await prisma.combo.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: { message: 'Combo not found', status: 404 } });
    }

    await prisma.combo.delete({ where: { id } });
    return res.status(200).json({ message: 'Combo deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
