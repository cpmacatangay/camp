const jwt = require('jsonwebtoken');

function setupSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.role = decoded.role;
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
