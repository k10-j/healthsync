const express = require("express");
const { z } = require("zod");
const db = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const doseLogSchema = z.object({
  medicationId: z.number().int().positive(),
  scheduledFor: z.coerce.date().optional(),
  takenAt: z.coerce.date().optional(),
  status: z.enum(["TAKEN", "SKIPPED", "MISSED"]).optional(),
  note: z.string().optional(),
});

function toLog(row) {
  return {
    id: row.id,
    userId: row.user_id,
    medicationId: row.medication_id,
    scheduledFor: row.scheduled_for,
    takenAt: row.taken_at,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
    medication: row.med_id
      ? {
          id: row.med_id,
          name: row.med_name,
          dosage: row.med_dosage,
          frequency: row.med_frequency,
        }
      : undefined,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT dl.*, m.id AS med_id, m.name AS med_name, m.dosage AS med_dosage, m.frequency AS med_frequency
     FROM dose_logs dl
     LEFT JOIN medications m ON m.id = dl.medication_id
     WHERE dl.user_id = $1
     ORDER BY dl.created_at DESC`,
    [req.auth.userId]
  );
  return res.json({ doseLogs: rows.map(toLog) });
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = doseLogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const med = await db.query(
    "SELECT id FROM medications WHERE id = $1 AND user_id = $2",
    [parsed.data.medicationId, req.auth.userId]
  );
  if (!med.rows.length) return res.status(404).json({ message: "Medication not found." });

  const { medicationId, scheduledFor, takenAt, status, note } = parsed.data;
  const { rows } = await db.query(
    `INSERT INTO dose_logs (user_id, medication_id, scheduled_for, taken_at, status, note)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.auth.userId, medicationId, scheduledFor ?? null, takenAt ?? null, status ?? "TAKEN", note ?? null]
  );
  return res.status(201).json({ doseLog: toLog(rows[0]) });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid dose log id." });

  const parsed = doseLogSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const existing = await db.query(
    "SELECT id FROM dose_logs WHERE id = $1 AND user_id = $2",
    [id, req.auth.userId]
  );
  if (!existing.rows.length) return res.status(404).json({ message: "Dose log not found." });

  const fields = [];
  const values = [];
  let i = 1;
  const map = { medicationId: "medication_id", scheduledFor: "scheduled_for", takenAt: "taken_at", status: "status", note: "note" };
  for (const [key, col] of Object.entries(map)) {
    if (parsed.data[key] !== undefined) {
      fields.push(`${col} = $${i++}`);
      values.push(parsed.data[key]);
    }
  }
  values.push(id);

  const { rows } = await db.query(
    `UPDATE dose_logs SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return res.json({ doseLog: toLog(rows[0]) });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid dose log id." });

  const existing = await db.query(
    "SELECT id FROM dose_logs WHERE id = $1 AND user_id = $2",
    [id, req.auth.userId]
  );
  if (!existing.rows.length) return res.status(404).json({ message: "Dose log not found." });

  await db.query("DELETE FROM dose_logs WHERE id = $1", [id]);
  return res.status(204).send();
});

module.exports = router;
