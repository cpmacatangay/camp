const { Router } = require('express');
const { exportExcel } = require('../controllers/exportController');
const { auth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.use(auth, requireAdmin);
router.get('/', exportExcel);

module.exports = router;
