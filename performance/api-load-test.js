import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp-up to 10 users
    { duration: '1m', target: 10 },    // Stay at 10 users
    { duration: '30s', target: 20 },   // Spike to 20 users
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 0 },    // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
    errors: ['rate<0.1'],              // Custom error rate less than 10%
  },
};

// Environment configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api/v1';
const EMAIL = __ENV.EMAIL || 'citizen@tfg.es';
const PASSWORD = __ENV.PASSWORD || 'Citizen1';

let authToken = '';

// Setup: authenticate and get token
export function setup() {
  const loginPayload = JSON.stringify({
    email: EMAIL,
    password: PASSWORD,
  });

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const token = loginRes.json('accessToken');
  if (!token) {
    console.error('Failed to obtain auth token');
    return '';
  }

  return token;
}

// Main test function
export default function (token) {
  if (!token) {
    errorRate.add(true);
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test 1: Health check
  const healthRes = http.get(`${BASE_URL}/health/live`);
  check(healthRes, {
    'health check returns 200': (r) => r.status === 200,
    'health status is UP': (r) => r.json('status') === 'UP',
  }) || errorRate.add(true);

  sleep(1);

  // Test 2: Get user profile
  const profileRes = http.get(`${BASE_URL}/auth/me`, { headers });
  check(profileRes, {
    'profile returns 200': (r) => r.status === 200,
  }) || errorRate.add(true);

  sleep(1);

  // Test 3: List procedures
  const casesRes = http.get(`${BASE_URL}/citizen/procedures`, { headers });
  check(casesRes, {
    'procedures list returns 200': (r) => r.status === 200,
  }) || errorRate.add(true);

  sleep(1);

  // Test 4: Get certificate info (signature endpoint)
  const certRes = http.get(`${BASE_URL}/citizen/signatures/certificate-info`, { headers });
  check(certRes, {
    'certificate info returns 200': (r) => r.status === 200,
    'certificate has subject': (r) => r.json('subject') !== undefined,
  }) || errorRate.add(true);

  sleep(1);

  // Test 5: List procedure catalog
  const catalogRes = http.get(`${BASE_URL}/citizen/procedures/catalog`, { headers });
  check(catalogRes, {
    'catalog returns 200': (r) => r.status === 200,
  }) || errorRate.add(true);

  sleep(1);
}

// Teardown: cleanup if needed
export function teardown(data) {
  console.log('Performance test completed');
}
