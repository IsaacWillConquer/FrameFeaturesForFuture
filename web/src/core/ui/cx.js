// Tiny classNames joiner so components can take a className prop cleanly.
export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}
