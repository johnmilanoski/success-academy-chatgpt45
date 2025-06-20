// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  const instructorIdHeader = req.headers.get('X-Instructor-Id');

  if (!instructorIdHeader) {
    return NextResponse.json({ user: null });
  }

  const instructorId = parseInt(instructorIdHeader, 10);

  if (isNaN(instructorId)) {
    // This case should ideally be caught by middleware, but good to have a check
    return NextResponse.json({ error: 'Invalid instructor ID format' }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, name, email FROM instructors WHERE id = $1`,
      [instructorId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ user: null, error: 'Instructor not found' }, { status: 404 });
    }

    const user = rows[0];
    return NextResponse.json({ user });
  } catch (error) {
    console.error('API /auth/me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
