const express = require("express");
const usersRouter = require("./routes/users");

const app = express();

app.use(express.json());

// Liveness/readiness probe target — Kubernetes hits this, not a business endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "user" });
});

app.use("/users", usersRouter);

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "not found" });
});

module.exports = app;
// trigger initial build
// trigger initial build
// trigger initial build
// trigger initial build
// trigger initial build
// rebuild after infra recreate
// rebuild after infra recreate
// rebuild after infra recreate
// rebuild after infra recreate
// rebuild after infra recreate
// rebuild after infra recreate
// rebuild after infra recreate
// rebuild after infra recreate
