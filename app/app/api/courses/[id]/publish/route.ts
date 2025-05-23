// app/api/courses/[id]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Connect to PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * POST /api/courses/[id]/publish
 * Marks the course as published (published = true)
 */
export async function POST(req: NextRequest, { params }) {
  const courseId = parseInt(params.id, 10);
  const client = await pool.connect();

  try {
    await client.query(`UPDATE courses SET published = true WHERE id = $1`, [courseId]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Publish error:", err);
    return NextResponse.json({ error: "Failed to publish course" }, { status: 500 });
  } finally {
    client.release();
  }
}
