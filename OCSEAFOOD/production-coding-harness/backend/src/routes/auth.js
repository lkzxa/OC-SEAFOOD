const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const { RegisterSchema, LoginSchema } = require('../validation/auth');

// POST /auth/register - Register a new user
router.post('/register', async (req, res, next) => {
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
router.post('/login', async (req, res, next) => {
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

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          status: 401
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

// POST /auth/google - Authenticate Admin via Google OAuth 2.0
router.post('/google', async (req, res, next) => {
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

    // Development or Test Mock Mode Bypass
    if ((process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && code === 'mock_google_admin_code') {
      email = 'admin@ocseafood.vn';
      name = 'Admin';
    } else {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/login';

      if (!clientId || !clientSecret || clientId === 'mock-google-client-id') {
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
      name = profileData.name || 'Admin User';
    }

    // Verify user in Database and check ADMIN role
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        error: {
          message: 'Tài khoản Google này không có quyền truy cập Admin.',
          status: 403
        }
      });
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

module.exports = router;
