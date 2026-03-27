const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/topics", async (_req, res) => {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "asc" },
    include: { articles: { select: { id: true } } },
  });

  return res.json({
    topics: topics.map((t) => ({
      id: t.id,
      name: t.name,
      nameKn: t.nameKn,
      articleCount: t.articles.length,
    })),
  });
});

router.get("/articles", async (_req, res) => {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { topic: true },
  });

  return res.json({
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      titleKn: a.titleKn,
      category: a.topicId,
      readTime: a.readTime,
      verified: a.verified,
      excerpt: a.excerpt,
    })),
  });
});

router.get("/articles/:id", async (req, res) => {
  const paramsSchema = z.object({ id: z.string().min(1) });
  const parsed = paramsSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid article id." });
  }

  const article = await prisma.article.findUnique({
    where: { id: parsed.data.id },
    include: { topic: true },
  });

  if (!article) {
    return res.status(404).json({ message: "Article not found." });
  }

  return res.json({
    article: {
      id: article.id,
      title: article.title,
      titleKn: article.titleKn,
      category: article.topicId,
      readTime: article.readTime,
      verified: article.verified,
      excerpt: article.excerpt,
      content: article.content,
      topic: {
        id: article.topic.id,
        name: article.topic.name,
        nameKn: article.topic.nameKn,
      },
    },
  });
});

router.get("/search", async (req, res) => {
  const schema = z.object({ q: z.string().optional() });
  const parsed = schema.safeParse({ q: req.query.q });
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid search query." });
  }

  const q = (parsed.data.q || "").trim();
  if (!q) {
    return res.json({ articles: [] });
  }

  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { titleKn: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { topic: true },
  });

  return res.json({
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      titleKn: a.titleKn,
      category: a.topicId,
      readTime: a.readTime,
      verified: a.verified,
      excerpt: a.excerpt,
    })),
  });
});

module.exports = router;

