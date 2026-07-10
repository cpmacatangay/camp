function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err);

  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation error', errors: messages });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value. This record already exists.' });
  }

  if (err.name === 'MulterError' || (err.message && err.message.includes('Only JPEG'))) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5MB)' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.message && err.message.includes('Invalid image')) {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: 'Internal server error',
  });
}

module.exports = { errorHandler };
