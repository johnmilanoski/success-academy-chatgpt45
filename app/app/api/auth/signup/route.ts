// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO instructors (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
      [name, email, hash]
    );
    return NextResponse.json({ success: true, instructorId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
