export function assertConfigured(value: string, name: string) {
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}
