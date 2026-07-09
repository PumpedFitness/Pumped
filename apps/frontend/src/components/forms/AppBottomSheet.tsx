import { useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { BottomSheet } from 'heroui-native';

// Long enough for the sheet's close animation to finish before the subtree
// disappears; short enough that a stale sheet can't linger and block touches.
const UNMOUNT_DELAY_MS = 450;

type AppBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Controlled wrapper around heroui's BottomSheet that mounts the portal
 * contents only while the sheet is open (plus a grace period for the close
 * animation). Children are the sheet internals (`BottomSheet.Overlay`,
 * `BottomSheet.Content`, …).
 *
 * Exists to work around a bottom-sheet issue on Android: a mounted-but-closed
 * sheet is not fully off-screen. Its top strip (handle + first rows) renders
 * above the 3-button navigation bar and silently swallows taps on anything
 * underneath — footer buttons, the tab bar. So closed sheets must unmount
 * instead of parking on-screen.
 *
 * Opening is staged: mount the sheet closed, wait for the portal subtree's
 * first layout pass (the probe view below), then flip the library's `isOpen`.
 * Flipping earlier silently fails twice over — the library only reacts to a
 * closed→open *transition*, and the snap-open is dropped while the freshly
 * mounted sheet hasn't measured itself yet.
 */
export function AppBottomSheet({
  open,
  onClose,
  children,
}: AppBottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [laidOut, setLaidOut] = useState(false);
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

  // Snap open once the mounted sheet has measured itself (plus one frame of
  // slack); after closing, unmount once the close animation is done.
  useEffect(() => {
    if (!mounted) {
      setLaidOut(false);
      return;
    }
    if (open && laidOut) {
      const raf = requestAnimationFrame(() => setSheetOpen(true));
      return () => cancelAnimationFrame(raf);
    }
    if (!open) {
      const timer = setTimeout(() => setMounted(false), UNMOUNT_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [mounted, laidOut, open]);

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
          {/* Layout probe — see the staging note above. */}
          <View onLayout={() => setLaidOut(true)} />
          {children}
        </BottomSheet.Portal>
      )}
    </BottomSheet>
  );
}
