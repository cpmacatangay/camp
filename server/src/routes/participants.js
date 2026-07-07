const { Router } = require('express');
const { z } = require('zod');
const { register, getQR } = require('../controllers/participantController');
const { validate } = require('../middleware/validate');
const { upload } = require('../middleware/upload');

const router = Router();

function cleanPhone(v) {
  return v.replace(/[\s\-()]/g, '');
}

const PH_MOBILE = /^(?:\+63|0)9\d{9}$/;

const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^\D*$/, 'Should not contain numbers').min(2, 'Must be at least 2 characters'),
  homeAddress: z.string().min(1, 'Home address is required').min(5, 'Enter a full address (at least 5 characters)'),
  birthDate: z.string().min(1, 'Birth date is required').refine((val) => {
    const parts = val.split('-');
    const d = new Date(val + 'T00:00:00');
    const now = new Date();
    return !isNaN(d.getTime()) && d <= now;
  }, 'Enter a valid past date in YYYY-MM-DD format'),
  contactNumber: z.string().min(1, 'Contact number is required').transform(cleanPhone).pipe(z.string().regex(PH_MOBILE, 'Enter a valid PH mobile number (e.g., 09171234567)')),
  email: z.string().email('Invalid email'),
  nickname: z.string().min(1, 'Nickname is required').regex(/^\D*$/, 'Should not contain numbers').min(2, 'Must be at least 2 characters'),
  facebookName: z.string().min(1, 'Facebook name is required').regex(/^\D*$/, 'Should not contain numbers'),
  existingSickness: z.string().optional().default(''),
  fatherName: z.string().min(1, "Father's name is required").regex(/^\D*$/, 'Should not contain numbers').min(2, 'Must be at least 2 characters'),
  fatherContact: z.string().min(1, "Father's contact is required").transform(cleanPhone).pipe(z.string().regex(PH_MOBILE, 'Enter a valid PH mobile number (e.g., 09171234567)')),
  motherName: z.string().min(1, "Mother's name is required").regex(/^\D*$/, 'Should not contain numbers').min(2, 'Must be at least 2 characters'),
  motherContact: z.string().min(1, "Mother's contact is required").transform(cleanPhone).pipe(z.string().regex(PH_MOBILE, 'Enter a valid PH mobile number (e.g., 09171234567)')),
  paymentStatus: z.enum(['yes', 'no']),
});

router.post('/', upload.single('paymentScreenshot'), validate(registrationSchema), register);
router.get('/:id/qr', getQR);

module.exports = router;
