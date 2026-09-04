import fs from 'fs';
import path from 'path';

const TRACKER_FILE = path.join(process.cwd(), 'src/data/tournament_reminders.json');

// In-memory set for zero-latency lookup
const inMemorySent = new Set<string>();

function loadTracker(): Record<string, string> {
  try {
    if (fs.existsSync(TRACKER_FILE)) {
      const raw = fs.readFileSync(TRACKER_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach(k => inMemorySent.add(k));
        return data;
      }
    }
  } catch (e) {
    console.error('[ReminderTracker] Error reading tracker file:', e);
  }
  return {};
}

// Initial load
loadTracker();

export function hasReminderBeenSent(tournamentId: string, mode: string): boolean {
  const key = `${tournamentId}_${mode}`;
  if (inMemorySent.has(key)) return true;
  const data = loadTracker();
  return !!data[key];
}

export function recordReminderSent(tournamentId: string, mode: string): void {
  const key = `${tournamentId}_${mode}`;
  inMemorySent.add(key);
  try {
    const data = loadTracker();
    data[key] = new Date().toISOString();
    const dir = path.dirname(TRACKER_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TRACKER_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[ReminderTracker] Error writing tracker file:', e);
  }
}
