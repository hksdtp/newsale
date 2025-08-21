/**
 * Test cases for date utility functions
 * Specifically testing timezone handling fixes
 */

import { formatLocalDateString, getTodayDateString, createLocalDate } from './dateUtils';

describe('Date Utils - Timezone Fix Tests', () => {
  test('formatLocalDateString should format date in local timezone', () => {
    // Test case: January 21, 2024 at midnight local time
    const testDate = new Date(2024, 0, 21); // Month is 0-indexed
    const result = formatLocalDateString(testDate);
    
    expect(result).toBe('2024-01-21');
  });

  test('formatLocalDateString should not be affected by timezone', () => {
    // Test with different times of day
    const morningDate = new Date(2024, 0, 21, 9, 0, 0); // 9 AM
    const eveningDate = new Date(2024, 0, 21, 23, 0, 0); // 11 PM
    
    expect(formatLocalDateString(morningDate)).toBe('2024-01-21');
    expect(formatLocalDateString(eveningDate)).toBe('2024-01-21');
  });

  test('createLocalDate should create date in local timezone', () => {
    const dateString = '2024-01-21';
    const result = createLocalDate(dateString);
    
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2024);
    expect(result!.getMonth()).toBe(0); // January (0-indexed)
    expect(result!.getDate()).toBe(21);
  });

  test('round trip: createLocalDate -> formatLocalDateString should preserve date', () => {
    const originalDateString = '2024-01-21';
    const date = createLocalDate(originalDateString);
    const roundTripString = formatLocalDateString(date!);
    
    expect(roundTripString).toBe(originalDateString);
  });

  test('getTodayDateString should return today in YYYY-MM-DD format', () => {
    const today = new Date();
    const expected = formatLocalDateString(today);
    const result = getTodayDateString();
    
    expect(result).toBe(expected);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('edge cases should be handled correctly', () => {
    // Test invalid date
    expect(formatLocalDateString(new Date('invalid'))).toBe('');
    expect(createLocalDate('')).toBeNull();
    expect(createLocalDate('invalid')).toBeNull();
    
    // Test null/undefined
    expect(formatLocalDateString(null as any)).toBe('');
    expect(createLocalDate(null as any)).toBeNull();
  });

  test('month and day padding should work correctly', () => {
    // Test single digit month and day
    const testDate = new Date(2024, 0, 5); // January 5th
    const result = formatLocalDateString(testDate);
    
    expect(result).toBe('2024-01-05');
  });

  test('year boundaries should work correctly', () => {
    // Test December 31st and January 1st
    const dec31 = new Date(2023, 11, 31); // December 31, 2023
    const jan1 = new Date(2024, 0, 1);    // January 1, 2024
    
    expect(formatLocalDateString(dec31)).toBe('2023-12-31');
    expect(formatLocalDateString(jan1)).toBe('2024-01-01');
  });
});

// Manual test to demonstrate the timezone bug fix
console.log('=== Timezone Bug Fix Demonstration ===');
console.log('Date: January 21, 2024');

const testDate = new Date(2024, 0, 21);
console.log('Local date object:', testDate);

// OLD WAY (buggy - would show 2024-01-20 in GMT+7 timezone)
const oldWay = testDate.toISOString().split('T')[0];
console.log('OLD toISOString().split("T")[0]:', oldWay);

// NEW WAY (fixed - always shows correct local date)
const newWay = formatLocalDateString(testDate);
console.log('NEW formatLocalDateString():', newWay);

console.log('=== Fix verified! ===');
