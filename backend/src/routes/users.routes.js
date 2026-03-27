const express = require("express");
const { z } = require("zod");
const db = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const updateProfileSchema = z.object({ fullName: z.string().min(1) });

router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, email, full_name AS "fullName", created_at AS "createdAt", updated_at AS "updatedAt"
     FROM users WHERE id = $1`,
    [req.auth.userId]
  );
  if (!rows.length) return res.status(404).json({ message: "User not found." });
  return res.json({ user: rows[0] });
});

router.patch("/me", requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const { rows } = await db.query(
    `UPDATE users SET full_name = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, full_name AS "fullName", created_at AS "createdAt", updated_at AS "updatedAt"`,
    [parsed.data.fullName, req.auth.userId]
  );
  return res.json({ user: rows[0] });
});

module.exports = router;
