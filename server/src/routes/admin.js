const { Router } = require('express');
const { z } = require('zod');
const {
  list,
  update,
  addByAdmin,
  remove,
  bulkRemove,
  setAttendance,
} = require('../controllers/adminController');
const { auth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { upload, validateImageMagicBytes } = require('../middleware/upload');

const router = Router();

function cleanPhone(v) {
  return v.replace(/[^\d+]/g, '');
}

function toSentenceCase(v) {
  return v.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

const participantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').transform(toSentenceCase),
  homeAddress: z.string().min(1, 'Home address is required').max(500, 'Address too long').transform(toSentenceCase),
  birthDate: z.string().min(1, 'Birth date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  contactNumber: z.string().min(1, 'Contact number is required').transform(cleanPhone).pipe(z.string().max(20)),
  email: z.string().email('Invalid email').max(254, 'Email too long'),
  nickname: z.string().min(1, 'Nickname is required').max(100),
  facebookName: z.string().min(1, 'Facebook name is required').max(100).transform(toSentenceCase),
  existingSickness: z.string().max(1000, 'Sickness description too long').optional().default(''),
  fatherName: z.string().min(1, "Father's name is required").max(100).transform(toSentenceCase),
  fatherContact: z.string().min(1, "Father's contact is required").transform(cleanPhone).pipe(z.string().max(20)),
  motherName: z.string().min(1, "Mother's name is required").max(100).transform(toSentenceCase),
  motherContact: z.string().min(1, "Mother's contact is required").transform(cleanPhone).pipe(z.string().max(20)),
  paymentStatus: z.enum(['yes', 'no']),
});

const updateSchema = participantSchema.partial();

const attendanceSchema = z.object({
  attendanceStatus: z.enum(['Absent', 'Present']),
});

router.use(auth, requireAdmin);

router.get('/participants', list);
router.post('/participants', upload.single('paymentScreenshot'), validateImageMagicBytes, validate(participantSchema), addByAdmin);
router.put('/participants/:id', upload.single('paymentScreenshot'), validateImageMagicBytes, validate(updateSchema), update);
router.delete('/participants/bulk', bulkRemove);
router.delete('/participants/:id', remove);
router.patch('/participants/:id/attendance', validate(attendanceSchema), setAttendance);

module.exports = router;
