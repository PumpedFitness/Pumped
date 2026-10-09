// Strings for sending a share: the QR sheet and the share entry points.
// Merged into `resources` under `share.send`.

export const shareSendEn = {
  title: 'Share',
  a11y: 'Share',
  creating: 'Creating share code…',
  instructions:
    "Scan with the Pumped app or your phone's camera on the other device.",
  expiresIn: 'Code expires in {{time}}',
  expired: 'This code has expired.',
  renew: 'Create new code',
  shareLink: 'Send link',
  done: 'Done',
  retry: 'Try again',
  errorTitle: 'Could not create a share code',
  errors: {
    build: 'Something in this item could not be packed for sharing.',
    offline: 'Sharing needs an internet connection. Check it and try again.',
    tooLarge: 'This is too large to share in one code.',
    server: 'The share service did not answer. Try again in a moment.',
  },
  templateCta: 'Share template',
  setTypeCta: 'Share set type',
  workoutCta: 'Share workout',
  prA11y: 'Share this record',
  kinds: {
    template: 'Workout template',
    workout: 'Workout',
    setType: 'Set type',
    exercise: 'Exercise',
    achievement: 'Personal record',
  },
};

export const shareSendDe: typeof shareSendEn = {
  title: 'Teilen',
  a11y: 'Teilen',
  creating: 'Teilen-Code wird erstellt…',
  instructions:
    'Scanne ihn auf dem anderen Gerät mit der Pumped-App oder der Kamera.',
  expiresIn: 'Code läuft ab in {{time}}',
  expired: 'Dieser Code ist abgelaufen.',
  renew: 'Neuen Code erstellen',
  shareLink: 'Link senden',
  done: 'Fertig',
  retry: 'Erneut versuchen',
  errorTitle: 'Teilen-Code konnte nicht erstellt werden',
  errors: {
    build: 'Etwas an diesem Eintrag ließ sich nicht zum Teilen verpacken.',
    offline:
      'Zum Teilen brauchst du eine Internetverbindung. Prüfe sie und versuche es erneut.',
    tooLarge: 'Das ist zu groß, um es mit einem Code zu teilen.',
    server:
      'Der Teilen-Dienst hat nicht geantwortet. Versuche es gleich noch einmal.',
  },
  templateCta: 'Vorlage teilen',
  setTypeCta: 'Satztyp teilen',
  workoutCta: 'Workout teilen',
  prA11y: 'Diesen Rekord teilen',
  kinds: {
    template: 'Workout-Vorlage',
    workout: 'Workout',
    setType: 'Satztyp',
    exercise: 'Übung',
    achievement: 'Persönlicher Rekord',
  },
};
