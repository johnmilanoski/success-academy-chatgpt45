// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get("session_token")?.value;

  if (sessionToken) {
    await pool.query(`DELETE FROM sessions WHERE session_token = $1`, [sessionToken]);
  }

  const res = NextResponse.json({ success: true });
  res.headers.set(
    "Set-Cookie",
    serialize("session_token", "", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
    })
  );
  return res;
}
