const express = require("express");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const router = express.Router();

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:3001";
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3002";

// In-memory store — replace with Postgres (RDS) once infra is applied
const orders = new Map();

router.get("/", (req, res) => {
  res.json(Array.from(orders.values()));
});

router.get("/:id", (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "order not found" });
  }
  res.json(order);
});

router.post("/", async (req, res) => {
  const { userId, item, amount } = req.body;

  if (!userId || !item || !amount) {
    return res
      .status(400)
      .json({ error: "userId, item and amount are required" });
  }

  const order = {
    id: uuidv4(),
    userId,
    item,
    amount,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    // Charge payment
    const paymentRes = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, {
      orderId: order.id,
      amount,
    });

    order.status =
      paymentRes.data.status === "success" ? "confirmed" : "payment_failed";
    orders.set(order.id, order);

    // Fire-and-forget notification — a failure here shouldn't fail the order
    if (order.status === "confirmed") {
      axios
        .post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
          userId,
          message: `Order ${order.id} confirmed`,
        })
        .catch((err) => {
          console.error("notification failed:", err.message);
        });
    }

    const statusCode = order.status === "confirmed" ? 201 : 402;
    res.status(statusCode).json(order);
  } catch (err) {
    order.status = "payment_service_unreachable";
    orders.set(order.id, order);
    res.status(502).json({ error: "payment service unreachable", order });
  }
});

module.exports = router;
