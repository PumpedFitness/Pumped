import type { RootStackParamList } from './AppNavigator';

// Types bare useNavigation()/navigate() calls against the root stack —
// see https://reactnavigation.org/docs/typescript/#specifying-default-types-for-usenavigation-link-ref-etc
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
