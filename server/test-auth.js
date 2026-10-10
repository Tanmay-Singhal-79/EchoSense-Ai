/**
 * Automated Verification Script for EchoSense AI Authentication Engine
 * Tests all required endpoints:
 * 1. POST /api/auth/register
 * 2. POST /api/auth/login
 * 3. GET /api/auth/me
 * 4. POST /api/auth/face/enroll (128-d vector)
 * 5. POST /api/auth/face/login (Euclidean match verification)
 * 6. Biometric mismatch rejection test (distance > 0.52)
 * 7. DELETE /api/auth/face
 * 8. POST /api/auth/google
 * 9. POST /api/auth/logout
 */

const { app, server } = require('./server');

async function runTests() {
  console.log('\n--- STARTING ECHOSENSE AI AUTHENTICATION VERIFICATION ---\n');
  const baseUrl = 'http://localhost:5000/api';
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    assert(healthRes.status === 'online', '1. Server Health Check (/api/health)');

    // 2. User Registration
    const testEmail = `tanmay.singhal.${Date.now()}@echosense.ai`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tanmay Singhal',
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success && regData.token, '2. User Registration (POST /api/auth/register)');
    const token = regData.token;

    // 3. User Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success, '3. Email/Password Login (POST /api/auth/login)');

    // 4. Invalid Password Rejection
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword!',
      }),
    });
    assert(badLoginRes.status === 401, '4. Invalid Password Rejection (401)');

    // 5. Session Verification (GET /api/auth/me)
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.email === testEmail, '5. Current Session Profile (GET /api/auth/me)');

    // 6. Generate 128-dimensional facial descriptor vector
    const enrolledDescriptor = new Array(128).fill(0).map((_, i) => Math.sin(i) * 0.1);

    // 7. Face Biometric Enrollment
    const enrollRes = await fetch(`${baseUrl}/auth/face/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        descriptor: enrolledDescriptor,
        confidence: 0.96,
        device: 'EchoSense HD Camera',
      }),
    });
    const enrollData = await enrollRes.json();
    assert(enrollRes.status === 200 && enrollData.success, '6. Face Biometric Enrollment (POST /api/auth/face/enroll)');

    // 8. Face Login - Matching Candidate Vector (slight perturbation, distance ~0.05)
    const matchingCandidate = enrolledDescriptor.map((v) => v + (Math.random() - 0.5) * 0.005);
    const faceLoginRes = await fetch(`${baseUrl}/auth/face/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        faceDescriptor: matchingCandidate,
      }),
    });
    const faceLoginData = await faceLoginRes.json();
    assert(faceLoginRes.status === 200 && faceLoginData.success, '7. Face Login with Matching Vector (POST /api/auth/face/login)');

    // 9. Face Login - Mismatch Vector (completely different vector, distance > 1.0)
    const mismatchCandidate = new Array(128).fill(0).map((_, i) => Math.cos(i * 3) * 0.4);
    const mismatchRes = await fetch(`${baseUrl}/auth/face/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        faceDescriptor: mismatchCandidate,
      }),
    });
    const mismatchData = await mismatchRes.json();
    assert(mismatchRes.status === 401 && !mismatchData.success, '8. Face Login Rejection for Non-Matching Face (401)');

    // 10. Delete Face Biometric Data
    const delFaceRes = await fetch(`${baseUrl}/auth/face`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const delFaceData = await delFaceRes.json();
    assert(delFaceRes.status === 200 && delFaceData.success, '9. Remove Face Biometrics (DELETE /api/auth/face)');

    // 11. Google OAuth Flow
    const googleRes = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInfo: {
          email: 'dilansh.gupta@echosense.ai',
          name: 'Dilansh Gupta',
          sub: 'google_oauth_test_99281',
        },
      }),
    });
    const googleData = await googleRes.json();
    assert(googleRes.status === 200 && googleData.success, '10. Google OAuth Sign-In (POST /api/auth/google)');

    // 12. Logout
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
    });
    const logoutData = await logoutRes.json();
    assert(logoutRes.status === 200 && logoutData.success, '11. Logout & Cookie Clear (POST /api/auth/logout)');

    console.log(`\n========================================`);
    console.log(` TEST SUMMARY: ${passed} / ${total} TESTS PASSED!`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

// Allow server a moment to bind
setTimeout(runTests, 800);
