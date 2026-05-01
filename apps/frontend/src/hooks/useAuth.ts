import {useAuthStore} from '../stores/authStore';

export function useAuth() {
  const userId = useAuthStore((s) => s.userId);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isReady = useAuthStore((s) => s.isReady);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const setLoggedIn = useAuthStore((s) => s.setLoggedIn);
  const logout = useAuthStore((s) => s.logout);

  return {userId, isGuest, isReady, continueAsGuest, setLoggedIn, logout};
}
