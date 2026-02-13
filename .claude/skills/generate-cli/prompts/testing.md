# Testing Patterns

## Principles

- All tests must pass **without API keys** — use nock for HTTP mocking
- Tests validate: command parsing, output formatting, error handling, auth resolution
- Integration test stubs exist with TODO comments for live testing

## Unit Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';

const API_BASE = 'https://api.example.com';

describe('campaigns list', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('lists campaigns with default JSON output', async () => {
    nock(API_BASE)
      .get('/v1/campaigns')
      .matchHeader('Authorization', 'Bearer test-key')
      .reply(200, {
        data: [
          { id: '1', name: 'Campaign A', status: 'active' },
          { id: '2', name: 'Campaign B', status: 'paused' },
        ],
      });

    // Execute command and capture stdout
    // Assert output contains expected data
  });

  it('handles rate limiting', async () => {
    nock(API_BASE)
      .get('/v1/campaigns')
      .reply(429, {}, { 'Retry-After': '30' });

    // Assert rate limit error is handled
  });

  it('handles auth errors', async () => {
    nock(API_BASE)
      .get('/v1/campaigns')
      .reply(401, { error: 'Invalid API key' });

    // Assert auth error message
  });
});
```

## Mock Response Guidelines

- Use realistic field names and values from actual API docs
- Include pagination fields (total, next_cursor, etc.)
- Include rate limit headers in responses
- Test both success and error paths
- Test all output formats (JSON, table, CSV)

## Integration Test Stubs

```typescript
describe.skip('campaigns list (live)', () => {
  // TODO: Enable with TOOL_API_KEY env var
  it('lists real campaigns', async () => {
    const key = process.env.TOOL_API_KEY;
    if (!key) return;
    // Real API call test
  });
});
```
