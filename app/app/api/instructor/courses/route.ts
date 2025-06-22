// app/api/instructor/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/instructor/courses
 * Returns all courses for the authenticated instructor.
 */
export async function GET(req: NextRequest) {
  const instructorIdHeader = req.headers.get('X-Instructor-Id');
  if (!instructorIdHeader) {
    return NextResponse.json({ error: 'Unauthorized: Missing instructor ID' }, { status: 401 });
  }

  const instructorId = parseInt(instructorIdHeader, 10);
  if (isNaN(instructorId)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid instructor ID format' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, title, category, price, visibility, published
         FROM courses
        WHERE instructor_id = $1
        ORDER BY created_at DESC`,
      [instructorId]
    );
    return NextResponse.json({ courses: rows });
  } catch (err) {
    console.error('Error fetching instructor courses:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }
}
