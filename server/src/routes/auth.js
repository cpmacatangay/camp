const { Router } = require('express');
const { z } = require('zod');
const { login } = require('../controllers/authController');
const { validate } = require('../middleware/validate');

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/login', validate(loginSchema), login);

module.exports = router;
