const express = require("express");
const { z } = require("zod");
const db = require("../lib/db");

const router = express.Router();

router.get("/topics", async (_req, res) => {
  const { rows } = await db.query(
    `SELECT t.id, t.name, t.name_kn AS "nameKn", COUNT(a.id)::int AS "articleCount"
     FROM topics t
     LEFT JOIN articles a ON a.topic_id = t.id
     GROUP BY t.id
     ORDER BY t.created_at ASC`
  );
  return res.json({ topics: rows });
});

router.get("/articles", async (_req, res) => {
  const { rows } = await db.query(
    `SELECT a.id, a.title, a.title_kn AS "titleKn", a.topic_id AS category,
            a.read_time AS "readTime", a.verified, a.excerpt
     FROM articles a
     ORDER BY a.created_at DESC`
  );
  return res.json({ articles: rows });
});

router.get("/articles/:id", async (req, res) => {
  const parsed = z.object({ id: z.string().min(1) }).safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ message: "Invalid article id." });

  const { rows } = await db.query(
    `SELECT a.*, t.id AS t_id, t.name AS t_name, t.name_kn AS t_name_kn
     FROM articles a
     JOIN topics t ON t.id = a.topic_id
     WHERE a.id = $1`,
    [parsed.data.id]
  );
  if (!rows.length) return res.status(404).json({ message: "Article not found." });

  const a = rows[0];
  return res.json({
    article: {
      id: a.id,
      title: a.title,
      titleKn: a.title_kn,
      category: a.topic_id,
      readTime: a.read_time,
      verified: a.verified,
      excerpt: a.excerpt,
      content: a.content,
      topic: { id: a.t_id, name: a.t_name, nameKn: a.t_name_kn },
    },
  });
});

router.get("/search", async (req, res) => {
  const q = ((req.query.q || "")).trim();
  if (!q) return res.json({ articles: [] });

  const { rows } = await db.query(
    `SELECT id, title, title_kn AS "titleKn", topic_id AS category,
            read_time AS "readTime", verified, excerpt
     FROM articles
     WHERE title ILIKE $1 OR title_kn ILIKE $1 OR excerpt ILIKE $1
     ORDER BY created_at DESC`,
    [`%${q}%`]
  );
  return res.json({ articles: rows });
});

module.exports = router;
