const { z } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        return res.status(400).json({ message: 'Validation error', errors: messages });
      }
      next(err);
    }
  };
}

module.exports = { validate };
