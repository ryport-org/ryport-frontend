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
  upgradeUrl?: string;

  constructor(
    code: string,
    message: string,
    status: number,
    requestId?: string,
    details?: Record<string, unknown>,
    upgradeUrl?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.details = details;
    this.upgradeUrl = upgradeUrl;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: unknown;
  apiKey?: string;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

type ParsedEnvelope<T> = {
  data: T;
  cached?: boolean;
};

function extractApiError(
  json: unknown,
  status: number,
): ApiError | null {
  if (typeof json !== "object" || json === null) return null;

  const body = json as Record<string, unknown>;

  if (body.success === true) return null;

  const err = body.error;
  if (typeof err !== "object" || err === null) return null;

  const error = err as {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
    upgrade_url?: string;
  };

  if (!error.code || !error.message) return null;

  return new ApiError(
    error.code,
    error.message,
    status,
    typeof body.request_id === "string" ? body.request_id : undefined,
    error.details,
    error.upgrade_url,
  );
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return null as T;

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("parse_error", "Invalid response from server", res.status);
  }

  const apiError = extractApiError(json, res.status);
  if (apiError) throw apiError;

  if (
    typeof json === "object" &&
    json !== null &&
    "success" in json &&
    (json as ApiSuccess<T>).success === true
  ) {
    return (json as ApiSuccess<T>).data;
  }

  throw new ApiError("parse_error", "Unexpected response from server", res.status);
}

async function parseResponseWithMeta<T>(res: Response): Promise<ParsedEnvelope<T>> {
  if (res.status === 204) return { data: null as T };

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("parse_error", "Invalid response from server", res.status);
  }

  const apiError = extractApiError(json, res.status);
  if (apiError) throw apiError;

  if (
    typeof json === "object" &&
    json !== null &&
    "success" in json &&
    (json as ApiSuccess<T>).success === true
  ) {
    const body = json as ApiSuccess<T> & { cached?: boolean };
    return { data: body.data, cached: body.cached };
  }

  throw new ApiError("parse_error", "Unexpected response from server", res.status);
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

  const accessToken = token ?? (skipAuth ? null : getAccessToken());
  if (!skipAuth && !accessToken && !apiKey) {
    throw new ApiError("not_authenticated", "Not logged in", 401);
  }
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

async function requestWithRefresh(
  path: string,
  options: RequestOptions,
): Promise<Response> {
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

  return res;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const res = await requestWithRefresh(path, options);
  return parseResponse<T>(res);
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ParsedEnvelope<T>> {
  const res = await requestWithRefresh(path, options);
  return parseResponseWithMeta<T>(res);
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
