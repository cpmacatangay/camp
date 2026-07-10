const { Router } = require('express');
const { z } = require('zod');
const { scan } = require('../controllers/scanController');
const { auth, requireStaff } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

router.use(auth, requireStaff);

const scanBodySchema = z.object({});

router.post('/:qrToken', validate(scanBodySchema), scan);

module.exports = router;
