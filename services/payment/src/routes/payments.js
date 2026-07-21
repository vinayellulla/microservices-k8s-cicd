const express = require("express");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// In-memory store — replace with Postgres (RDS) once infra is applied
const payments = new Map();

const DECLINE_THRESHOLD = 10000;

router.get("/:id", (req, res) => {
  const payment = payments.get(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: "payment not found" });
  }
  res.json(payment);
});

router.post("/", (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || amount === undefined) {
    return res.status(400).json({ error: "orderId and amount are required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  const status = amount > DECLINE_THRESHOLD ? "declined" : "success";

  const payment = {
    id: uuidv4(),
    orderId,
    amount,
    status,
    processedAt: new Date().toISOString(),
  };

  payments.set(payment.id, payment);
  res.status(200).json(payment);
});

module.exports = router;
