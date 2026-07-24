const express = require("express");
const paymentsRouter = require("./routes/payments");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "payment" });
});

app.use("/payments", paymentsRouter);

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
