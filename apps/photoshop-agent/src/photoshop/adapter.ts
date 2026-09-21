import type { AgentJobPayload } from "@wedding/validation";

export interface JobScriptPaths {
  paramsPath: string;
  resultPath: string;
  progressPath: string;
}

export interface PhotoshopRunResult {
  ok: boolean;
  errorCode: string;
  errorMessage: string;
  outputs: {
    fileName: string;
    format: "JPG" | "TIFF" | "PSD";
    width: number | null;
    height: number | null;
    dpi: number | null;
    colorMode: "RGB" | "CMYK" | null;
    pageTemplateKey?: string | null;
  }[];
  documentWidth?: number | null;
  documentHeight?: number | null;
}

/**
 * The Photoshop adapter boundary.
 *
 * Implementations:
 *  - ComPhotoshopAdapter: REAL Adobe Photoshop 2022 via COM + ExtendScript (Windows)
 *  - DryRunAdapter: clearly-labelled pipeline simulator that NEVER touches
 *    Photoshop and produces NO image outputs (for CI / development of the
 *    job plumbing only). It is announced loudly in logs and cannot be
 *    mistaken for a real edit.
 */
export interface PhotoshopAdapter {
  readonly mode: "COM" | "DRYRUN";
  /** Ensure Photoshop is installed/startable. Returns the COM version string. */
  open(): Promise<string | null>;
  /** Execute a job synchronously; progress is reported via onProgress file polling. */
  run(params: {
    job: AgentJobPayload;
    paths: JobScriptPaths;
    scriptsDir: string;
    scriptName: string;
  }): Promise<PhotoshopRunResult>;
  close(): Promise<void>;
}
