const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  it("returns 200 and service status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("POST /users", () => {
  it("creates a user with valid input", async () => {
    const res = await request(app)
      .post("/users")
      .send({ name: "Vinay", email: "vinaykumargun2@gmail.com" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Vinay");
  });

  it("rejects missing required fields", async () => {
    const res = await request(app).post("/users").send({ name: "Incomplete" });
    expect(res.statusCode).toBe(400);
  });
});
