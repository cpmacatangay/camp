const { Router } = require('express');
const { z } = require('zod');
const { register, getQR } = require('../controllers/participantController');
const { validate } = require('../middleware/validate');
const { upload } = require('../middleware/upload');

const router = Router();

const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  homeAddress: z.string().min(1, 'Home address is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  email: z.string().email('Invalid email'),
  nickname: z.string().min(1, 'Nickname is required'),
  facebookName: z.string().min(1, 'Facebook name is required'),
  existingSickness: z.string().optional().default(''),
  fatherName: z.string().min(1, "Father's name is required"),
  fatherContact: z.string().min(1, "Father's contact is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  motherContact: z.string().min(1, "Mother's contact is required"),
  paymentStatus: z.enum(['yes', 'no']),
});

router.post('/', upload.single('paymentScreenshot'), validate(registrationSchema), register);
router.get('/:id/qr', getQR);

module.exports = router;
