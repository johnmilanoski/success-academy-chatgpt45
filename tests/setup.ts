// tests/setup.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test or .env if .env.test is not found
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

// You can add other global setup here if needed
// For example, setting up a global beforeAll/afterAll for database connections if not handled per test file.

// Ensure DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is not defined. Make sure you have a .env or .env.test file with DATABASE_URL.");
  // process.exit(1); // Exiting might be too disruptive for a test runner that has its own error handling
}
