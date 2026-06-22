const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { validateBody } = require('../middleware/validate');
const { RecruitmentSchema } = require('../validation/recruitment');

router.post('/', validateBody(RecruitmentSchema), async (req, res, next) => {
  try {
    const { fullName, phone, email, position, intro } = req.body;

    // Format messages for Telegram and Zalo
    const telegramMsg = [
      `💼 <b>CÓ HỒ SƠ ỨNG TUYỂN MỚI!</b> 📢`,
      ``,
      `• <b>Họ và tên:</b> ${fullName}`,
      `• <b>Số điện thoại:</b> ${phone}`,
      `• <b>Email:</b> ${email}`,
      `• <b>Vị trí ứng tuyển:</b> <b>${position}</b>`,
      intro ? `• <b>Giới thiệu bản thân:</b> <i>${intro}</i>` : ``,
      ``,
      `👉 <i>Vui lòng liên hệ ứng viên để trao đổi chi tiết phỏng vấn.</i>`
    ].filter(line => line !== null).join('\n');

    const zaloMsg = [
      `💼 CÓ HỒ SƠ ỨNG TUYỂN MỚI! 📢`,
      ``,
      `• Họ và tên: ${fullName}`,
      `• Số điện thoại: ${phone}`,
      `• Email: ${email}`,
      `• Vị trí ứng tuyển: ${position}`,
      intro ? `• Giới thiệu bản thân: ${intro}` : ``,
      ``,
      `👉 Vui lòng liên hệ ứng viên để trao đổi chi tiết phỏng vấn.`
    ].filter(line => line !== null).join('\n');

    // Create NotificationOutbox records inside a transaction
    await prisma.$transaction(async (tx) => {
      // Insert TELEGRAM notification outbox record
      await tx.notificationOutbox.create({
        data: {
          type: 'TELEGRAM',
          payload: {
            message: telegramMsg,
            isRecruitment: true
          }
        }
      });

      // Insert ZALO notification outbox record
      await tx.notificationOutbox.create({
        data: {
          type: 'ZALO',
          payload: {
            message: zaloMsg,
            isRecruitment: true
          }
        }
      });
    });

    return res.status(201).json({ status: 'success', message: 'Application submitted and notifications queued' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
