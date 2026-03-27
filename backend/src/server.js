const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const prisma = require("./lib/prisma");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const medicationsRoutes = require("./routes/medications.routes");
const doseLogsRoutes = require("./routes/dose-logs.routes");
const appointmentsRoutes = require("./routes/appointments.routes");
const learnRoutes = require("./routes/learn.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "healthsync-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/medications", medicationsRoutes);
app.use("/api/dose-logs", doseLogsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/learn", learnRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

const server = app.listen(env.PORT, () => {
  console.log(`HealthSync backend listening on http://localhost:${env.PORT}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
