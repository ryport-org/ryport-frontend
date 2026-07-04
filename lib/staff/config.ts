import { API_BASE_URL, APP_URL } from "@/lib/staff/config";

export const STAFF_API_BASE_URL =
  process.env.NEXT_PUBLIC_STAFF_API_URL ?? API_BASE_URL;

export const STAFF_API_V1 = `${STAFF_API_BASE_URL.replace(/\/+$/, "")}/staff/api/v1`;

/** Staff UI lives on the same origin at `/staff`. */
export const STAFF_APP_URL = `${APP_URL.replace(/\/+$/, "")}/staff`;
