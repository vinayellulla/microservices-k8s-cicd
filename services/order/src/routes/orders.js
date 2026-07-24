const express = require("express");
const axios = require("axios");
const pool = require("../db");

const router = express.Router();

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:3001";
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3002";

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /orders failed:", err.message);
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "order not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /orders/:id failed:", err.message);
    res.status(500).json({ error: "internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { userId, item, amount } = req.body;

  if (!userId || !item || !amount) {
    return res
      .status(400)
      .json({ error: "userId, item and amount are required" });
  }

  try {
    // Insert as pending first — guarantees the order row exists even if payment fails
    const insertResult = await pool.query(
      "INSERT INTO orders (user_id, item, amount, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, item, amount, "pending"],
    );
    let order = insertResult.rows[0];

    try {
      const paymentRes = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, {
        orderId: order.id,
        amount,
      });

      const newStatus =
        paymentRes.data.status === "success" ? "confirmed" : "payment_failed";

      const updateResult = await pool.query(
        "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
        [newStatus, order.id],
      );
      order = updateResult.rows[0];

      if (newStatus === "confirmed") {
        axios
          .post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
            userId,
            message: `Order ${order.id} confirmed`,
          })
          .catch((err) => console.error("notification failed:", err.message));
      }

      const statusCode = newStatus === "confirmed" ? 201 : 402;
      res.status(statusCode).json(order);
    } catch (paymentErr) {
      const updateResult = await pool.query(
        "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
        ["payment_service_unreachable", order.id],
      );
      res.status(502).json({
        error: "payment service unreachable",
        order: updateResult.rows[0],
      });
    }
  } catch (err) {
    console.error("POST /orders failed:", err.message);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
