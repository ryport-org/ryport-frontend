import { STAFF_API_V1 } from "@/lib/config";
import type { ApiErrorBody, ApiSuccess } from "@/lib/api/types";
import {
  getStaffAccessToken,
  getStaffRefreshToken,
  setStaffTokens,
} from "@/lib/auth/tokens";

export class StaffApiError extends Error {
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
    this.name = "StaffApiError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: unknown;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return null as T;

  let json: ApiSuccess<T> | ApiErrorBody;
  try {
    json = (await res.json()) as ApiSuccess<T> | ApiErrorBody;
  } catch {
    throw new StaffApiError("parse_error", "Invalid response from server", res.status);
  }

  if (!json.success) {
    throw new StaffApiError(
      json.error.code,
      json.error.message,
      res.status,
      json.request_id,
      json.error.details,
    );
  }

  return json.data;
}

async function fetchWithAuth(path: string, options: RequestOptions): Promise<Response> {
  const { token, body, headers: initHeaders, skipAuth, ...fetchOptions } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = token ?? (skipAuth ? null : getStaffAccessToken());
  if (!skipAuth && !accessToken) {
    throw new StaffApiError("not_authenticated", "Not logged in", 401);
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(`${STAFF_API_V1}${path}`, {
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
  const refresh = getStaffRefreshToken();
  if (!refresh) return null;

  const data = await staffRequest<{ access: string }>("/auth/refresh/", {
    method: "POST",
    body: { refresh },
    skipAuth: true,
    skipRefresh: true,
  });
  setStaffTokens(data.access, refresh);
  return data.access;
}

export async function staffRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let res = await fetchWithAuth(path, options);

  if (res.status === 401 && !options.skipAuth && !options.skipRefresh && getStaffRefreshToken()) {
    try {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        throw new StaffApiError("not_authenticated", "Session expired", 401);
      }
      res = await fetchWithAuth(path, { ...options, token: refreshed });
    } catch {
      throw new StaffApiError("not_authenticated", "Session expired", 401);
    }
  }

  return parseResponse<T>(res);
}
