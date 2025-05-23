// app/api/student/purchase/route.ts
// app/app/api/student/purchase/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Connect to your database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * POST /api/student/purchase
 * Record that a student has purchased a course.
 * Expects JSON body: { studentId: number, courseId: number }
 */
export async function POST(req: NextRequest) {
  try {
    const { studentId, courseId } = await req.json();

    if (typeof studentId !== "number" || typeof courseId !== "number") {
      return NextResponse.json(
        { error: "studentId and courseId must be numbers" },
        { status: 400 }
      );
    }

    await pool.query(
      `INSERT INTO purchases (student_id, course_id) VALUES ($1, $2)`,
      [studentId, courseId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Purchase error:", err);
    return NextResponse.json(
      { error: "Failed to record purchase" },
      { status: 500 }
    );
  }
}
