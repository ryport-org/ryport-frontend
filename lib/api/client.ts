import { API_V1 } from "@/lib/config";
import type { ApiErrorBody, ApiSuccess } from "@/lib/api/types";

export class ApiError extends Error {
  code: string;
  status: number;
  requestId?: string;

  constructor(code: string, message: string, status: number, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: unknown;
  apiKey?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, body, apiKey, headers: initHeaders, ...fetchOptions } = options;

  const headers = new Headers(initHeaders);

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (apiKey) {
    headers.set("Authorization", `ApiKey ${apiKey}`);
  }

  const res = await fetch(`${API_V1}${path}`, {
    ...fetchOptions,
    headers,
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  });

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
    );
  }

  return json.data;
}

export async function apiRequestRaw(
  path: string,
  options: RequestOptions = {},
): Promise<Response> {
  const { token, body, apiKey, headers: initHeaders, ...fetchOptions } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
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
