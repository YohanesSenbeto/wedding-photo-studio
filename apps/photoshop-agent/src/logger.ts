type Level = "DEBUG" | "INFO" | "WARN" | "ERROR";

function log(level: Level, msg: string, ...rest: unknown[]) {
  const at = new Date().toISOString();
  const line = `[${at}] [${level}] ${msg}`;
  const args = rest.length > 0 ? ["", ...rest] : [];
  if (level === "ERROR") console.error(line, ...args);
  else if (level === "WARN") console.warn(line, ...args);
  else console.log(line, ...args);
}

export const logger = {
  debug: (msg: string, ...rest: unknown[]) =>
    process.env.AGENT_DEBUG ? log("DEBUG", msg, ...rest) : undefined,
  info: (msg: string, ...rest: unknown[]) => log("INFO", msg, ...rest),
  warn: (msg: string, ...rest: unknown[]) => log("WARN", msg, ...rest),
  error: (msg: string, ...rest: unknown[]) => log("ERROR", msg, ...rest),
};
