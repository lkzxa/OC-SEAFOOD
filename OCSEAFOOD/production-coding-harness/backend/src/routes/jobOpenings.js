const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateBody } = require('../middleware/validate');
const { JobOpeningSchema } = require('../validation/jobOpenings');

// GET /job-openings - Public visible list
router.get('/', async (req, res, next) => {
  try {
    const list = await prisma.jobOpening.findMany({
      where: { isVisible: true },
      orderBy: { id: 'asc' }
    });
    return res.status(200).json(list);
  } catch (err) {
    next(err);
  }
});

// GET /job-openings/admin - Admin view list (includes hidden ones)
router.get('/admin', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const list = await prisma.jobOpening.findMany({
      orderBy: { id: 'asc' }
    });
    return res.status(200).json(list);
  } catch (err) {
    next(err);
  }
});

// GET /job-openings/:id - Public/Admin detail by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }
    const item = await prisma.jobOpening.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: { message: 'Job opening not found', status: 404 } });
    }
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// POST /job-openings - Admin only create
router.post('/', auth, authorize('ADMIN'), validateBody(JobOpeningSchema), async (req, res, next) => {
  try {
    const item = await prisma.jobOpening.create({ data: req.body });
    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /job-openings/:id - Admin only update
router.put('/:id', auth, authorize('ADMIN'), validateBody(JobOpeningSchema), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }

    const existing = await prisma.jobOpening.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: { message: 'Job opening not found', status: 404 } });
    }

    const item = await prisma.jobOpening.update({
      where: { id },
      data: req.body
    });
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /job-openings/:id - Admin only delete
router.delete('/:id', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid ID format', status: 400 } });
    }

    const existing = await prisma.jobOpening.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: { message: 'Job opening not found', status: 404 } });
    }

    await prisma.jobOpening.delete({ where: { id } });
    return res.status(200).json({ message: 'Job opening deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
