/**
 * @fileoverview ID generator utilities
 * 
 * Provides deterministic ID generation for testing and development.
 */

/**
 * Generates a deterministic ID from input string
 * @param input - Input string to generate ID from
 * @returns Generated ID string
 */
export const generateId = (input?: string): string => {
  if (!input) {
    return `itinerary_${Date.now()}`;
  }
  
  const hash = input.split('').reduce((a, b) => {
    const h = ((a << 5) - a) + b.charCodeAt(0);
    return h & h;
  }, 0);
  
  return `itinerary_${Math.abs(hash).toString(36)}`;
};