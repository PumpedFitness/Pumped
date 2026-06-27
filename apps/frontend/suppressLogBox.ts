import { LogBox } from 'react-native';

// Disable the in-app LogBox notification ("Open debugger to view warnings").
// It floats over the bottom tab bar and, being touchable, swallows taps there,
// which breaks e2e on a fresh/cold launch — the warnings fire during the first
// render before any in-App suppression could run. This module is imported first
// in index.js (before App), so it executes ahead of the app's module graph.
// Uncaught fatal errors still surface; warnings still log to Metro / the console.
LogBox.ignoreAllLogs();
