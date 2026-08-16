// Schmale Deklarationen für die Node-Module, die **nur Tests** verwenden.
//
// `@types/node` wäre die naheliegende Antwort und die falsche: Es deklariert
// `setTimeout` & Co. mit den Node-Rückgabetypen und bricht damit in React
// Native jeden Timer, der eine Zahl erwartet. Hier steht deshalb nur, was
// wirklich gebraucht wird.
//
// Verwendet in `src/lib/health/__tests__/oauthRegistration.test.ts`, das die
// nativen Projektdateien liest, um Client-ID und URL-Schema gegeneinander zu
// prüfen.

declare module 'fs' {
  export function readFileSync(path: string, encoding: 'utf-8'): string;
}

declare module 'path' {
  export function join(...segments: string[]): string;
}
