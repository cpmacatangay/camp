const fs = require('fs');
const path = require('path');
const { Router } = require('express');
const { auth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.use(auth, requireAdmin);

router.get('/:filename', (req, res, next) => {
  try {
    const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
    const filename = path.basename(req.params.filename);
    const safePath = path.resolve(uploadDir, filename);

    if (!safePath.startsWith(uploadDir)) {
      return res.status(400).json({ message: 'Invalid file path' });
    }

    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const ext = path.extname(filename).toLowerCase();
    const mimeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    res.set('Content-Type', contentType);
    res.set('Content-Disposition', 'attachment');
    res.sendFile(safePath);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
