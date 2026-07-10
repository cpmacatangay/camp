const { Router } = require('express');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const { login, changePassword } = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later" },
});

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(10, 'New password must be at least 10 characters'),
});

router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/change-password', auth, validate(changePasswordSchema), changePassword);

module.exports = router;
