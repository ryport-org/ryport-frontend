import { API_V1 } from "@/lib/config";
import type { ApiErrorBody, ApiSuccess, AuthTokens } from "@/lib/api/types";
import {
  getAccessToken,
  getRefreshToken,
  setRyportTokens,
} from "@/lib/auth/tokens";

export class ApiError extends Error {
  code: string;
  status: number;
  requestId?: string;
  details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    status: number,
    requestId?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: unknown;
  apiKey?: string;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return null as T;

  let json: ApiSuccess<T> | ApiErrorBody;
  try {
    json = (await res.json()) as ApiSuccess<T> | ApiErrorBody;
  } catch {
    throw new ApiError("parse_error", "Invalid response from server", res.status);
  }

  if (!json.success) {
    throw new ApiError(
      json.error.code,
      json.error.message,
      res.status,
      json.request_id,
      json.error.details,
    );
  }

  return json.data;
}

async function fetchWithAuth(
  path: string,
  options: RequestOptions,
): Promise<Response> {
  const { token, body, apiKey, headers: initHeaders, skipAuth, ...fetchOptions } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = skipAuth ? null : (token ?? getAccessToken());
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (apiKey) headers.set("Authorization", `ApiKey ${apiKey}`);

  return fetch(`${API_V1}${path}`, {
    ...fetchOptions,
    headers,
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  });
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const tokens = await apiRequest<AuthTokens>(
    "/users/auth/refresh/",
    { method: "POST", body: { refresh }, skipAuth: true, skipRefresh: true },
  );
  setRyportTokens(tokens.access, tokens.refresh);
  return tokens.access;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let res = await fetchWithAuth(path, options);

  if (res.status === 401 && !options.skipAuth && !options.skipRefresh && getRefreshToken()) {
    try {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        throw new ApiError("not_authenticated", "Session expired", 401);
      }
      res = await fetchWithAuth(path, { ...options, token: refreshed });
    } catch {
      throw new ApiError("not_authenticated", "Session expired", 401);
    }
  }

  return parseResponse<T>(res);
}

export async function apiRequestRaw(
  path: string,
  options: RequestOptions = {},
): Promise<Response> {
  return fetchWithAuth(path, options);
}

export async function healthCheck(): Promise<{ status: string }> {
  try {
    const res = await fetch(`${API_V1.replace("/api/v1", "")}/api/health/live/`);
    if (!res.ok) return { status: "error" };
    const json = await res.json();
    return json as { status: string };
  } catch {
    return { status: "error" };
  }
}
