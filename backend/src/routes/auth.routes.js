const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const db = require("../lib/db");
const env = require("../config/env");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const { email, password, fullName } = parsed.data;
  const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length) {
    return res.status(409).json({ message: "Email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `INSERT INTO users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, full_name AS "fullName", created_at AS "createdAt"`,
    [email, passwordHash, fullName ?? null]
  );
  const user = rows[0];

  const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return res.status(201).json({ user, token });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const { email, password } = parsed.data;
  const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Invalid credentials." });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials." });

  const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return res.json({
    user: { id: user.id, email: user.email, fullName: user.full_name, createdAt: user.created_at },
    token,
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, email, full_name AS "fullName", created_at AS "createdAt", updated_at AS "updatedAt"
     FROM users WHERE id = $1`,
    [req.auth.userId]
  );
  if (!rows.length) return res.status(404).json({ message: "User not found." });
  return res.json({ user: rows[0] });
});

module.exports = router;
