const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const prisma = require('../config/prisma');
const env = require('../config/env');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } = require('../validation/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');

// POST /auth/register - Register a new user (BUG-C03 fix: rate limited)
router.post('/register', authRateLimiter, async (req, res, next) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          status: 400,
          details: parsed.error.format()
        }
      });
    }

    const { email, password, name } = parsed.data;

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
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
        role: 'CUSTOMER' // Security: role is always CUSTOMER on registration
      }
    });

    // Strip password field before responding
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

// POST /auth/login - Log in an existing user
router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          status: 400,
          details: parsed.error.format()
        }
      });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          status: 401
        }
      });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({
        error: {
          message: 'Administrator accounts must sign in with Google.',
          status: 403
        }
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          status: 401
        }
      });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/google - Authenticate User via Google OAuth 2.0
router.post('/google', authRateLimiter, async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        error: {
          message: 'Authorization code is required',
          status: 400
        }
      });
    }

    let email = '';
    let name = '';
    let googleId = '';
    let avatar = '';

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/login';

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        error: {
          message: 'Google OAuth configuration is missing on the server',
          status: 500
        }
      });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      return res.status(400).json({
        error: {
          message: tokenData.error_description || 'Failed to exchange authorization code',
          status: 400
        }
      });
    }

    const { access_token } = tokenData;

    // Fetch user info from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const profileData = await profileResponse.json();
    if (!profileResponse.ok) {
      return res.status(400).json({
        error: {
          message: 'Failed to fetch user profile from Google',
          status: 400
        }
      });
    }

    if (!profileData.email_verified) {
      return res.status(400).json({
        error: {
          message: 'Google email is not verified',
          status: 400
        }
      });
    }

    email = profileData.email;
    name = profileData.name || 'Google User';
    googleId = profileData.sub;
    avatar = profileData.picture || '';

    // 1. First priority: find user by googleId
    let user = await prisma.user.findUnique({
      where: { googleId }
    });

    if (user) {
      // User found by googleId. Just update avatar if changed.
      // Do not overwrite email, role, or name.
      if (user.avatar !== avatar) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar }
        });
      }
    } else {
      // 2. Second priority: find user by email (for linking or new creation)
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // Since we didn't find them by googleId above, if they have a googleId it MUST be different.
        // Security check: Prevent linking to a different Google account
        if (user.googleId) {
          return res.status(403).json({
            error: {
              message: 'Email này đã được liên kết với một tài khoản Google khác.',
              status: 403
            }
          });
        }

        // Link account (user.googleId is currently null)
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            ...(avatar && { avatar })
          }
        });
      } else {
        // 3. Create new CUSTOMER account
        user = await prisma.user.create({
          data: {
            email,
            name,
            googleId,
            avatar,
            role: 'CUSTOMER'
          }
        });
      }
    }

    // Generate JWT token
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/forgot-password - Request password reset link
router.post('/forgot-password', authRateLimiter, async (req, res, next) => {
  try {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          status: 400,
          details: parsed.error.format()
        }
      });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Security: always return 200 to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.'
      });
    }

    // Generate token
    const plaintextToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plaintextToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to DB
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        tokenHash,
        expiresAt
      },
      create: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    // Create reset URL
    const origin = req.get('origin') || env.FRONTEND_URL;
    const resetUrl = `${origin}/reset-password?token=${plaintextToken}`;

    // Add to NotificationOutbox
    await prisma.notificationOutbox.create({
      data: {
        type: 'EMAIL',
        payload: {
          to: email,
          subject: '[OCSEAFOOD] Đặt lại mật khẩu tài khoản của bạn',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #f97316; margin-top: 0;">Chào mừng đến với OCSEAFOOD!</h2>
              <h3 style="color: #1e3a8a;">Yêu cầu đặt lại mật khẩu</h3>
              <p>Chào bạn <strong>${user.name}</strong>,</p>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản OCSEAFOOD liên kết với email này.</p>
              <p>Vui lòng click vào nút bên dưới để tiến hành đặt lại mật khẩu mới:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color:#f97316;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Đặt lại mật khẩu</a>
              </div>
              <p>Hoặc sao chép và dán liên kết sau vào trình duyệt:</p>
              <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
              <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <em>Liên kết này sẽ hết hạn sau 60 phút. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email và mật khẩu của bạn sẽ giữ nguyên.</em>
              </p>
            </div>
          `
        }
      }
    });

    // Logging for production troubleshooting while maintaining privacy
    const maskedEmail = email.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) => {
      return `${first}${'*'.repeat(Math.min(middle.length, 5))}${domain}`;
    });
    console.log(`[ForgotPassword] Successfully queued password reset email for user ${maskedEmail} in NotificationOutbox`);

    return res.status(200).json({
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.'
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/reset-password - Reset password using token
router.post('/reset-password', authRateLimiter, async (req, res, next) => {
  try {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          status: 400,
          details: parsed.error.format()
        }
      });
    }

    const { token, password } = parsed.data;

    // Hash token to query matching record
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!resetTokenRecord) {
      return res.status(400).json({
        error: {
          message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
          status: 400
        }
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user's password and delete token inside transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetTokenRecord.id }
      })
    ]);

    return res.status(200).json({
      message: 'Đặt lại mật khẩu thành công!'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
