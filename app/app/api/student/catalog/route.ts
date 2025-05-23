// app/api/student/catalog/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const result = await pool.query("SELECT * FROM courses WHERE published = true");
  return NextResponse.json({ courses: result.rows });
}
