const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /users failed:", err.message);
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.params.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /users/:id failed:", err.message);
    res.status(500).json({ error: "internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at",
      [name, email],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation on email
      return res.status(409).json({ error: "email already exists" });
    }
    console.error("POST /users failed:", err.message);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
