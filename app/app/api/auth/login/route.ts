// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { serialize } from "cookie";
import crypto from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const result = await pool.query(`SELECT * FROM instructors WHERE email = $1`, [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const sessionToken = crypto.randomBytes(32).toString("hex");
  const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
  const expiresAt = new Date(Date.now() + sessionDuration);

  await pool.query(
    `INSERT INTO sessions (session_token, instructor_id, expires_at) VALUES ($1, $2, $3)`,
    [sessionToken, user.id, expiresAt]
  );

  const res = NextResponse.json({ success: true });
  res.headers.set(
    "Set-Cookie",
    serialize("session_token", sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      expires: expiresAt,
      secure: process.env.NODE_ENV === "production",
    })
  );
  return res;
}
