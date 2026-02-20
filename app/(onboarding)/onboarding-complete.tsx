import Completion from "@/components/onboarding/Completion";
import { ONBOARDING_STORAGE_KEY } from "@/hooks/use-auth";
import { OnboardingData, updateOnboardingProfile } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";

export default function OnboardingCompleteScreen() {
  // Data passed as query params from the onboarding steps
  const params = useLocalSearchParams<{
    brands: string; // JSON-encoded string[]
    routine_time: string;
    beauty_vibe: string;
  }>();

  useEffect(() => {
    const save = async () => {
      const data: OnboardingData = {
        favorite_brands: params.brands ? JSON.parse(params.brands) : [],
        routine_time: params.routine_time ?? "",
        beauty_vibe: params.beauty_vibe ?? "",
        xp_points: 80,
      };
      const result = await updateOnboardingProfile(data);
      if (result?.error) {
        console.warn("Onboarding save error:", result.error);
      } else {
        // Mark onboarding as complete in AsyncStorage so future launches
        // skip this flow and go directly to the main tabs
        await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
      }
    };

    save();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadDashboard = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Completion onLoadDashboard={handleLoadDashboard} />
    </SafeAreaView>
  );
}
