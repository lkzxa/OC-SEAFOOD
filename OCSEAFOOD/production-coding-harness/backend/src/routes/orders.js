const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateBody } = require('../middleware/validate');
const { OrderUpdateSchema } = require('../validation/order');

// GET /orders - Admin only list (paginated & filtered)
router.get('/', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ error: { message: 'Invalid pagination parameters', status: 400 } });
    }
    const skip = (page - 1) * pageSize;

    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    }
    if (req.query.phone) {
      where.phone = { contains: req.query.phone };
    }
    if (req.query.email) {
      where.email = { contains: req.query.email };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { orderItems: true }
      }),
      prisma.order.count({ where })
    ]);

    return res.status(200).json({
      data: orders,
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

// GET /orders/:id - Admin or Owner Detail lookup
router.get('/:id', auth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true }
    });

    if (!order) {
      return res.status(404).json({ error: { message: 'Order not found', status: 404 } });
    }

    // Role access control: Admin can read all; Customer can only read their own
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'Forbidden: Access denied', status: 403 } });
    }

    return res.status(200).json(order);
  } catch (err) {
    next(err);
  }
});

// PUT /orders/:id - Admin only Update
router.put('/:id', auth, authorize('ADMIN'), validateBody(OrderUpdateSchema), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, note, totalFinal, items } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: { message: 'Order not found', status: 404 } });
    }

    let isPriceAdjusted = false;
    const changedFields = [];
    const oldValues = {};
    const newValues = {};

    // Track status changes
    if (status !== undefined && status !== existingOrder.status) {
      changedFields.push('status');
      oldValues.status = existingOrder.status;
      newValues.status = status;
    }

    // Track note changes
    if (note !== undefined && note !== existingOrder.note) {
      changedFields.push('note');
      oldValues.note = existingOrder.note;
      newValues.note = note;
    }

    const itemsMap = new Map(existingOrder.orderItems.map(item => [item.id, item]));

    // Track item pricing and quantity modifications
    const oldItems = [];
    const newItems = [];

    if (items && items.length > 0) {
      for (const update of items) {
        const existingItem = itemsMap.get(update.id);
        if (!existingItem) {
          return res.status(400).json({
            error: {
              message: `Order item with ID ${update.id} does not belong to this order`,
              status: 400
            }
          });
        }

        let itemChanged = false;
        const oldItemDetail = { id: update.id };
        const newItemDetail = { id: update.id };

        if (update.quantity !== undefined && update.quantity !== existingItem.quantity) {
          itemChanged = true;
          oldItemDetail.quantity = existingItem.quantity;
          newItemDetail.quantity = update.quantity;
          isPriceAdjusted = true;
        }
        if (update.priceFinal !== undefined && Number(update.priceFinal) !== Number(existingItem.priceFinal)) {
          itemChanged = true;
          oldItemDetail.priceFinal = Number(existingItem.priceFinal);
          newItemDetail.priceFinal = update.priceFinal;
          isPriceAdjusted = true;
        }

        if (itemChanged) {
          oldItems.push(oldItemDetail);
          newItems.push(newItemDetail);
        }
      }
    }

    if (oldItems.length > 0) {
      changedFields.push('items');
      oldValues.items = oldItems;
      newValues.items = newItems;
    }

    // Calculate new totalFinal
    let finalTotal = totalFinal;
    if (finalTotal === undefined) {
      if (items && items.length > 0) {
        let computedTotal = 0;
        for (const existingItem of existingOrder.orderItems) {
          const update = items.find(it => it.id === existingItem.id);
          const quantity = update && update.quantity !== undefined ? update.quantity : existingItem.quantity;
          const priceFinal = update && update.priceFinal !== undefined ? update.priceFinal : Number(existingItem.priceFinal);
          computedTotal += quantity * priceFinal;
        }
        finalTotal = computedTotal;
      } else {
        finalTotal = Number(existingOrder.totalFinal);
      }
    }

    // Track total final changes
    if (Number(finalTotal) !== Number(existingOrder.totalFinal)) {
      changedFields.push('totalFinal');
      oldValues.totalFinal = Number(existingOrder.totalFinal);
      newValues.totalFinal = Number(finalTotal);
      isPriceAdjusted = true;
    }

    const newAdminPriceAdjusted = existingOrder.adminPriceAdjusted || isPriceAdjusted;
    if (newAdminPriceAdjusted !== existingOrder.adminPriceAdjusted) {
      changedFields.push('adminPriceAdjusted');
      oldValues.adminPriceAdjusted = existingOrder.adminPriceAdjusted;
      newValues.adminPriceAdjusted = newAdminPriceAdjusted;
    }

    // BUG-008 fix: Prevent admin from zeroing out the entire order total
    if (Number(finalTotal) <= 0) {
      return res.status(400).json({
        error: {
          message: 'Total final must be greater than zero',
          status: 400
        }
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update individual items
      if (items && items.length > 0) {
        for (const update of items) {
          const existingItem = itemsMap.get(update.id);
          if (existingItem) {
            const quantity = update.quantity !== undefined ? update.quantity : existingItem.quantity;
            const priceFinal = update.priceFinal !== undefined ? update.priceFinal : Number(existingItem.priceFinal);
            const itemTotalFinal = quantity * priceFinal;

            await tx.orderItem.update({
              where: { id: update.id },
              data: {
                quantity,
                priceFinal,
                totalFinal: itemTotalFinal
              }
            });
          }
        }
      }

      // Update Order record
      const resultOrder = await tx.order.update({
        where: { id },
        data: {
          status: status !== undefined ? status : existingOrder.status,
          note: note !== undefined ? note : existingOrder.note,
          totalFinal: finalTotal,
          adminPriceAdjusted: newAdminPriceAdjusted
        },
        include: {
          orderItems: true
        }
      });

      // Write Audit Log if changes occurred
      if (changedFields.length > 0) {
        await tx.orderAuditLog.create({
          data: {
            orderId: id,
            adminUserId: req.user.id,
            changedFields,
            oldValues,
            newValues,
            note: note || null
          }
        });
      }

      return resultOrder;
    });

    return res.status(200).json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
