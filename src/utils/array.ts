export function removeEntry (map: any[], key: any): void {
  const stepIndex = map.findIndex(entry => entry === key);
  if (stepIndex > -1) {
    // delete by reference
    map.splice(stepIndex, 1);
  }
}
