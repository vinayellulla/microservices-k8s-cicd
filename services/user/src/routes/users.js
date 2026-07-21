const express = require("express");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// In-memory store — replace with Postgres (RDS) once infra is applied
const users = new Map();

router.get("/", (req, res) => {
  res.json(Array.from(users.values()));
});

router.get("/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  res.json(user);
});

router.post("/", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = {
    id: uuidv4(),
    name,
    email,
    createdAt: new Date().toISOString(),
  };
  users.set(user.id, user);
  res.status(201).json(user);
});

module.exports = router;
