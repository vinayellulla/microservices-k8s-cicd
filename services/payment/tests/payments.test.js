const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
  });
});

describe("POST /payments", () => {
  it("succeeds for a normal amount", async () => {
    const res = await request(app)
      .post("/payments")
      .send({ orderId: "o1", amount: 250 });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("declines when amount exceeds threshold", async () => {
    const res = await request(app)
      .post("/payments")
      .send({ orderId: "o1", amount: 15000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("declined");
  });

  it("rejects missing fields", async () => {
    const res = await request(app).post("/payments").send({ orderId: "o1" });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a negative amount", async () => {
    const res = await request(app)
      .post("/payments")
      .send({ orderId: "o1", amount: -5 });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /payments/:id", () => {
  it("returns 404 for unknown id", async () => {
    const res = await request(app).get("/payments/does-not-exist");
    expect(res.statusCode).toBe(404);
  });
});
