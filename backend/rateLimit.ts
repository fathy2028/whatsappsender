import { config } from "./config";

// In-memory daily send counter per session. Resets at midnight; a process
// restart also resets it, so treat the limit as a soft guard, not accounting.
const dailyCounts: Record<string, { date: string; count: number }> = {};

const today = (): string => new Date().toISOString().slice(0, 10);

const entryFor = (username: string) => {
  const d = today();
  if (!dailyCounts[username] || dailyCounts[username].date !== d) {
    dailyCounts[username] = { date: d, count: 0 };
  }
  return dailyCounts[username];
};

export const canSendToday = (username: string): boolean =>
  config.dailyMessageLimit <= 0 ||
  entryFor(username).count < config.dailyMessageLimit;

export const recordSend = (username: string): void => {
  entryFor(username).count++;
};

export const remainingToday = (username: string): number =>
  config.dailyMessageLimit <= 0
    ? Infinity
    : Math.max(0, config.dailyMessageLimit - entryFor(username).count);
