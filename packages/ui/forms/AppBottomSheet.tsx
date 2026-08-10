import {
  createContext,
  useContext,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { BottomSheet } from 'heroui-native';

const SheetOpenContext = createContext(false);

type AppBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Controlled wrapper around heroui's BottomSheet. Children are the sheet
 * internals — use `AppBottomSheet.Content` in place of `BottomSheet.Content`.
 *
 * Exists to work around a bottom-sheet issue on Android: a mounted-but-closed
 * sheet is not fully off-screen. Its top strip (handle + first rows) renders
 * above the 3-button navigation bar and silently swallows taps on anything
 * underneath — footer buttons, the tab bar. The sheet stays mounted (the
 * library only positions reliably once it has been laid out), but while closed
 * its container lets touches pass through.
 */
export function AppBottomSheet({
  open,
  onClose,
  children,
}: AppBottomSheetProps) {
  return (
    <BottomSheet
      isOpen={open}
      onOpenChange={isOpen => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <BottomSheet.Portal>
        <SheetOpenContext.Provider value={open}>
          {children}
        </SheetOpenContext.Provider>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

type AppBottomSheetContentProps = ComponentProps<typeof BottomSheet.Content>;

/**
 * `BottomSheet.Content` whose container ignores touches while the owning
 * AppBottomSheet is closed — see the note on AppBottomSheet.
 *
 * `accessible` is toggled with the open state. The sheet library marks the
 * container as a single accessible element ("Bottom Sheet"), which on iOS
 * collapses the whole sheet into one opaque node — while open, VoiceOver and
 * UI tests couldn't reach anything inside it, so expose the children instead.
 * While closed, keep the container opaque: otherwise every parked sheet leaks
 * its full contents (e.g. hundreds of wheel-picker values) into the
 * accessibility tree of whatever screen mounts it.
 */
function AppBottomSheetContent({
  style,
  ...props
}: AppBottomSheetContentProps) {
  const open = useContext(SheetOpenContext);

  return (
    <BottomSheet.Content
      accessible={!open}
      {...props}
      style={[style, { pointerEvents: open ? 'auto' : 'none' }]}
    />
  );
}

AppBottomSheet.Content = AppBottomSheetContent;
