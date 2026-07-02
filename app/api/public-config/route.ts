import { NextResponse } from "next/server";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/config";

/** Runtime public Supabase config for the browser (avoids stale build-time env). */
export async function GET() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!isSupabaseConfigured(url, anonKey)) {
    return NextResponse.json(
      {
        configured: false,
        error:
          "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local or Vercel.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ configured: true, url, anonKey });
}
