const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const medicationsRoutes = require("./routes/medications.routes");
const doseLogsRoutes = require("./routes/dose-logs.routes");
const appointmentsRoutes = require("./routes/appointments.routes");
const learnRoutes = require("./routes/learn.routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: ["https://healthsyync.netlify.app", "http://localhost:8080"] }));
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

app.listen(env.PORT, () => {
  console.log(`HealthSync backend listening on http://localhost:${env.PORT}`);
});
