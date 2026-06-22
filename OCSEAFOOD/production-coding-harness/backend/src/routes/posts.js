const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateBody } = require('../middleware/validate');
const { BlogPostSchema } = require('../validation/business');

// GET /posts - Public list (only visible posts)
router.get('/', async (req, res, next) => {
  try {
    const list = await prisma.blogPost.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(list);
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id - Public detail (only visible posts)
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    const item = await prisma.blogPost.findFirst({
      where: { id, isVisible: true }
    });
    if (!item) {
      return res.status(404).json({ error: { message: 'Blog post not found', status: 404 } });
    }
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// POST /posts - Admin only (binds authorId from JWT claims)
router.post('/', auth, authorize('ADMIN'), validateBody(BlogPostSchema), async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      authorId: req.user.id // Enforced security: read from token context
    };
    const item = await prisma.blogPost.create({ data });
    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /posts/:id - Admin only
router.put('/:id', auth, authorize('ADMIN'), validateBody(BlogPostSchema), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    const item = await prisma.blogPost.update({ where: { id }, data: req.body });
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /posts/:id - Admin only
router.delete('/:id', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    await prisma.blogPost.delete({ where: { id } });
    return res.status(200).json({ status: 'success', message: 'Blog post deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
