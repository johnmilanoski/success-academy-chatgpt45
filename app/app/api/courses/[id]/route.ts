// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/courses/[id]
 * Fetch a single course along with its modules and lessons.
 */
export async function GET(req: NextRequest, { params }) {
  const courseId = parseInt(params.id, 10);
  const client = await pool.connect();

  try {
    // 1. Load the course
    const courseRes = await client.query(
      `SELECT * FROM courses WHERE id = $1`,
      [courseId]
    );
    const course = courseRes.rows[0];
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 2. Load modules
    const modulesRes = await client.query(
      `SELECT * FROM modules WHERE course_id = $1 ORDER BY position`,
      [courseId]
    );
    const modules = modulesRes.rows;

    // 3. For each module, load its lessons
    for (const mod of modules) {
      const lessonsRes = await client.query(
        `SELECT * FROM lessons WHERE module_id = $1 ORDER BY position`,
        [mod.id]
      );
      mod.lessons = lessonsRes.rows;
    }

    // 4. Attach modules to the course and return
    course.modules = modules;
    return NextResponse.json({ course });
  } catch (err) {
    console.error("Error loading course:", err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  } finally {
    client.release();
  }
}
