// tests/db-utils.ts
import { Pool } from 'pg';

let pool: Pool;

export const getTestPool = () => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set for test database connection');
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
};

export const cleanupUserByEmail = async (email: string) => {
  const testPool = getTestPool();
  try {
    // First, get the instructor_id for the email
    const instructorRes = await testPool.query('SELECT id FROM instructors WHERE email = $1', [email]);
    if (instructorRes.rows.length === 0) {
      // console.log(`No instructor found with email ${email} to cleanup.`);
      return;
    }
    const instructorId = instructorRes.rows[0].id;

    // Delete sessions associated with the instructor
    await testPool.query('DELETE FROM sessions WHERE instructor_id = $1', [instructorId]);
    // console.log(`Cleaned up sessions for instructor ID ${instructorId}`);

    // Delete the instructor
    await testPool.query('DELETE FROM instructors WHERE id = $1', [instructorId]);
    // console.log(`Cleaned up instructor with email ${email}`);
  } catch (error) {
    console.error('Error during user cleanup:', error);
    // Depending on your test strategy, you might want to throw this error
    // or log it and continue. For now, let's log it.
  }
};

export const findSessionByToken = async (sessionToken: string) => {
  const testPool = getTestPool();
  const res = await testPool.query('SELECT * FROM sessions WHERE session_token = $1', [sessionToken]);
  return res.rows[0] || null;
};

export const findInstructorByEmail = async (email: string) => {
  const testPool = getTestPool();
  const res = await testPool.query('SELECT id, name, email, password_hash FROM instructors WHERE email = $1', [email]);
  return res.rows[0] || null;
};

// Optional: A function to close the pool if needed after all tests run
// This can be called in a global afterAll hook in jest.setup.js or jest.config.js
export const closeTestPool = async () => {
  if (pool) {
    await pool.end();
    // console.log('Test database pool closed.');
  }
};
