const fs = require('fs');
const { z } = require('zod');

function deleteUploadedFile(file) {
  if (file && file.path) {
    fs.unlink(file.path, () => {});
  }
}

function getZodMessages(err) {
  const issues = err.issues || err.errors || [];
  return issues.map((e) => `${e.path.join('.')}: ${e.message}`);
}

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        deleteUploadedFile(req.file);
        return res.status(400).json({ message: 'Validation error', errors: getZodMessages(err) });
      }
      next(err);
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: getZodMessages(err) });
      }
      next(err);
    }
  };
}

module.exports = { validate, validateQuery };
