/**
 * Human-friendly error messages (README §20).
 * The agent reports machine-readable error codes; the server/UI maps them to
 * clear guidance for the photographer.
 */
export const FRIENDLY_ERRORS: Record<string, string> = {
  PS_NOT_INSTALLED:
    "Photoshop is not available on this computer. Install Adobe Photoshop 2022 or set PHOTOSHOP_PATH in the agent's .env.",
  PS_NOT_RUNNING:
    "Photoshop could not be started. Open Photoshop 2022 once manually, then try again.",
  PS_BUSY:
    "Photoshop is currently processing another image. The job will retry automatically.",
  ACR_UNAVAILABLE:
    "Adobe Camera Raw is not available or is too old for this RAW format. Update Camera Raw via the Creative Cloud app.",
  INVALID_RAW:
    "Your RAW file could not be opened. It may be from an unsupported camera or an unsupported Sony ARW version.",
  CORRUPT_IMAGE:
    "The image file appears to be corrupted and could not be processed.",
  DISK_FULL:
    "Not enough free disk space to process this job. Free up space on the computer running the agent.",
  PERMISSION_DENIED:
    "The agent could not read or write the required files. Check folder permissions for the storage and workspace folders.",
  AGENT_DISCONNECTED:
    "The local Photoshop agent is disconnected. Start it with `npm run agent` on the computer that has Photoshop 2022 installed.",
  JOB_TIMEOUT:
    "The job took too long and was cancelled. Try again, or reduce the number of photos per batch.",
  JSX_ERROR:
    "Photoshop reported a scripting error while processing this photo. Check the agent logs for details.",
  EXPORT_ERROR:
    "The edited file could not be exported. Verify the output folder is writable and has free space.",
  NO_OUTPUT:
    "The agent finished without producing any files. If the agent is running in DRY RUN mode it creates no images at all — start it on the Windows machine with Photoshop 2022 and AGENT_PHOTOSHOP_MODE=AUTO for real edits.",
  UPLOAD_FAILED: "The photo could not be uploaded. Please try again.",
  UNKNOWN: "Something went wrong while processing this job. Check the agent logs.",
};

export function getFriendlyError(code: string | null | undefined, fallback?: string): string {
  if (code && FRIENDLY_ERRORS[code]) return FRIENDLY_ERRORS[code];
  return fallback || FRIENDLY_ERRORS.UNKNOWN;
}
