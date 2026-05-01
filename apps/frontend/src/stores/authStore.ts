import {create} from 'zustand';
import {createMMKV} from 'react-native-mmkv';
import { randomUUID } from 'expo-crypto';

const storage = createMMKV({id: 'auth-storage'});

const USER_ID_KEY = 'user_id';
const IS_GUEST_KEY = 'is_guest';

type AuthState = {
  userId: string;
  isGuest: boolean;
  isReady: boolean;

  initialize: () => void;
  continueAsGuest: () => void;
  setLoggedIn: (userId: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: '',
  isGuest: true,
  isReady: false,

  initialize: () => {
    const storedUserId = storage.getString(USER_ID_KEY);
    const isGuest = storage.getBoolean(IS_GUEST_KEY) ?? true;

    if (storedUserId) {
      set({userId: storedUserId, isGuest, isReady: true});
    } else {
      // First launch: auto-create guest identity
      const guestId = randomUUID();
      storage.set(USER_ID_KEY, guestId);
      storage.set(IS_GUEST_KEY, true);
      set({userId: guestId, isGuest: true, isReady: true});
    }
  },

  continueAsGuest: () => {
    const guestId = randomUUID();
    storage.set(USER_ID_KEY, guestId);
    storage.set(IS_GUEST_KEY, true);
    set({userId: guestId, isGuest: true});
  },

  setLoggedIn: (userId: string) => {
    storage.set(USER_ID_KEY, userId);
    storage.set(IS_GUEST_KEY, false);
    set({userId, isGuest: false});
  },

  logout: () => {
    storage.remove(USER_ID_KEY);
    storage.remove(IS_GUEST_KEY);
    set({userId: '', isGuest: true, isReady: false});
  },
}));
