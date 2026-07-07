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
const { upload } = require('../middleware/upload');

const router = Router();

const participantSchema = z.object({
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

const updateSchema = participantSchema.partial();

const attendanceSchema = z.object({
  attendanceStatus: z.enum(['Absent', 'Present']),
});

router.use(auth, requireAdmin);

router.get('/participants', list);
router.post('/participants', upload.single('paymentScreenshot'), validate(participantSchema), addByAdmin);
router.put('/participants/:id', upload.single('paymentScreenshot'), validate(updateSchema), update);
router.delete('/participants/bulk', bulkRemove);
router.delete('/participants/:id', remove);
router.patch('/participants/:id/attendance', validate(attendanceSchema), setAttendance);

module.exports = router;
