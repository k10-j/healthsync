const express = require("express");
const { z } = require("zod");
const db = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const appointmentSchema = z.object({
  title: z.string().min(1),
  providerName: z.string().optional(),
  location: z.string().optional(),
  appointmentAt: z.coerce.date(),
  notes: z.string().optional(),
});

function toAppt(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    providerName: row.provider_name,
    location: row.location,
    appointmentAt: row.appointment_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM appointments WHERE user_id = $1 ORDER BY appointment_at ASC",
    [req.auth.userId]
  );
  return res.json({ appointments: rows.map(toAppt) });
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = appointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const { title, providerName, location, appointmentAt, notes } = parsed.data;
  const { rows } = await db.query(
    `INSERT INTO appointments (user_id, title, provider_name, location, appointment_at, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.auth.userId, title, providerName ?? null, location ?? null, appointmentAt, notes ?? null]
  );
  return res.status(201).json({ appointment: toAppt(rows[0]) });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid appointment id." });

  const parsed = appointmentSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const existing = await db.query(
    "SELECT id FROM appointments WHERE id = $1 AND user_id = $2",
    [id, req.auth.userId]
  );
  if (!existing.rows.length) return res.status(404).json({ message: "Appointment not found." });

  const fields = [];
  const values = [];
  let i = 1;
  const map = { title: "title", providerName: "provider_name", location: "location", appointmentAt: "appointment_at", notes: "notes" };
  for (const [key, col] of Object.entries(map)) {
    if (parsed.data[key] !== undefined) {
      fields.push(`${col} = $${i++}`);
      values.push(parsed.data[key]);
    }
  }
  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await db.query(
    `UPDATE appointments SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return res.json({ appointment: toAppt(rows[0]) });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid appointment id." });

  const existing = await db.query(
    "SELECT id FROM appointments WHERE id = $1 AND user_id = $2",
    [id, req.auth.userId]
  );
  if (!existing.rows.length) return res.status(404).json({ message: "Appointment not found." });

  await db.query("DELETE FROM appointments WHERE id = $1", [id]);
  return res.status(204).send();
});

module.exports = router;
