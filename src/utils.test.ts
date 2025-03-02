import { describe, it, expect } from 'bun:test';
import { toKebabCase } from './utils';

describe('toKebabCase', () => {
  it('should convert camelCase to kebab-case', () => {
    expect(toKebabCase('camelCaseString')).toBe('camel-case-string');
  });

  it('should convert PascalCase to kebab-case', () => {
    expect(toKebabCase('PascalCaseString')).toBe('pascal-case-string');
  });

  it('should convert snake_case to kebab-case', () => {
    expect(toKebabCase('snake_case_string')).toBe('snake-case-string');
  });

  it('should convert spaces to hyphens', () => {
    expect(toKebabCase('space separated string')).toBe(
      'space-separated-string'
    );
  });

  it('should remove special characters', () => {
    expect(toKebabCase('special@char#string!')).toBe('specialcharstring');
  });

  it('should handle mixed cases and special characters', () => {
    expect(toKebabCase('Mixed_CASE-with Special@Char#')).toBe(
      'mixed-case-with-special-char'
    );
  });

  it('should handle empty string', () => {
    expect(toKebabCase('')).toBe('');
  });

  it('should handle single word', () => {
    expect(toKebabCase('singleword')).toBe('singleword');
  });
});
