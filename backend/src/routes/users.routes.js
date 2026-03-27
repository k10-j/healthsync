const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const updateProfileSchema = z.object({
  fullName: z.string().min(1),
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: { id: true, email: true, fullName: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.json({ user });
});

router.patch("/me", requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body.", errors: parsed.error.issues });
  }

  const user = await prisma.user.update({
    where: { id: req.auth.userId },
    data: { fullName: parsed.data.fullName },
    select: { id: true, email: true, fullName: true, createdAt: true, updatedAt: true },
  });

  return res.json({ user });
});

module.exports = router;
