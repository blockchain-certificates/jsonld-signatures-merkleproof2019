export function startsWith (stringContent: string, pattern: string): boolean {
  if (typeof stringContent !== 'string') {
    console.warn('Trying to test a non string variable');
    return false;
  }
  return stringContent.indexOf(pattern) === 0;
}
