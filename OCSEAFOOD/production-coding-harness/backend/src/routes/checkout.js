const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const prisma = require('../config/prisma');
const { checkoutRateLimiter, testCheckoutRateLimiter } = require('../middleware/rateLimiter');
const optionalAuth = require('../middleware/optionalAuth');
const { validateBody } = require('../middleware/validate');
const { CheckoutSchema } = require('../validation/checkout');

const limiter = process.env.NODE_ENV === 'test' ? testCheckoutRateLimiter : checkoutRateLimiter;

router.post('/', limiter, optionalAuth, validateBody(CheckoutSchema), async (req, res, next) => {
  try {
    const { items, note, fullName, email, phone, province, district, ward, streetAddress } = req.body;

    // Fetch product details for validation and server-side pricing
    const productIds = items.map(item => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productsMap = new Map(dbProducts.map(p => [p.id, p]));

    // Validate that all products exist
    for (const itemId of productIds) {
      if (!productsMap.has(itemId)) {
        return res.status(400).json({
          error: {
            message: `Product with ID ${itemId} not found`,
            status: 400
          }
        });
      }

      const product = productsMap.get(itemId);
      const hasOptionPrice = items.some(item => {
        if (item.productId === itemId && item.selectedWeight && product.weightOptions && product.weightOptions.length > 0) {
          const option = product.weightOptions.find(o => o.startsWith(item.selectedWeight + ':'));
          if (option) {
            const optPrice = Number(option.split(':')[1]);
            return !isNaN(optPrice) && optPrice > 0;
          }
        }
        return false;
      });

      if (!product.isVisible || product.showContact || (product.priceReference === null && !hasOptionPrice)) {
        return res.status(400).json({
          error: {
            message: `Product with ID ${itemId} is not available for checkout`,
            status: 400
          }
        });
      }
    }

    // Generate unique order code using UUID v4 (collision-safe)
    const code = `ORD-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

    // Perform DB insertions in a single transaction
    const order = await prisma.$transaction(async (tx) => {
      // Calculate order item totals and aggregate order total
      let totalEstimated = 0;
      
      const orderItemsData = items.map(item => {
        const product = productsMap.get(item.productId);
        let price = Number(product.priceReference);

        if (item.selectedWeight && product.weightOptions && product.weightOptions.length > 0) {
          const option = product.weightOptions.find(o => o.startsWith(item.selectedWeight + ':'));
          if (option) {
            const optPrice = Number(option.split(':')[1]);
            if (!isNaN(optPrice)) {
              price = optPrice;
            }
          }
        }

        const itemTotal = price * item.quantity;
        totalEstimated += itemTotal;

        const unitString = item.selectedWeight
          ? `${product.unit} (${item.selectedWeight})`
          : product.unit;

        return {
          productId: item.productId,
          productName: product.name,
          productUnit: unitString,
          quantity: item.quantity,
          priceEstimated: price,
          priceFinal: price,
          totalEstimated: itemTotal,
          totalFinal: itemTotal,
        };
      });

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          code,
          fullName,
          email,
          phone,
          province,
          district,
          ward,
          streetAddress,
          note,
          totalEstimated,
          totalFinal: totalEstimated,
          userId: req.user ? req.user.id : null,
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          orderItems: true
        }
      });

      // Format total price
      const formattedTotal = Number(createdOrder.totalFinal).toLocaleString('vi-VN') + ' VND';

      let orderItems = [];
      if (Array.isArray(createdOrder.orderItems)) {
        orderItems = createdOrder.orderItems;
      } else if (createdOrder.orderItems && Array.isArray(createdOrder.orderItems.create)) {
        orderItems = createdOrder.orderItems.create;
      }

      // Format items list
      const itemsListText = orderItems.map((item, index) => {
        const itemPrice = Number(item.priceFinal).toLocaleString('vi-VN');
        const itemTotal = Number(item.totalFinal).toLocaleString('vi-VN');
        return `${index + 1}. ${item.productName}: ${item.quantity} x ${itemPrice} = ${itemTotal} VND`;
      }).join('\n');

      const itemsListHtml = orderItems.map((item, index) => {
        const itemPrice = Number(item.priceFinal).toLocaleString('vi-VN');
        const itemTotal = Number(item.totalFinal).toLocaleString('vi-VN');
        return `${index + 1}. <b>${item.productName}</b>: ${item.quantity} x ${itemPrice} = ${itemTotal} VND`;
      }).join('\n');

      // Address string
      const address = [createdOrder.streetAddress, createdOrder.ward, createdOrder.district, createdOrder.province]
        .filter(Boolean)
        .join(', ');

      // Telegram Message (HTML Supported)
      const telegramMsg = [
        `🔔 <b>CÓ ĐƠN HÀNG MỚI TỪ WEBSITE!</b> 🌊`,
        ``,
        `• <b>Mã đơn hàng:</b> <code>${createdOrder.code}</code>`,
        `• <b>Khách hàng:</b> ${createdOrder.fullName}`,
        `• <b>Số điện thoại:</b> ${createdOrder.phone}`,
        `• <b>Email:</b> ${createdOrder.email}`,
        `• <b>Địa chỉ:</b> ${address}`,
        createdOrder.note ? `• <b>Ghi chú:</b> <i>${createdOrder.note}</i>` : ``,
        ``,
        `🛒 <b>Chi tiết món đặt:</b>`,
        itemsListHtml,
        ``,
        `💰 <b>Tổng thanh toán:</b> <b>${formattedTotal}</b>`,
        ``,
        `👉 <i>Vui lòng truy cập trang quản trị để xử lý đơn hàng.</i>`
      ].filter(line => line !== null).join('\n');

      // Zalo Message (Plain Text only)
      const zaloMsg = [
        `🔔 CÓ ĐƠN HÀNG MỚI TỪ WEBSITE! 🌊`,
        ``,
        `• Mã đơn hàng: ${createdOrder.code}`,
        `• Khách hàng: ${createdOrder.fullName}`,
        `• Số điện thoại: ${createdOrder.phone}`,
        `• Email: ${createdOrder.email}`,
        `• Địa chỉ: ${address}`,
        createdOrder.note ? `• Ghi chú: ${createdOrder.note}` : ``,
        ``,
        `🛒 Chi tiết món đặt:`,
        itemsListText,
        ``,
        `💰 Tổng thanh toán: ${formattedTotal}`,
        ``,
        `👉 Vui lòng truy cập trang quản trị để xử lý đơn hàng.`
      ].filter(line => line !== null).join('\n');

      // Insert EMAIL notification outbox record
      await tx.notificationOutbox.create({
        data: {
          type: 'EMAIL',
          payload: {
            orderId: createdOrder.id,
            code: createdOrder.code,
            email: createdOrder.email,
            fullName: createdOrder.fullName,
            totalFinal: Number(createdOrder.totalFinal)
          }
        }
      });

      // Insert TELEGRAM notification outbox record
      await tx.notificationOutbox.create({
        data: {
          type: 'TELEGRAM',
          payload: {
            orderId: createdOrder.id,
            code: createdOrder.code,
            message: telegramMsg
          }
        }
      });

      // Insert ZALO notification outbox record
      await tx.notificationOutbox.create({
        data: {
          type: 'ZALO',
          payload: {
            orderId: createdOrder.id,
            code: createdOrder.code,
            message: zaloMsg
          }
        }
      });

      return createdOrder;
    });

    return res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
