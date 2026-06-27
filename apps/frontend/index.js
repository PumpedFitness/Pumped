// Must be first: silences the LogBox notification before the app's module graph
// (and its import-/render-time warnings) evaluates. See suppressLogBox.ts.
import './suppressLogBox';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
