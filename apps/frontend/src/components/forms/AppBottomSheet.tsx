import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { BottomSheet } from 'heroui-native';

// Long enough for the sheet's close animation to finish before the subtree
// disappears; short enough that a stale sheet can't linger and block touches.
const UNMOUNT_DELAY_MS = 450;

// Safety net if no AppBottomSheet.Content reports layout (a plain
// BottomSheet.Content slipped in) — open late rather than never.
const OPEN_FALLBACK_MS = 800;

const ContentLayoutContext = createContext<(() => void) | null>(null);

type AppBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Controlled wrapper around heroui's BottomSheet that mounts the portal
 * contents only while the sheet is open (plus a grace period for the close
 * animation). Children are the sheet internals — use `AppBottomSheet.Content`
 * in place of `BottomSheet.Content`.
 *
 * Exists to work around a bottom-sheet issue on Android: a mounted-but-closed
 * sheet is not fully off-screen. Its top strip (handle + first rows) renders
 * above the 3-button navigation bar and silently swallows taps on anything
 * underneath — footer buttons, the tab bar. So closed sheets must unmount
 * instead of parking on-screen.
 *
 * Opening is staged: mount the sheet closed, wait until the sheet's content
 * container has measured (reported by AppBottomSheet.Content), then flip the
 * library's `isOpen`. Flipping earlier fails in two ways — the library only
 * reacts to a closed→open *transition*, and a snap-open issued before the
 * content has measured computes its position from a zero-height content and
 * parks the sheet at the bottom of the screen.
 */
export function AppBottomSheet({
  open,
  onClose,
  children,
}: AppBottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [contentLaidOut, setContentLaidOut] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Mount the (closed) sheet when opening; start closing right away when the
  // caller flips `open` off.
  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      setSheetOpen(false);
    }
  }, [open]);

  // Snap open once the mounted sheet's content has measured (plus one frame of
  // slack); after closing, unmount once the close animation is done.
  useEffect(() => {
    if (!mounted) {
      setContentLaidOut(false);
      return;
    }
    if (open && contentLaidOut) {
      const raf = requestAnimationFrame(() => setSheetOpen(true));
      return () => cancelAnimationFrame(raf);
    }
    if (open) {
      const timer = setTimeout(() => setContentLaidOut(true), OPEN_FALLBACK_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setMounted(false), UNMOUNT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [mounted, contentLaidOut, open]);

  return (
    <BottomSheet
      isOpen={sheetOpen}
      onOpenChange={isOpen => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      {mounted && (
        <BottomSheet.Portal>
          <ContentLayoutContext.Provider value={() => setContentLaidOut(true)}>
            {children}
          </ContentLayoutContext.Provider>
        </BottomSheet.Portal>
      )}
    </BottomSheet>
  );
}

type AppBottomSheetContentProps = ComponentProps<typeof BottomSheet.Content>;

/**
 * `BottomSheet.Content` that reports its content container's first layout back
 * to the owning AppBottomSheet — the signal that the sheet has measured itself
 * and can be snapped open. See the staging note on AppBottomSheet.
 */
function AppBottomSheetContent({
  contentContainerProps,
  ...props
}: AppBottomSheetContentProps) {
  const onContentLayout = useContext(ContentLayoutContext);

  return (
    <BottomSheet.Content
      {...props}
      contentContainerProps={{
        ...contentContainerProps,
        onLayout: event => {
          onContentLayout?.();
          contentContainerProps?.onLayout?.(event);
        },
      }}
    />
  );
}

AppBottomSheet.Content = AppBottomSheetContent;
