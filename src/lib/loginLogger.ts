type LogLevel = 'info' | 'warn' | 'error' | 'success';

export type LoginLogEntry = {
  id: number;
  time: string;
  level: LogLevel;
  message: string;
  detail?: string;
};

const MAX_LOGS = 40;
let logId = 0;
const logs: LoginLogEntry[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function stamp(): string {
  return new Date().toLocaleTimeString('en-IN', { hour12: false });
}

export function loginLog(level: LogLevel, message: string, detail?: unknown) {
  const detailStr =
    detail === undefined
      ? undefined
      : typeof detail === 'string'
        ? detail
        : JSON.stringify(detail, null, 2);

  const entry: LoginLogEntry = {
    id: ++logId,
    time: stamp(),
    level,
    message,
    detail: detailStr,
  };

  logs.unshift(entry);
  if (logs.length > MAX_LOGS) logs.pop();

  const prefix = `[Login:${level.toUpperCase()}]`;
  if (detailStr) {
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      prefix,
      message,
      detail,
    );
  } else {
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](prefix, message);
  }

  emit();
}

export function getLoginLogs(): LoginLogEntry[] {
  return [...logs];
}

export function clearLoginLogs() {
  logs.length = 0;
  emit();
}

export function subscribeLoginLogs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function pingBackendHealth(apiUrl: string): Promise<{
  ok: boolean;
  status?: number;
  body?: unknown;
  error?: string;
  ms: number;
}> {
  const healthUrl = `${apiUrl.replace(/\/$/, '')}/health`;
  const started = performance.now();
  loginLog('info', 'Health ping started', { url: healthUrl });

  try {
    const res = await fetch(healthUrl, { method: 'GET' });
    const ms = Math.round(performance.now() - started);
    const text = await res.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      /* keep raw text */
    }

    if (res.ok) {
      loginLog('success', `Health OK (${res.status}) in ${ms}ms`, body);
      return { ok: true, status: res.status, body, ms };
    }

    loginLog('error', `Health failed (${res.status}) in ${ms}ms`, body);
    return { ok: false, status: res.status, body, ms };
  } catch (err) {
    const ms = Math.round(performance.now() - started);
    const error = err instanceof Error ? err.message : String(err);
    loginLog('error', `Health fetch error in ${ms}ms`, error);
    return { ok: false, error, ms };
  }
}
