/** Track section starts, not the percentage of a potentially very tall section. */
export function findActiveSection(sections: { id: string; top: number }[], activationLine: number, atBottom = false): string | undefined {
  const ordered = [...sections].sort((a, b) => a.top - b.top);
  if (atBottom) return ordered.at(-1)?.id;
  return ordered.filter(section => section.top <= activationLine).at(-1)?.id ?? ordered[0]?.id;
}
