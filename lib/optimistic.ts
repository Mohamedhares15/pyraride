import { toast } from "sonner";

/**
 * Run an optimistic action with instant toast feedback + rollback on failure.
 */
export async function withOptimistic<T>(opts: {
  optimistic: string;
  run: () => Promise<T> | T;
  onError?: () => void;
  errorMessage?: string;
}): Promise<T | undefined> {
  const id = toast.success(opts.optimistic);
  try {
    return await opts.run();
  } catch (err) {
    toast.dismiss(id);
    toast.error(opts.errorMessage ?? "Something went wrong. Reverted.");
    opts.onError?.();
    return undefined;
  }
}

/**
 * Optimistic action with an undo affordance. Applies `apply()` immediately,
 * shows a toast with an Undo button for `windowMs`, then commits via `commit()`.
 * If the user clicks Undo before the window closes, `revert()` is called and
 * commit is skipped.
 *
 *   undoableAction({
 *     message: "Photo approved.",
 *     apply:  () => setItems(next),
 *     revert: () => setItems(prev),
 *     commit: async () => api.approve(id),
 *   });
 */
export function undoableAction(opts: {
  message: string;
  apply: () => void;
  revert: () => void;
  commit?: () => Promise<unknown> | unknown;
  windowMs?: number;
  undoLabel?: string;
}) {
  const window = opts.windowMs ?? 5000;
  opts.apply();

  let undone = false;
  const timer = setTimeout(async () => {
    if (undone) return;
    try {
      await opts.commit?.();
    } catch {
      opts.revert();
      toast.error("Could not save. Reverted.");
    }
  }, window);

  toast(opts.message, {
    duration: window,
    action: {
      label: opts.undoLabel ?? "Undo",
      onClick: () => {
        undone = true;
        clearTimeout(timer);
        opts.revert();
        toast.success("Undone.");
      },
    },
  });
}

/** Promise-toast helper with editorial copy. */
export function promiseToast<T>(p: Promise<T>, msgs: { loading: string; success: string; error?: string }) {
  return toast.promise(p, {
    loading: msgs.loading,
    success: msgs.success,
    error: msgs.error ?? "Something went wrong.",
  });
}
