import BottomControls from "@/components/onboarding/BottomControls";
import BubbleCluster from "@/components/onboarding/BubbleCluster";
import CircularSlider from "@/components/onboarding/CircularSlider";
import ProgressBar from "@/components/onboarding/ProgressBar";
import StepHeader from "@/components/onboarding/StepHeader";
import VibeCards from "@/components/onboarding/VibeCards";
import XPBadge from "@/components/onboarding/XPBadge";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { SafeAreaView, View } from "react-native";

const TOTAL_STEPS = 3;

const STEP_TITLES = ["Brands I love", "My routine time", "My vibe"];

const STEP_XP = [10, 30, 40];

function getRoutineLabel(minutes: number): string {
  if (minutes <= 5) return "0-5";
  if (minutes <= 15) return "5-15";
  if (minutes <= 30) return "15-30";
  return "30+";
}

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [routineMinutes, setRoutineMinutes] = useState(0);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);

  const totalXP = useMemo(() => {
    let xp = 0;
    if (selectedBrands.size > 0) xp += STEP_XP[0];
    if (routineMinutes > 0) xp += STEP_XP[1];
    if (selectedVibe) xp += STEP_XP[2];
    return xp;
  }, [selectedBrands, routineMinutes, selectedVibe]);

  const handleToggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleReset = useCallback(() => {
    if (currentStep === 1) setSelectedBrands(new Set());
    if (currentStep === 2) setRoutineMinutes(0);
    if (currentStep === 3) setSelectedVibe(null);
  }, [currentStep]);

  const handleSubmit = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      handleNext();
    } else {
      // All 3 steps done → navigate to the completion screen
      router.push({
        pathname: "/onboarding-complete",
        params: {
          brands: JSON.stringify(Array.from(selectedBrands)),
          routine_time: getRoutineLabel(routineMinutes),
          beauty_vibe: selectedVibe ?? "",
        },
      });
    }
  }, [currentStep, handleNext, selectedBrands, routineMinutes, selectedVibe]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 12 }}>
        <ProgressBar totalSteps={TOTAL_STEPS} currentStep={currentStep} />
        <StepHeader
          title={STEP_TITLES[currentStep - 1]}
          onPrev={handlePrev}
          onNext={handleNext}
          canGoPrev={currentStep > 1}
          canGoNext={currentStep < TOTAL_STEPS}
        />
        {totalXP > 0 && (
          <View style={{ alignItems: "center" }}>
            <XPBadge xp={totalXP} />
          </View>
        )}
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: 8,
          paddingTop: 8,
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        {currentStep === 1 && (
          <BubbleCluster
            selected={selectedBrands}
            onToggle={handleToggleBrand}
          />
        )}
        {currentStep === 2 && (
          <CircularSlider value={routineMinutes} onChange={setRoutineMinutes} />
        )}
        {currentStep === 3 && (
          <VibeCards selected={selectedVibe} onSelect={setSelectedVibe} />
        )}
      </View>

      <BottomControls
        onReset={handleReset}
        onSubmit={handleSubmit}
        isLastStep={currentStep === TOTAL_STEPS}
      />
    </SafeAreaView>
  );
}
