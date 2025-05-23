// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const visibility = formData.get("visibility") as string;
    const modulesRaw = formData.get("modules") as string;

    const modules = JSON.parse(modulesRaw);
    const instructorId = 1; // Replace with real auth later

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const courseRes = await client.query(
        `INSERT INTO courses (instructor_id, title, description, category, price, visibility, published)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [instructorId, title, description, category, price, visibility, false]
      );
      const courseId = courseRes.rows[0].id;

      for (let mi = 0; mi < modules.length; mi++) {
        const mod = modules[mi];
        const modRes = await client.query(
          `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
          [courseId, mod.title, mi + 1]
        );
        const moduleId = modRes.rows[0].id;

        if (mod.lessons) {
          for (let li = 0; li < mod.lessons.length; li++) {
            const lesson = mod.lessons[li];
            await client.query(
              `INSERT INTO lessons (module_id, title, position) VALUES ($1, $2, $3)`,
              [moduleId, lesson.title, li + 1]
            );
          }
        }
      }

      await client.query("COMMIT");
      return NextResponse.json({ success: true, courseId });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("DB error:", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
