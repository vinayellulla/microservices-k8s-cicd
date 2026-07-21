const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
  });
});

describe("POST /notifications", () => {
  it("creates a notification with valid input", async () => {
    const res = await request(app)
      .post("/notifications")
      .send({ userId: "u1", message: "Order confirmed" });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("sent");
  });

  it("rejects missing fields", async () => {
    const res = await request(app)
      .post("/notifications")
      .send({ userId: "u1" });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /notifications", () => {
  it("returns a list", async () => {
    const res = await request(app).get("/notifications");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
