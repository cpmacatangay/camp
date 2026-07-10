const { Router } = require('express');
const { z } = require('zod');
const { register, getQR } = require('../controllers/participantController');
const { validate, validateQuery } = require('../middleware/validate');
const { upload, validateImageMagicBytes } = require('../middleware/upload');

const router = Router();

function cleanPhone(v) {
  return v.replace(/[^\d+]/g, '');
}

function toSentenceCase(v) {
  return v.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

const PH_MOBILE = /^(?:\+63|0)9\d{9}$/;

const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^\D*$/, 'Should not contain numbers').min(2, 'Must be at least 2 characters').max(100, 'Name too long').transform(toSentenceCase),
  homeAddress: z.string().min(1, 'Home address is required').min(5, 'Enter a full address (at least 5 characters)').max(500, 'Address too long').transform(toSentenceCase),
  birthDate: z.string().min(1, 'Birth date is required').refine((val) => {
    const parts = val.split('-');
    const d = new Date(val + 'T00:00:00');
    const now = new Date();
    return !isNaN(d.getTime()) && d <= now;
  }, 'Enter a valid past date in YYYY-MM-DD format'),
  contactNumber: z.string().min(1, 'Contact number is required').transform(cleanPhone).pipe(z.string().regex(PH_MOBILE, 'Enter a valid PH mobile number (e.g., 09171234567)').max(20)),
  email: z.string().email('Invalid email').max(254, 'Email too long'),
  nickname: z.string().min(1, 'Nickname is required').regex(/^\D*$/, 'Should not contain numbers').min(2, 'Must be at least 2 characters').max(100),
  facebookName: z.string().min(1, 'Facebook name is required').regex(/^\D*$/, 'Should not contain numbers').max(100).transform(toSentenceCase),
  existingSickness: z.string().max(1000, 'Sickness description too long').optional().default(''),
  fatherName: z.string().min(1, "Father's name is required").regex(/^\D*$/, 'Should not contain numbers').min(2, 'Must be at least 2 characters').max(100).transform(toSentenceCase),
  fatherContact: z.string().min(1, "Father's contact is required").transform(cleanPhone).pipe(z.string().regex(PH_MOBILE, 'Enter a valid PH mobile number (e.g., 09171234567)').max(20)),
  motherName: z.string().min(1, "Mother's name is required").regex(/^\D*$/, 'Should not contain numbers').min(2, 'Must be at least 2 characters').max(100).transform(toSentenceCase),
  motherContact: z.string().min(1, "Mother's contact is required").transform(cleanPhone).pipe(z.string().regex(PH_MOBILE, 'Enter a valid PH mobile number (e.g., 09171234567)').max(20)),
  paymentStatus: z.enum(['yes', 'no']),
});

router.post('/', upload.single('paymentScreenshot'), validateImageMagicBytes, validate(registrationSchema), register);

const qrQuerySchema = z.object({
  email: z.string().email('Valid email required'),
});

router.get('/:id/qr', validateQuery(qrQuerySchema), getQR);

module.exports = router;
