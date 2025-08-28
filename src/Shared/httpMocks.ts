import type { NextRequest } from 'next/server';

/**
 * @fileoverview Utilities for HTTP test mocking.
 * Detects explicit 500-injection triggers used by tests:
 *  - Query string: ?__mock=500
 *  - Header: x-mock-error: internal
 * Handlers should call this BEFORE any async work or params awaiting.
 */
type MaybeUrl = { url?: string };
type MaybePlainHeaders = { headers?: Record<string, string> | undefined };

export const shouldMock500 = (
  request: NextRequest | (Request & MaybeUrl) | (NextRequest & MaybeUrl) | (MaybeUrl & MaybePlainHeaders)
): boolean => {
  try {
    // 1) Header check (works for Request/NextRequest). Headers.get is case-insensitive.
    //    Also support tests that pass plain object headers.
    const headerVal =
      (('headers' in request && request.headers && typeof request.headers === 'object' && 'get' in request.headers && typeof request.headers.get === 'function')
        ? (request as Request).headers.get('x-mock-error')
        : undefined) ??
      ((request as MaybePlainHeaders).headers
        ? (request as MaybePlainHeaders).headers!['x-mock-error'] ??
          (request as MaybePlainHeaders).headers!['X-Mock-Error']
        : undefined);

    if (headerVal === 'internal') return true;

    // 2) Query param check via NextRequest.nextUrl if present
    //    (Next.js runtime) — some test environments don't populate nextUrl.
    //    Optional chaining keeps this safe in all cases.
    const qpFromNextUrl =
      (request as NextRequest)?.nextUrl?.searchParams?.get('__mock') ?? undefined;
    if (qpFromNextUrl === '500') return true;

    // 3) Fallback: parse from .url string if provided (plain Request or test doubles)
    const rawUrl = (request as MaybeUrl).url;
    if (typeof rawUrl === 'string') {
      const parsed = new URL(rawUrl, 'http://localhost');
      if (parsed.searchParams.get('__mock') === '500') return true;
    }
  } catch {
    // swallow and treat as no-mock
  }
  return false;
};