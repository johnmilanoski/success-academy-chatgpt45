// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { serialize } from "cookie";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const result = await pool.query(`SELECT * FROM instructors WHERE email = $1`, [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", serialize("instructor_id", String(user.id), { path: "/", httpOnly: true }));
  return res;
}
