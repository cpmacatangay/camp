const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

function setupSocket(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      const admin = await Admin.findById(decoded.id).select('role');
      if (!admin) {
        return next(new Error('Invalid token'));
      }
      socket.userId = decoded.id;
      socket.role = admin.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    if (['admin', 'staff'].includes(socket.role)) {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
    });
  });
}

module.exports = { setupSocket };
