// tests/api/auth.test.ts
import request from 'supertest';
import { cleanupUserByEmail, findInstructorByEmail, findSessionByToken, getTestPool, closeTestPool } from '../db-utils'; // Adjust path as needed
import { Pool }e;

// Load APP_URL from environment, ensure it's set (via tests/setup.ts and .env.test)
const APP_URL = process.env.APP_URL;
if (!APP_URL) {
  throw new Error('APP_URL is not defined. Make sure it is set in your .env.test file and loaded in tests/setup.ts');
}

describe('Auth API Routes', () => {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`, // Unique email for each test run
    password: 'password123',
  };
  let createdSessionToken: string | null = null;

  // Cleanup after all tests in this suite or each test if preferred
  // Using afterAll for this example to clean up the specific test user
  afterAll(async () => {
    await cleanupUserByEmail(testUser.email);
    await closeTestPool(); // Close the database pool
  });

  describe('POST /api/auth/signup', () => {
    it('should signup a new user successfully', async () => {
      const response = await request(APP_URL)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(200); // Next.js often returns 200 for successful POSTs by default

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('instructorId');

      // Verify user in DB (optional, but good for confidence)
      const dbUser = await findInstructorByEmail(testUser.email);
      expect(dbUser).not.toBeNull();
      expect(dbUser?.name).toBe(testUser.name);
      // Password should be hashed, so dbUser.password_hash should not be testUser.password
      expect(dbUser?.password_hash).not.toBe(testUser.password);
    });

    it('should fail to signup with an existing email', async () => {
      // First, ensure the user exists (from previous test or create one for this specific test)
      // For simplicity, assuming the user from the previous test is there.
      // If tests are isolated, you'd create the user here first.
      const response = await request(APP_URL)
        .post('/api/auth/signup')
        .send(testUser) // Try to sign up again with the same email
        .expect(500); // Or 409 Conflict, depends on your API's error handling for duplicates

      expect(response.body).toHaveProperty('error');
      // The error message for unique constraint violation in PostgreSQL typically includes "duplicate key"
      // For example: "duplicate key value violates unique constraint \"instructors_email_key\""
      // You might want to make this check more generic if the error message can vary.
      // expect(response.body.error).toMatch(/duplicate key|already exists/i);
    });

    it('should fail to signup with missing name', async () => {
      const { name, ...userWithoutName } = testUser;
      const response = await request(APP_URL)
        .post('/api/auth/signup')
        .send({ ...userWithoutName, email: `new-${Date.now()}@example.com` }) // Use a new email
        .expect(400); // Assuming 400 for validation errors

      expect(response.body).toHaveProperty('error');
      // Add more specific error message check if your API provides it
    });
    
    it('should fail to signup with missing email', async () => {
        const { email, ...userWithoutEmail } = testUser;
        const response = await request(APP_URL)
          .post('/api/auth/signup')
          .send(userWithoutEmail)
          .expect(400); 
  
        expect(response.body).toHaveProperty('error');
      });

      it('should fail to signup with missing password', async () => {
        const { password, ...userWithoutPassword } = testUser;
        const response = await request(APP_URL)
          .post('/api/auth/signup')
          .send({ ...userWithoutPassword, email: `new-${Date.now()}@example.com` })
          .expect(400);
  
        expect(response.body).toHaveProperty('error');
      });
  });

  describe('POST /api/auth/login', () => {
    // Ensure user is signed up before trying to log in
    // This could be in a beforeAll for this describe block if this user is used in all login tests
    // For now, relying on the signup test above. If tests are run in isolation or order changes,
    // this will need its own setup.

    it('should login an existing user successfully and set session_token cookie', async () => {
      const response = await request(APP_URL)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      const cookieHeader = response.headers['set-cookie'];
      expect(cookieHeader).toBeDefined();
      
      const sessionCookie = cookieHeader.find((cookie: string) => cookie.startsWith('session_token='));
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toMatch(/HttpOnly/i);
      expect(sessionCookie).toMatch(/Path=\//i);
      expect(sessionCookie).toMatch(/SameSite=Lax/i); // Or Strict if you set that

      // Extract token for later tests
      if (sessionCookie) {
        createdSessionToken = sessionCookie.split(';')[0].split('=')[1];
        expect(createdSessionToken).toBeTruthy();
        // Verify session in DB
        const dbSession = await findSessionByToken(createdSessionToken!);
        expect(dbSession).not.toBeNull();
        const dbUser = await findInstructorByEmail(testUser.email);
        expect(dbSession?.instructor_id).toBe(dbUser?.id);
      }
    });

    it('should fail to login with invalid password', async () => {
      const response = await request(APP_URL)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should fail to login with non-existent email', async () => {
      const response = await request(APP_URL)
        .post('/api/auth/login')
        .send({ email: 'nosuchuser@example.com', password: 'password123' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return { user: null } when no session_token cookie is provided', async () => {
        // This test assumes the middleware will allow the request to pass if no token,
        // and the /api/auth/me handler itself returns { user: null }.
        // If middleware blocks with 401, this test needs to expect 401.
        // Based on current middleware, if no token, it proceeds, and /me route checks X-Instructor-Id.
        // If X-Instructor-Id is not set by middleware (because no token), /me returns { user: null }.
        const response = await request(APP_URL)
            .get('/api/auth/me')
            .expect(200); // Or 401 if middleware blocks unauthenticated requests to /api/auth/me
        
        expect(response.body).toEqual({ user: null });
    });

    it('should return user details when a valid session_token cookie is provided', async () => {
        if (!createdSessionToken) {
            // Fallback: if login test didn't run or failed to set token, try to log in again.
            // This makes the test more robust but also means it's not purely isolated.
            const loginResponse = await request(APP_URL)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password })
                .expect(200);
            const cookieHeader = loginResponse.headers['set-cookie'];
            const sessionCookie = cookieHeader.find((cookie: string) => cookie.startsWith('session_token='));
            if (sessionCookie) createdSessionToken = sessionCookie.split(';')[0].split('=')[1];
        }

        expect(createdSessionToken).toBeTruthy(); // Ensure we have a token

        const response = await request(APP_URL)
            .get('/api/auth/me')
            .set('Cookie', `session_token=${createdSessionToken}`)
            .expect(200);

        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('name', testUser.name);
        expect(response.body.user).toHaveProperty('email', testUser.email);
        expect(response.body.user).not.toHaveProperty('password_hash');
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
        // Ensure user is logged in and session token is available
        if (!createdSessionToken) {
            const loginResponse = await request(APP_URL)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password })
                .expect(200);
            const cookieHeader = loginResponse.headers['set-cookie'];
            const sessionCookie = cookieHeader.find((cookie: string) => cookie.startsWith('session_token='));
            if (sessionCookie) createdSessionToken = sessionCookie.split(';')[0].split('=')[1];
        }
        expect(createdSessionToken).toBeTruthy();
    });
    
    it('should logout the user and clear the session_token cookie', async () => {
        const response = await request(APP_URL)
            .post('/api/auth/logout')
            .set('Cookie', `session_token=${createdSessionToken}`) // Send the session token
            .expect(200);

        expect(response.body).toHaveProperty('success', true);

        const cookieHeader = response.headers['set-cookie'];
        expect(cookieHeader).toBeDefined();
        const sessionCookie = cookieHeader.find((cookie: string) => cookie.startsWith('session_token='));
        expect(sessionCookie).toBeDefined();
        // Check that the cookie is cleared (e.g., empty value, expires in the past)
        expect(sessionCookie).toMatch(/session_token=;/i); // Cleared value
        expect(sessionCookie).toMatch(/Expires=Thu, 01 Jan 1970/); // Expired date

        // Verify session is removed from DB
        const dbSession = await findSessionByToken(createdSessionToken!);
        expect(dbSession).toBeNull();
        createdSessionToken = null; // Reset for subsequent tests if any
    });
  });

});
