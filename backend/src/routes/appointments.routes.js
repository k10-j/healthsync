const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const appointmentSchema = z.object({
  title: z.string().min(1),
  providerName: z.string().optional(),
  location: z.string().optional(),
  appointmentAt: z.coerce.date(),
  notes: z.string().optional(),
});

router.get("/", requireAuth, async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { userId: req.auth.userId },
    orderBy: { appointmentAt: "asc" },
  });

  return res.json({ appointments });
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = appointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const appointment = await prisma.appointment.create({
    data: { ...parsed.data, userId: req.auth.userId },
  });

  return res.status(201).json({ appointment });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid appointment id." });
  }

  const parsed = appointmentSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const existing = await prisma.appointment.findFirst({ where: { id, userId: req.auth.userId } });
  if (!existing) {
    return res.status(404).json({ message: "Appointment not found." });
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: parsed.data,
  });

  return res.json({ appointment });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid appointment id." });
  }

  const existing = await prisma.appointment.findFirst({ where: { id, userId: req.auth.userId } });
  if (!existing) {
    return res.status(404).json({ message: "Appointment not found." });
  }

  await prisma.appointment.delete({ where: { id } });
  return res.status(204).send();
});

module.exports = router;
