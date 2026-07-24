jest.mock("../src/db", () => ({
  query: jest.fn(),
}));

const request = require("supertest");
const nock = require("nock");
const app = require("../src/app");
const pool = require("../src/db");

const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:3001";
const NOTIFICATION_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3002";

beforeEach(() => {
  pool.query.mockReset();
  nock.cleanAll();
});

describe("GET /health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
  });
});

describe("POST /orders", () => {
  it("confirms an order when payment succeeds", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: "o1",
            user_id: "u1",
            item: "widget",
            amount: 25,
            status: "pending",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "o1",
            user_id: "u1",
            item: "widget",
            amount: 25,
            status: "confirmed",
          },
        ],
      });

    nock(PAYMENT_URL).post("/payments").reply(200, { status: "success" });
    nock(NOTIFICATION_URL)
      .post("/notifications")
      .reply(200, { status: "sent" });

    const res = await request(app)
      .post("/orders")
      .send({ userId: "u1", item: "widget", amount: 25 });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("confirmed");
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it("marks order as payment_failed when payment declines", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: "o1",
            user_id: "u1",
            item: "widget",
            amount: 25,
            status: "pending",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "o1",
            user_id: "u1",
            item: "widget",
            amount: 25,
            status: "payment_failed",
          },
        ],
      });

    nock(PAYMENT_URL).post("/payments").reply(200, { status: "declined" });

    const res = await request(app)
      .post("/orders")
      .send({ userId: "u1", item: "widget", amount: 25 });

    expect(res.statusCode).toBe(402);
    expect(res.body.status).toBe("payment_failed");
  });

  it("returns 502 when payment service is unreachable", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: "o1",
            user_id: "u1",
            item: "widget",
            amount: 25,
            status: "pending",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "o1",
            user_id: "u1",
            item: "widget",
            amount: 25,
            status: "payment_service_unreachable",
          },
        ],
      });

    nock(PAYMENT_URL).post("/payments").replyWithError("connection refused");

    const res = await request(app)
      .post("/orders")
      .send({ userId: "u1", item: "widget", amount: 25 });

    expect(res.statusCode).toBe(502);
  });

  it("rejects missing required fields", async () => {
    const res = await request(app).post("/orders").send({ userId: "u1" });
    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});
