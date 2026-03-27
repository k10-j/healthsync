const express = require("express");
const { z } = require("zod");
const db = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  instructions: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

function toMed(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    dosage: row.dosage,
    frequency: row.frequency,
    instructions: row.instructions,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM medications WHERE user_id = $1 ORDER BY created_at DESC",
    [req.auth.userId]
  );
  return res.json({ medications: rows.map(toMed) });
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = medicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const { name, dosage, frequency, instructions, startDate, endDate } = parsed.data;
  const { rows } = await db.query(
    `INSERT INTO medications (user_id, name, dosage, frequency, instructions, start_date, end_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.auth.userId, name, dosage ?? null, frequency ?? null, instructions ?? null, startDate ?? null, endDate ?? null]
  );
  return res.status(201).json({ medication: toMed(rows[0]) });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid medication id." });

  const parsed = medicationSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const existing = await db.query(
    "SELECT id FROM medications WHERE id = $1 AND user_id = $2",
    [id, req.auth.userId]
  );
  if (!existing.rows.length) return res.status(404).json({ message: "Medication not found." });

  const fields = [];
  const values = [];
  let i = 1;
  const map = { name: "name", dosage: "dosage", frequency: "frequency", instructions: "instructions", startDate: "start_date", endDate: "end_date" };
  for (const [key, col] of Object.entries(map)) {
    if (parsed.data[key] !== undefined) {
      fields.push(`${col} = $${i++}`);
      values.push(parsed.data[key]);
    }
  }
  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await db.query(
    `UPDATE medications SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return res.json({ medication: toMed(rows[0]) });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid medication id." });

  const existing = await db.query(
    "SELECT id FROM medications WHERE id = $1 AND user_id = $2",
    [id, req.auth.userId]
  );
  if (!existing.rows.length) return res.status(404).json({ message: "Medication not found." });

  await db.query("DELETE FROM medications WHERE id = $1", [id]);
  return res.status(204).send();
});

module.exports = router;
