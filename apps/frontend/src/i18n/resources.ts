export const defaultLanguage = 'en';

export const supportedLanguages = ['en', 'de'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageLabels: Record<SupportedLanguage, string> = {
  en: 'English',
  de: 'Deutsch',
};

export const resources = {
  en: {
    translation: {
      common: {
        appName: 'PUMPED',
      },
      settings: {
        language: 'Language',
      },
      navigation: {
        workout: 'Workout',
        history: 'History',
        progress: 'Progress',
        profile: 'Profile',
        resetOnboarding: 'Reset Onboarding',
      },
      onboarding: {
        welcome: {
          subtitle: 'Your lifting companion.\nTrack every rep, own every gain.',
          cta: 'Get a pump!',
        },
        privacy: {
          title: 'Offline first.',
          accentTitle: 'Your data.',
          body: 'Pumped is an offline-first tracking app. No data is sent to any server, unless you tell us to do so.',
          cta: 'Understood',
        },
        profile: {
          title: 'About you',
          subtitle: 'Optional - you can always set this later.',
          nameLabel: 'Name',
          namePlaceholder: 'What should we call you?',
          genderLabel: 'Gender',
          ageLabel: 'Age',
          agePlaceholder: 'e.g. 25',
          heightLabel: 'Height',
          heightPlaceholder: 'e.g. 180 cm',
          weightLabel: 'Weight',
          weightPlaceholder: 'e.g. 80 kg',
          bodyFatLabel: 'Estimated body fat %',
          bodyFatPlaceholder: 'e.g. 15',
          nextCta: "Let's go",
          skipCta: 'Skip for now',
        },
        gender: {
          male: 'Male',
          female: 'Female',
          other: 'Other',
        },
      },
    },
  },
  de: {
    translation: {
      common: {
        appName: 'PUMPED',
      },
      settings: {
        language: 'Sprache',
      },
      navigation: {
        workout: 'Training',
        history: 'Verlauf',
        progress: 'Fortschritt',
        profile: 'Profil',
        resetOnboarding: 'Onboarding zurücksetzen',
      },
      onboarding: {
        welcome: {
          subtitle:
            'Dein Begleiter fürs Krafttraining.\nTracke jede Wiederholung, feiere jeden Fortschritt.',
          cta: 'Loslegen',
        },
        privacy: {
          title: 'Offline-First.',
          accentTitle: 'Deine Daten.',
          body: 'Pumped ist eine Offline-First-Tracking-App. Es werden keine Daten an einen Server gesendet, es sei denn, du entscheidest dich ausdrücklich dafür.',
          cta: 'Verstanden',
        },
        profile: {
          title: 'Über dich',
          subtitle:
            'Optional - du kannst diese Angaben jederzeit später ergänzen.',
          nameLabel: 'Name',
          namePlaceholder: 'Wie sollen wir dich nennen?',
          genderLabel: 'Geschlecht',
          ageLabel: 'Alter',
          agePlaceholder: 'z. B. 25',
          heightLabel: 'Größe',
          heightPlaceholder: 'z. B. 180 cm',
          weightLabel: 'Gewicht',
          weightPlaceholder: 'z. B. 80 kg',
          bodyFatLabel: 'Geschätzter Körperfettanteil (%)',
          bodyFatPlaceholder: 'z. B. 15',
          nextCta: "Los geht's",
          skipCta: 'Erstmal überspringen',
        },
        gender: {
          male: 'Männlich',
          female: 'Weiblich',
          other: 'Divers',
        },
      },
    },
  },
} as const;

export type TranslationResource = (typeof resources)['en']['translation'];
