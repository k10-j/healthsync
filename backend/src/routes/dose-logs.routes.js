const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const doseLogSchema = z.object({
  medicationId: z.number().int().positive(),
  scheduledFor: z.coerce.date().optional(),
  takenAt: z.coerce.date().optional(),
  status: z.enum(["TAKEN", "SKIPPED", "MISSED"]).optional(),
  note: z.string().optional(),
});

router.get("/", requireAuth, async (req, res) => {
  const doseLogs = await prisma.doseLog.findMany({
    where: { userId: req.auth.userId },
    include: { medication: true },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ doseLogs });
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = doseLogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const medication = await prisma.medication.findFirst({
    where: { id: parsed.data.medicationId, userId: req.auth.userId },
  });
  if (!medication) {
    return res.status(404).json({ message: "Medication not found." });
  }

  const doseLog = await prisma.doseLog.create({
    data: { ...parsed.data, userId: req.auth.userId },
  });

  return res.status(201).json({ doseLog });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid dose log id." });
  }

  const parsed = doseLogSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const existing = await prisma.doseLog.findFirst({ where: { id, userId: req.auth.userId } });
  if (!existing) {
    return res.status(404).json({ message: "Dose log not found." });
  }

  const doseLog = await prisma.doseLog.update({
    where: { id },
    data: parsed.data,
  });

  return res.json({ doseLog });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid dose log id." });
  }

  const existing = await prisma.doseLog.findFirst({ where: { id, userId: req.auth.userId } });
  if (!existing) {
    return res.status(404).json({ message: "Dose log not found." });
  }

  await prisma.doseLog.delete({ where: { id } });
  return res.status(204).send();
});

module.exports = router;
