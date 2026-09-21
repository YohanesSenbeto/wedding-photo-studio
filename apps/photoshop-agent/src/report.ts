import { getAgentEnv } from "@wedding/config/agent";
import { resolveServerUrl } from "./server-client";
import type { AgentReport } from "@wedding/validation";

export type OutputMeta = {
  fileName: string;
  format: "JPG" | "TIFF" | "PSD";
  fileSize: number;
  width: number | null;
  height: number | null;
  dpi: number | null;
  colorMode: "RGB" | "CMYK" | null;
  pageTemplateKey: string | null;
};

function agentHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getAgentEnv().AGENT_TOKEN}` };
}

/** Progress + terminal reports (see AgentReportSchema in @wedding/validation). */
export async function sendReport(report: AgentReport): Promise<void> {
  const res = await fetch(resolveServerUrl("/api/agent/report"), {
    method: "POST",
    headers: agentHeaders(),
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new Error(`report failed (${res.status}): ${await res.text().catch(() => "")}`);
}

/** Multipart upload of one produced file. */
export async function uploadOutput(
  jobId: string,
  filePath: string,
  meta: OutputMeta
): Promise<void> {
  const { readFile } = await import("node:fs/promises");
  const form = new FormData();
  form.append("jobId", jobId);
  form.append("fileName", meta.fileName);
  form.append("format", meta.format);
  if (meta.width != null) form.append("width", String(meta.width));
  if (meta.height != null) form.append("height", String(meta.height));
  if (meta.dpi != null) form.append("dpi", String(meta.dpi));
  if (meta.colorMode) form.append("colorMode", meta.colorMode);
  if (meta.pageTemplateKey) form.append("pageTemplateKey", meta.pageTemplateKey);
  const bytes = await readFile(filePath);
  form.append("file", new Blob([new Uint8Array(bytes)]), meta.fileName);

  const res = await fetch(resolveServerUrl("/api/agent/output"), {
    method: "POST",
    headers: agentHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error(`output upload failed (${res.status})`);
}

/** Download an original photo (or album photo) from the server. */
export async function downloadFile(urlPath: string, destPath: string): Promise<void> {
  const { createWriteStream } = await import("node:fs");
  const { pipeline } = await import("node:stream/promises");
  const { Readable } = await import("node:stream");
  const res = await fetch(resolveServerUrl(urlPath), { headers: agentHeaders() });
  if (!res.ok || !res.body) throw new Error(`download failed: ${urlPath} (${res.status})`);
  const nodeStream = Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]);
  await pipeline(nodeStream, createWriteStream(destPath));
}
