const express = require("express");
const pool = require("../db");

const router = express.Router();

const DECLINE_THRESHOLD = 10000;

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payments WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "payment not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /payments/:id failed:", err.message);
    res.status(500).json({ error: "internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || amount === undefined) {
    return res.status(400).json({ error: "orderId and amount are required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  const status = amount > DECLINE_THRESHOLD ? "declined" : "success";

  try {
    const result = await pool.query(
      "INSERT INTO payments (order_id, amount, status) VALUES ($1, $2, $3) RETURNING *",
      [orderId, amount, status],
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("POST /payments failed:", err.message);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
