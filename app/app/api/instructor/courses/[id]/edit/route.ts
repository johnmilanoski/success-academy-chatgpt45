// app/api/instructor/courses/[id]/edit/route.ts
// app/app/api/instructor/courses/[id]/edit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * PATCH /api/instructor/courses/[id]/edit
 * Update course metadata (title, description, etc.).
 */
export async function PATCH(req: NextRequest, { params }) {
  const courseId = parseInt(params.id, 10);
  const { title, description, category, price, visibility } = await req.json();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Update the main course row
    await client.query(
      `UPDATE courses
         SET title = $1,
             description = $2,
             category = $3,
             price = $4,
             visibility = $5
       WHERE id = $6`,
      [title, description, category, price, visibility, courseId]
    );

    // (Optional) you could also update modules/lessons here

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Edit error:", err);
    return NextResponse.json({ error: "Failed to edit course" }, { status: 500 });
  } finally {
    client.release();
  }
}
