export default function ensureHashesEqual (actual: string, expected: string): boolean {
  if (actual !== expected) {
    throw new Error('Remote hash does not match verified document.');
  }

  return true;
}
