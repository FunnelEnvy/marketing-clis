import { describe, it, expect } from 'vitest';
import { formatOutput, formatError } from '../index.js';

describe('formatOutput', () => {
  const data = [
    { id: '1', name: 'Campaign A', status: 'active' },
    { id: '2', name: 'Campaign B', status: 'paused' },
  ];

  it('formats as JSON', () => {
    const result = formatOutput(data, { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed).toEqual(data);
  });

  it('formats single object as JSON', () => {
    const result = formatOutput(data[0], { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed).toEqual(data[0]);
  });

  it('formats as table', () => {
    const result = formatOutput(data, { format: 'table' });
    expect(result).toContain('Campaign A');
    expect(result).toContain('Campaign B');
    expect(result).toContain('id');
    expect(result).toContain('name');
  });

  it('formats as CSV', () => {
    const result = formatOutput(data, { format: 'csv' });
    expect(result).toContain('id,name,status');
    expect(result).toContain('1,Campaign A,active');
  });

  it('handles empty array', () => {
    expect(formatOutput([], { format: 'table' })).toBe('No data');
    expect(formatOutput([], { format: 'csv' })).toBe('');
  });
});

describe('formatError', () => {
  it('formats error as JSON', () => {
    const result = formatError(
      { code: 'RATE_LIMITED', message: 'Too many requests', retry_after: 30 },
      'json',
    );
    const parsed = JSON.parse(result);
    expect(parsed.error.code).toBe('RATE_LIMITED');
    expect(parsed.error.retry_after).toBe(30);
  });

  it('formats error as human-readable text', () => {
    const result = formatError(
      { code: 'AUTH_FAILED', message: 'Invalid API key' },
      'table',
    );
    expect(result).toContain('AUTH_FAILED');
    expect(result).toContain('Invalid API key');
  });
});
