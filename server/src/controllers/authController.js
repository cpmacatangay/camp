const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await admin.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ token, role: admin.role, email: admin.email });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
