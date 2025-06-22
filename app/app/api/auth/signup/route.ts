// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || name.trim() === "") {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }
  if (!email || email.trim() === "") {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  if (!password || password.trim() === "") {
    return NextResponse.json({ error: "Missing password" }, { status: 400 });
  }

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
