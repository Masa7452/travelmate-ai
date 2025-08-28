/**
 * @fileoverview Error mapping utilities for HTTP status codes
 * 
 * This module provides a pure function to map domain errors to appropriate
 * HTTP status codes. It follows the error taxonomy:
 * - ValidationError -> 422 (Unprocessable Entity)
 * - NotFoundError -> 404 (Not Found)
 * - BadRequestError -> 400 (Bad Request)
 * - Others -> 500 (Internal Server Error)
 * 
 * Note: Mock 500 trigger detection (?__mock=500 or x-mock-error: internal)
 * is the responsibility of individual route handlers, not this module.
 */

import { ValidationError, NotFoundError, BadRequestError } from './Errors';

// Re-export for backward compatibility
export { ValidationError, NotFoundError, BadRequestError } from './Errors';

/**
 * Maps an error to its corresponding HTTP status code
 * @param error - The error to map
 * @returns The HTTP status code
 */
export const mapErrorToStatus = (error: unknown): number => {
  if (error instanceof ValidationError) {
    return 422;
  }
  
  if (error instanceof NotFoundError) {
    return 404;
  }
  
  if (error instanceof BadRequestError) {
    return 400;
  }
  
  // Check error name for custom errors
  if (error instanceof Error) {
    if (error.name === 'InputError' || error.name === 'BadRequestError') {
      return 400;
    }
    // Legacy support for string-based error detection
    if (error.message.includes('not found')) {
      return 404;
    }
    if (error.message.includes('unauthorized')) {
      return 401;
    }
    if (error.message.includes('forbidden')) {
      return 403;
    }
    // Check for validation/type errors first (422)
    if (error.message.includes('validation')) {
      return 422;
    }
    if (error.message.includes('expected string, received') || 
        error.message.includes('expected number, received') ||
        error.message.includes('expected boolean, received') ||
        error.message.includes('expected object, received') ||
        error.message.includes('expected array, received')) {
      return 422; // Type mismatch errors are validation errors
    }
    // Then check for missing/required fields (400)
    if (error.message.includes('Required')) {
      return 400;
    }
  }
  
  return 500;
};

// Helper for tests and formatting error responses
export const formatErrorResponse = (e: unknown): { error: string } => {
  const message = e instanceof Error ? e.message : 'Unknown error';
  return { error: message };
};