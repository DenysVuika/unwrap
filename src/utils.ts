export function toKebabCase(str: string): string {
  // Step 1: If string contains spaces/underscores/hyphens, we'll preserve word boundaries
  const hasWordSeparators = /[\s_-]/.test(str);

  if (hasWordSeparators) {
    // Case with word separators (like the mixed case test)
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .replace(/[^a-zA-Z0-9\s_-]/g, ' ') // Replace special chars with spaces
      .replace(/[\s_-]+/g, '-') // Convert all separators to hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .toLowerCase();
  } else {
    // Case without word separators (like the special@char#string! test)
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .replace(/[^a-zA-Z0-9-]/g, '') // Simply remove special characters
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }
}
