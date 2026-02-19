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

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1); // 1-indexed
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [routineMinutes, setRoutineMinutes] = useState(0);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);

  const totalXP = useMemo(() => {
    let xp = 0;
    console.log(selectedBrands, routineMinutes, selectedVibe);
    if (selectedBrands.size > 0) xp += STEP_XP[0];
    if (routineMinutes > 0) xp += STEP_XP[1];
    if (selectedVibe) xp += STEP_XP[2];
    console.log(xp);
    return xp;
  }, [selectedBrands, routineMinutes, selectedVibe]);

  const handleToggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
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
      // All steps done — navigate to main app
      router.replace("/(tabs)");
    }
  }, [currentStep, handleNext]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Top section: progress + header + XP badge */}
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

      {/* Step content */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
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

      {/* Bottom controls */}
      <BottomControls
        onReset={handleReset}
        onSubmit={handleSubmit}
        isLastStep={currentStep === TOTAL_STEPS}
      />
    </SafeAreaView>
  );
}
