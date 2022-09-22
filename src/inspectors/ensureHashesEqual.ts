export default function ensureHashesEqual (actual: string, expected: string): boolean {
  if (actual !== expected) {
    throw new Error('Computed hash does not match remote hash');
  }

  return true;
}
