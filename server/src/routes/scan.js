const { Router } = require('express');
const { scan } = require('../controllers/scanController');
const { auth, requireStaff } = require('../middleware/auth');

const router = Router();

router.use(auth, requireStaff);
router.post('/:qrToken', scan);

module.exports = router;
