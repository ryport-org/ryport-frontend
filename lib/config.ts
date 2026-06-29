/** Replace with your deployed API URL in Vercel env: NEXT_PUBLIC_API_URL */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.ryport.example.com";

export const API_V1 = `${API_BASE_URL}/api/v1`;

export const OAUTH_CALLBACK_URL =
  process.env.NEXT_PUBLIC_OAUTH_CALLBACK_URL ??
  (typeof window !== "undefined"
    ? `${window.location.origin}/oauth/callback`
    : "http://localhost:3000/oauth/callback");
