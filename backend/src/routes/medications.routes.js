const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
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

router.get("/", requireAuth, async (req, res) => {
  const medications = await prisma.medication.findMany({
    where: { userId: req.auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ medications });
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = medicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const medication = await prisma.medication.create({
    data: { ...parsed.data, userId: req.auth.userId },
  });

  return res.status(201).json({ medication });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid medication id." });
  }

  const parsed = medicationSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const existing = await prisma.medication.findFirst({ where: { id, userId: req.auth.userId } });
  if (!existing) {
    return res.status(404).json({ message: "Medication not found." });
  }

  const medication = await prisma.medication.update({
    where: { id },
    data: parsed.data,
  });

  return res.json({ medication });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid medication id." });
  }

  const existing = await prisma.medication.findFirst({ where: { id, userId: req.auth.userId } });
  if (!existing) {
    return res.status(404).json({ message: "Medication not found." });
  }

  await prisma.medication.delete({ where: { id } });
  return res.status(204).send();
});

module.exports = router;
