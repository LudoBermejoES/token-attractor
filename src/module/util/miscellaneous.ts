export function ensureDefined<T>(value: T | undefined | null, message: string): asserts value is T {
  if (value === undefined || value === null) {
    ui.notifications?.error(message);
    throw new Error(message);
  }
}
