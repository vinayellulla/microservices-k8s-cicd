jest.mock("../src/db", () => ({
  query: jest.fn(),
}));

const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db");

beforeEach(() => {
  pool.query.mockReset();
});

describe("GET /health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
  });
});

describe("POST /payments", () => {
  it("succeeds for a normal amount", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: "p1",
          order_id: "o1",
          amount: 250,
          status: "success",
          processed_at: new Date().toISOString(),
        },
      ],
    });

    const res = await request(app)
      .post("/payments")
      .send({ orderId: "o1", amount: 250 });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("declines when amount exceeds threshold", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: "p2",
          order_id: "o1",
          amount: 15000,
          status: "declined",
          processed_at: new Date().toISOString(),
        },
      ],
    });

    const res = await request(app)
      .post("/payments")
      .send({ orderId: "o1", amount: 15000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("declined");
  });

  it("rejects missing fields", async () => {
    const res = await request(app).post("/payments").send({ orderId: "o1" });
    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("rejects a negative amount", async () => {
    const res = await request(app)
      .post("/payments")
      .send({ orderId: "o1", amount: -5 });
    expect(res.statusCode).toBe(400);
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValueOnce(new Error("connection timeout"));
    const res = await request(app)
      .post("/payments")
      .send({ orderId: "o1", amount: 100 });
    expect(res.statusCode).toBe(500);
  });
});

describe("GET /payments/:id", () => {
  it("returns 404 for unknown id", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get("/payments/does-not-exist");
    expect(res.statusCode).toBe(404);
  });
});
