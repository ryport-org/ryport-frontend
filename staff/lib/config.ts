export const STAFF_API_BASE_URL =
  process.env.NEXT_PUBLIC_STAFF_API_URL ?? "https://ryport.onrender.com";

export const STAFF_API_V1 = `${STAFF_API_BASE_URL.replace(/\/+$/, "")}/staff/api/v1`;

export const STAFF_APP_URL = (
  process.env.NEXT_PUBLIC_STAFF_APP_URL ?? "https://staff.ryport.com.ng"
).replace(/\/+$/, "");
