import { useAppStore } from "@/store/appStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export const AUTH_STORAGE_KEY = "userId";
export const ONBOARDING_STORAGE_KEY = "onboardingComplete";

interface AuthState {
  isLoading: boolean;
  userId: string | null;
  onboardingComplete: boolean;
}

/**
 * Reads auth state from AsyncStorage.
 * - userId: set after a successful Supabase login
 * - onboardingComplete: set after the user finishes onboarding
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    userId: null,
    onboardingComplete: false,
  });

  const { setUserId } = useAppStore();

  useEffect(() => {
    (async () => {
      try {
        const [userId, onboarding] = await AsyncStorage.multiGet([
          AUTH_STORAGE_KEY,
          ONBOARDING_STORAGE_KEY,
        ]);
        setUserId(userId[1] ?? null);
        setState({
          isLoading: false,
          userId: userId[1] ?? null,
          onboardingComplete: onboarding[1] === "true",
        });
      } catch {
        setState({ isLoading: false, userId: null, onboardingComplete: false });
      }
    })();
  }, []);

  return state;
}
