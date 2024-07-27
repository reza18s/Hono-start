import app from "../src";
import { expect, test, describe } from "bun:test";

describe("userRoute", () => {
  let userData: {
    status: string;
    token: string;
    data: { user: { name: string; email: string; _id: string } };
  };
  test("GET /api/v1/users", async () => {
    const res = await app.request("/api/v1/users", {});
    expect(res.status).toBe(200);
  });
  test("POST /api/v1/users/signup", async () => {
    const res = await app.request("/api/v1/users/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "admin",
        email: "test@test.com",
        password: "Test2079##",
        passwordConfirm: "Test2079##",
      }),
      headers: { "Content-Type": "application/json" },
    });
    userData = await res.json();
    expect(res.status).toBe(201);
  });
  test("POST /api/v1/users/signin", async () => {
    const res = await app.request("/api/v1/users/signin", {
      method: "POST",
      body: JSON.stringify({
        email: userData.data.user.email,
        password: "Test2079##",
      }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    const response = await res.json();
    expect(response).toContainAllKeys(["token", "data", "status"]);
    expect(response.data.user).toContainValues([userData.data.user.email]);
  });
  test("GET /api/v1/users/get-me", async () => {
    const res = await app.request("/api/v1/users/get-me", {
      headers: {
        Cookie: `jwt=${userData.token}`,
      },
    });
    expect(res.status).toBe(200);
    const response = await res.json();
    expect(response.data.user).toContainValue(userData.data.user.email);
  });
  test("PATCH /api/v1/users/update-me", async () => {
    const res = await app.request("/api/v1/users/update-me", {
      method: "PATCH",
      body: JSON.stringify({
        name: "admin",
      }),
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${userData.token}`,
      },
    });
    expect(res.status).toBe(201);
    const response = await res.json();
    expect(response.data.user).toContainValues(["admin"]);
  });
  test("PATCH /api/v1/users/update-password", async () => {
    const res = await app.request("/api/v1/users/update-password", {
      method: "PATCH",
      body: JSON.stringify({
        password: "Test2079##",
        newPassword: "Test2079###",
        newPasswordConfirm: "Test2079###",
      }),
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${userData.token}`,
      },
    });
    expect(res.status).toBe(200);
    const response = await res.json();
    userData = response;
    expect(response).toContainAllKeys(["token", "data", "status"]);
    // expect(response.data.user).toContainValues([userData.data.user.email]);
  });
  test("DELETE /api/v1/users/delete-me", async () => {
    const res = await app.request("/api/v1/users/delete-me", {
      method: "DELETE",
      headers: {
        Cookie: `jwt=${userData.token}`,
      },
    });
    expect(res.status).toBe(204);
    const response = await res.json();
    expect(response.data).toBe(null);
  });
  test("GET /api/v1/users/:id", async () => {
    const res = await app.request(`/api/v1/users/${userData.data.user._id}`, {
      headers: {
        Cookie: `jwt=${process.env.ADMIN_COOKIE}`,
      },
    });
    expect(res.status).toBe(200);
    const response = await res.json();
    expect(response.data.doc).toContainValue(userData.data.user.email);
  });
  test("PATCH /api/v1/users/:id", async () => {
    const res = await app.request(`/api/v1/users/${userData.data.user._id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: "test",
      }),
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${process.env.ADMIN_COOKIE}`,
      },
    });
    expect(res.status).toBe(200);
    const response = await res.json();
    expect(response.data.user).toContainValues(["test"]);
  });
  test("DELETE /api/v1/users/:id", async () => {
    const res = await app.request(`/api/v1/users/${userData.data.user._id}`, {
      method: "DELETE",
      headers: {
        Cookie: `jwt=${process.env.ADMIN_COOKIE}`,
      },
    });
    expect(res.status).toBe(204);
    const response = await res.json();
    expect(response.data).toBe(null);
  });
});
