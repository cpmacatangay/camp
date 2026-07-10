const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      await bcrypt.compare(password, '$2b$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
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
    res.json({
      token,
      role: admin.role,
      email: admin.email,
      mustChangePassword: admin.mustChangePassword || false,
    });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }
    const match = await admin.comparePassword(currentPassword);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    admin.passwordHash = newPassword;
    admin.mustChangePassword = false;
    await admin.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, changePassword };
