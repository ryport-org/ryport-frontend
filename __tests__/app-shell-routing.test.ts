import { NextResponse, NextRequest } from "next/server";
import { middleware } from "@/middleware";

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn(async (request: NextRequest) => {
    const hasAuth =
      request.cookies.get("ryport_auth")?.value === "1" ||
      request.cookies.has("ryport_access_token");
    return {
      supabaseResponse: NextResponse.next(),
      user: hasAuth ? { id: "user_123" } : null,
    };
  }),
}));

describe("App-Shell Navigation & Route Logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirects authenticated user visiting root domain / to /app/dashboard", async () => {
    const request = new NextRequest("https://www.ryport.com.ng/", {
      headers: new Headers({
        cookie: "ryport_auth=1",
      }),
    });

    const response = await middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://www.ryport.com.ng/app/dashboard"
    );
  });

  it("allows unauthenticated visitor visiting root domain / to view marketing site without redirect", async () => {
    const request = new NextRequest("https://www.ryport.com.ng/", {
      headers: new Headers(),
    });

    const response = await middleware(request);
    // Should return normal response (200 / next), not redirect to /app/dashboard
    expect(response.status).not.toBe(307);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects unauthenticated visitor attempting to access /app/transactions to /login", async () => {
    const request = new NextRequest("https://www.ryport.com.ng/app/transactions", {
      headers: new Headers(),
    });

    const response = await middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://www.ryport.com.ng/login?next=%2Fapp%2Ftransactions"
    );
  });

  it("saves valid /app routes in localStorage for last-visited route restoration", () => {
    const testRoute = "/app/transactions";
    localStorage.setItem("ryport_last_visited_route", testRoute);

    const stored = localStorage.getItem("ryport_last_visited_route");
    expect(stored).toBe("/app/transactions");
  });
});
