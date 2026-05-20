# Performance Tests

Performance tests for the TFG Records Platform using [k6](https://k6.io/).

## Prerequisites

- Install k6: `brew install k6` (macOS) or see [k6 installation guide](https://k6.io/docs/getting-started/installation/)
- Backend must be running on `http://localhost:8080`

## Running Tests

### Default Configuration

```bash
k6 run api-load-test.js
```

### Custom Configuration

```bash
BASE_URL=http://localhost:8080 USERNAME=citizen@test.com PASSWORD=password123 k6 run api-load-test.js
```

### With Output to InfluxDB + Grafana

```bash
K6_OUT=influxdb=http://localhost:8086/k6 k6 run api-load-test.js
```

## Test Scenarios

The load test simulates a realistic user journey:

1. **Authentication** - Login and obtain JWT token (setup phase)
2. **Health Check** - Verify API is responsive
3. **Profile** - Get user profile information
4. **List Cases** - Retrieve user's procedures/cases
5. **Certificate Info** - Access signature service endpoint

## Load Profile

| Phase | Duration | Virtual Users | Description |
|-------|----------|---------------|-------------|
| Ramp-up | 30s | 0 → 10 | Gradual increase |
| Steady | 1m | 10 | Normal load |
| Spike | 30s | 10 → 20 | Peak traffic |
| Steady | 1m | 20 | High load |
| Ramp-down | 30s | 20 → 0 | Graceful shutdown |

## Thresholds

- **95th percentile response time**: < 500ms
- **Error rate**: < 1%
- **Custom error rate**: < 10%

## Interpreting Results

```
     ✓ health check returns 200
     ✓ profile returns 200
     ✓ cases list returns 200
     ✓ certificate info returns 200

     checks.........................: 100.00% ✓ 1234 ✗ 0
     http_req_duration..............: avg=120ms min=45ms med=98ms p(90)=210ms p(95)=280ms
     http_req_failed................: 0.00%   ✓ 0   ✗ 456
```
