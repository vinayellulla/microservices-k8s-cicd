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
  it("returns 200 and service status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("POST /users", () => {
  it("creates a user with valid input", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: "uuid-1",
          name: "Vinay",
          email: "vinaykumargun2@gmail.com",
          created_at: new Date().toISOString(),
        },
      ],
    });

    const res = await request(app)
      .post("/users")
      .send({ name: "Vinay", email: "vinaykumargun2@gmail.com" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Vinay");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      ["Vinay", "vinaykumargun2@gmail.com"],
    );
  });

  it("rejects missing required fields", async () => {
    const res = await request(app).post("/users").send({ name: "Incomplete" });
    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 409 when email already exists", async () => {
    const dupError = new Error(
      "duplicate key value violates unique constraint",
    );
    dupError.code = "23505";
    pool.query.mockRejectedValueOnce(dupError);

    const res = await request(app)
      .post("/users")
      .send({ name: "Vinay", email: "taken@example.com" });

    expect(res.statusCode).toBe(409);
  });

  it("returns 500 on unexpected database error", async () => {
    pool.query.mockRejectedValueOnce(new Error("connection timeout"));

    const res = await request(app)
      .post("/users")
      .send({ name: "Vinay", email: "vinay@example.com" });

    expect(res.statusCode).toBe(500);
  });
});

describe("GET /users/:id", () => {
  it("returns 404 for unknown id", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get("/users/does-not-exist");
    expect(res.statusCode).toBe(404);
  });

  it("returns the user when found", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: "uuid-1",
          name: "Vinay",
          email: "vinay@example.com",
          created_at: new Date().toISOString(),
        },
      ],
    });
    const res = await request(app).get("/users/uuid-1");
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Vinay");
  });
});
