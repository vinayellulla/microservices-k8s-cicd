const express = require("express");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// In-memory store — replace with Postgres, or a real queue (SQS), once infra is applied
const notifications = new Map();

router.get("/", (req, res) => {
  res.json(Array.from(notifications.values()));
});

router.post("/", (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "userId and message are required" });
  }

  const notification = {
    id: uuidv4(),
    userId,
    message,
    status: "sent",
    sentAt: new Date().toISOString(),
  };

  notifications.set(notification.id, notification);

  // Placeholder for real delivery (Slack/email) — logged for now
  console.log(`[notification] to user ${userId}: ${message}`);

  res.status(201).json(notification);
});

module.exports = router;
