/*
 * CommonJS worker: talks to Adobe Photoshop through the winax COM bridge.
 * Runs as a child process of the agent so COM blocking calls never stall the
 * agent's event loop. Receives:
 *   WPS_PROG_ID        — e.g. "Photoshop.Application.160" (Photoshop 2022)
 *   WPS_BOOTSTRAP_JSX  — ExtendScript bootstrap source (sets WPS_BOOTSTRAP,
 *                        evals scripts, writes result.json)
 *   WPS_RESULT_PATH    — where a fatal (pre-JSX) error result must be written
 *
 * SECURITY: this worker performs exactly one thing — DoJavaScript on the
 * fixed bootstrap built by the agent. It never evaluates arbitrary commands.
 */
"use strict";

const fs = require("fs");

let winax;
try {
  winax = require("winax");
} catch (err) {
  writeFatal(
    "PS_NOT_INSTALLED",
    "The 'winax' COM bridge is not installed. On the Windows machine run: npm install winax"
  );
  process.exit(1);
}

const progId = process.env.WPS_PROG_ID || "Photoshop.Application";
const bootstrap = process.env.WPS_BOOTSTRAP_JSX || "";

try {
  // Creating the COM object launches Photoshop if it is not running.
  const app = new winax.Object(progId);
  if (!app) throw new Error("MK_E_UNAVAILABLE");
  const version = String(app.version || "");
  log(`Photoshop COM session started (version ${version})`);
  app.DoJavaScript(bootstrap);
  process.exit(0);
} catch (err) {
  const message = (err && err.message) || String(err);
  log(`COM error: ${message}`);
  writeFatal(mapComError(message), message);
  process.exit(1);
}

function log(msg) {
  console.log(`[com-worker] ${new Date().toISOString()} ${msg}`);
}

function writeFatal(code, message) {
  const resultPath = process.env.WPS_RESULT_PATH;
  if (!resultPath) return;
  try {
    fs.writeFileSync(
      resultPath,
      JSON.stringify({ ok: false, errorCode: code, errorMessage: message, outputs: [] })
    );
  } catch (_) {
    /* nothing more we can do */
  }
}

function mapComError(message) {
  if (/0x800401E3|MK_E_UNAVAILABLE/i.test(message)) return "PS_NOT_RUNNING";
  if (/0x80080005|CO_E_SERVER_EXEC_FAILURE|0x80010108/i.test(message)) return "PS_BUSY";
  if (/0x8007000E/.test(message)) return "DISK_FULL";
  if (/0x80070005/.test(message)) return "PERMISSION_DENIED";
  return "PS_ERROR";
}
