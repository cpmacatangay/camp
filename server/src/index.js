require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { validateEnv } = require("./config/env");
const { connectDB } = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const { setupSocket } = require("./services/socket");

const participantsRouter = require("./routes/participants");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const scanRouter = require("./routes/scan");
const exportRouter = require("./routes/export");
const uploadsRouter = require("./routes/uploads");

validateEnv();

const app = express();
const server = http.createServer(app);

const socketCorsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false;
const io = new Server(server, {
  cors: {
    origin: socketCorsOrigin,
    methods: ["GET", "POST"],
  },
});

setupSocket(io);
app.set("io", io);

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "https://rsms.me"],
      fontSrc: ["'self'", "https://rsms.me"],
      connectSrc: ["'self'", "ws:", "wss:"],
      objectSrc: ["'none'"],
      baseUri: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
    },
  },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "no-referrer" },
}));

const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  app.use(cors({ origin: corsOrigin }));
} else {
  app.use(cors({ origin: false }));
}
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later" },
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many scan attempts, please slow down" },
});

const exportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many export requests, please try again later" },
});

const adminMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

app.use("/api/participants", publicLimiter, participantsRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminMutationLimiter, adminRouter);
app.use("/api/scan", scanLimiter, scanRouter);
app.use("/api/admin/export", exportLimiter, exportRouter);
app.use("/api/uploads", uploadsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🟢 Server running on port ${PORT}`);
  });
}

start();

module.exports = { app, server };
