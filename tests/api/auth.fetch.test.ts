// tests/api/auth.fetch.test.ts
import assert from 'assert';
import { Pool } from 'pg'; // Only for type if needed, db-utils handles pool
import { cleanupUserByEmail, findInstructorByEmail, findSessionByToken, getTestPool, closeTestPool } from '../db-utils';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is not defined. Make sure you have a .env or .env.test file with DATABASE_URL.");
  process.exit(1);
}

console.log(`Using APP_URL: ${APP_URL}`);
console.log(`Using DATABASE_URL: ${process.env.DATABASE_URL ? 'Loaded' : 'NOT LOADED'}`);


// --- Test Cases ---

async function testSignUpAndLogin() {
  console.log('\nRunning test: testSignUpAndLogin');
  const uniqueEmail = `testuser-${Date.now()}@example.com`;
  const testUser = {
    name: 'Test User Fetch',
    email: uniqueEmail,
    password: 'password123',
  };
  let sessionCookie = '';

  try {
    // 1. Signup
    console.log('  Step 1: Signup');
    const signupResponse = await fetch(`${APP_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const signupData = await signupResponse.json();
    assert.strictEqual(signupResponse.status, 200, `Signup failed: ${signupResponse.status} ${JSON.stringify(signupData)}`);
    assert.strictEqual(signupData.success, true, 'Signup response success was not true');
    console.log('    Signup successful.');

    // 2. Login (Valid User)
    console.log('  Step 2: Login (Valid User)');
    const loginResponse = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const loginData = await loginResponse.json();
    assert.strictEqual(loginResponse.status, 200, `Login failed: ${loginResponse.status} ${JSON.stringify(loginData)}`);
    assert.strictEqual(loginData.success, true, 'Login response success was not true');

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    assert.ok(setCookieHeader, 'Set-Cookie header not found');
    const match = setCookieHeader.match(/session_token=([^;]+)/);
    assert.ok(match && match[1], 'session_token not found in Set-Cookie header');
    sessionCookie = `session_token=${match[1]}`;
    console.log(`    Login successful. Session cookie obtained: ${sessionCookie.substring(0,30)}...`);

    // 3. Get Me (Authenticated)
    console.log('  Step 3: Get Me (Authenticated)');
    const meResponse = await fetch(`${APP_URL}/api/auth/me`, {
      headers: { 'Cookie': sessionCookie },
    });
    const meData = await meResponse.json();
    assert.strictEqual(meResponse.status, 200, `/api/auth/me failed: ${meResponse.status} ${JSON.stringify(meData)}`);
    assert.ok(meData.user, '/api/auth/me response user is null or undefined');
    assert.strictEqual(meData.user.email, testUser.email, 'User email mismatch');
    assert.strictEqual(meData.user.name, testUser.name, 'User name mismatch');
    console.log('    Get Me successful.');

    // 4. Logout
    console.log('  Step 4: Logout');
    const logoutResponse = await fetch(`${APP_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Cookie': sessionCookie },
    });
    const logoutData = await logoutResponse.json();
    assert.strictEqual(logoutResponse.status, 200, `Logout failed: ${logoutResponse.status} ${JSON.stringify(logoutData)}`);
    assert.strictEqual(logoutData.success, true, 'Logout response success was not true');
    const clearedCookieHeader = logoutResponse.headers.get('set-cookie');
    assert.ok(clearedCookieHeader && clearedCookieHeader.includes('session_token=;') && clearedCookieHeader.includes('Max-Age=0'), 'Session token not cleared on logout');
    console.log('    Logout successful.');

    // 5. Get Me (After Logout)
    console.log('  Step 5: Get Me (After Logout)');
    // The middleware redirects to /login for pages if not authenticated.
    // For API routes, it returns 401 if it's a protected API path and no valid session.
    // The /api/auth/me route itself, if reached without X-Instructor-Id (because middleware didn't add it), returns { user: null } with status 200.
    // Let's check which behavior is current. The middleware protects /api/instructor, /api/courses, /api/upload.
    // /api/auth/me is NOT in the protectedApiPaths in middleware.ts, so it should rely on its own logic.
    const meAfterLogoutResponse = await fetch(`${APP_URL}/api/auth/me`, {
        // No cookie or the cleared one
    });
    const meAfterLogoutData = await meAfterLogoutResponse.json();
    assert.strictEqual(meAfterLogoutResponse.status, 200, `/api/auth/me after logout failed status: ${meAfterLogoutResponse.status} ${JSON.stringify(meAfterLogoutData)}`);
    assert.strictEqual(meAfterLogoutData.user, null, '/api/auth/me after logout should return user: null');
    console.log('    Get Me after logout successful.');

    console.log('Test testSignUpAndLogin PASSED');
  } catch (error) {
    console.error('Test testSignUpAndLogin FAILED:', error);
    throw error; // Re-throw to fail the script
  } finally {
    await cleanupUserByEmail(testUser.email);
    console.log(`  Cleanup for ${testUser.email} done.`);
  }
}

async function testLoginInvalidCredentials() {
  console.log('\nRunning test: testLoginInvalidCredentials');
  const uniqueEmail = `testuser-invalid-${Date.now()}@example.com`;
  const testUser = { name: 'Test Invalid Login', email: uniqueEmail, password: 'password123' };

  try {
    // Setup: Create a user first
    const signupResponse = await fetch(`${APP_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    assert.strictEqual(signupResponse.status, 200, 'Setup signup failed');
    console.log('  Setup: User created.');

    // 1. Attempt login with correct email, wrong password
    console.log('  Step 1: Login with wrong password');
    const wrongPasswordResponse = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' }),
    });
    const wrongPasswordData = await wrongPasswordResponse.json();
    assert.strictEqual(wrongPasswordResponse.status, 401, `Login with wrong password should be 401: ${JSON.stringify(wrongPasswordData)}`);
    console.log('    Login with wrong password successful (got 401).');

    // 2. Attempt login with non-existent email
    console.log('  Step 2: Login with non-existent email');
    const nonExistentEmailResponse = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nosuchuser@example.com', password: 'password123' }),
    });
    const nonExistentEmailData = await nonExistentEmailResponse.json();
    assert.strictEqual(nonExistentEmailResponse.status, 401, `Login with non-existent email should be 401: ${JSON.stringify(nonExistentEmailData)}`);
    console.log('    Login with non-existent email successful (got 401).');

    console.log('Test testLoginInvalidCredentials PASSED');
  } catch (error) {
    console.error('Test testLoginInvalidCredentials FAILED:', error);
    throw error;
  } finally {
    await cleanupUserByEmail(testUser.email);
    console.log(`  Cleanup for ${testUser.email} done.`);
  }
}

async function testSignUpExistingEmail() {
  console.log('\nRunning test: testSignUpExistingEmail');
  const uniqueEmail = `testuser-existing-${Date.now()}@example.com`;
  const testUser = { name: 'Test Existing Email', email: uniqueEmail, password: 'password123' };

  try {
    // Setup: Create a user first
    console.log('  Setup: Creating initial user');
    const signupResponse1 = await fetch(`${APP_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    assert.strictEqual(signupResponse1.status, 200, `Initial signup failed: ${JSON.stringify(await signupResponse1.json())}`);
    console.log('    Initial user created.');

    // Attempt signup again with the SAME email
    console.log('  Step 1: Attempting signup with existing email');
    const signupResponse2 = await fetch(`${APP_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testUser, name: 'Another Name' }), // Same email, different name
    });
    const signupData2 = await signupResponse2.json();
    // The current /api/auth/signup route returns 500 for duplicate email due to DB constraint
    assert.strictEqual(signupResponse2.status, 500, `Signup with existing email should be 500 (or 409 if handled): ${JSON.stringify(signupData2)}`);
    console.log('    Signup with existing email correctly failed (got 500).');

    console.log('Test testSignUpExistingEmail PASSED');
  } catch (error) {
    console.error('Test testSignUpExistingEmail FAILED:', error);
    throw error;
  } finally {
    await cleanupUserByEmail(testUser.email);
    console.log(`  Cleanup for ${testUser.email} done.`);
  }
}

async function main() {
  try {
    // Ensure DB connection is available before running tests
    const pool = getTestPool();
    await pool.query('SELECT NOW()'); // Test connection
    console.log('Database connection successful.');

    await testSignUpAndLogin();
    await testLoginInvalidCredentials();
    await testSignUpExistingEmail();

    console.log('\nAll fetch tests PASSED!');
  } catch (error) {
    console.error('\nOne or more fetch tests FAILED.');
    process.exitCode = 1; // Indicate failure
  } finally {
    await closeTestPool(); // Close the shared pool
    console.log('\nDatabase pool closed. Test run finished.');
  }
}

// --- Instructions ---
// To run these tests:
// 1. Ensure your Next.js development server is running (e.g., `npm run dev` or `next dev`).
//    The server should be accessible at the APP_URL (default: http://localhost:3000).
// 2. Ensure your PostgreSQL database server is running and accessible via DATABASE_URL.
//    The .env.test or .env file should have the correct DATABASE_URL.
// 3. Open your terminal and run the command:
//    `ts-node tests/api/auth.fetch.test.ts`
//    (Or `npx ts-node tests/api/auth.fetch.test.ts` if ts-node is not globally installed or not in project scripts)

main();
