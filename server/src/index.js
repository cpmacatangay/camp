require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const { validateEnv } = require("./config/env");
const { connectDB } = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const { setupSocket } = require("./services/socket");

const participantsRouter = require("./routes/participants");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const scanRouter = require("./routes/scan");
const exportRouter = require("./routes/export");

validateEnv();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

setupSocket(io);
app.set("io", io);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
app.use(`/${process.env.UPLOAD_DIR}`, express.static(uploadDir));

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: "Too many requests, please try again later" },
});

app.use("/api/participants", publicLimiter, participantsRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/scan", scanRouter);
app.use("/api/admin/export", exportRouter);

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
