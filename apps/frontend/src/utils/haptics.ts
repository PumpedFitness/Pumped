import * as Haptics from 'expo-haptics';

// Best-effort haptics: a missing native module (stale dev build) or a device
// without a taptic engine must never break the interaction that fired it.
function fire(run: () => Promise<void>) {
  try {
    run().catch(() => {});
  } catch {
    // expo-haptics native module unavailable until the app is rebuilt.
  }
}

export function hapticSuccess() {
  fire(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

export function hapticImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
) {
  fire(() => Haptics.impactAsync(style));
}

export function hapticSelection() {
  fire(() => Haptics.selectionAsync());
}
