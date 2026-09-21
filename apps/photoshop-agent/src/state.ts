/** Mutable runtime state of the agent process. */
export const state = {
  busy: false,
  activeJobId: null as string | null,
  photoshopAvailable: false,
  photoshopVersion: null as string | null,
  diskFreeBytes: undefined as number | undefined,
};

export function resetBusy(): void {
  state.busy = false;
  state.activeJobId = null;
}
