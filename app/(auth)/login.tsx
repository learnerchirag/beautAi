import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { TextButton } from "@/components/buttons/TextButton";
import { TextInput } from "@/components/inputs/TextInput";

import { AUTH_STORAGE_KEY } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

// ─── Validation helpers ────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address";
  return null;
}

function validatePassword(value: string): string | null {
  if (!value) return "Password is required";
  if (value.length < 8) return "Minimum 8 characters";
  return null;
}

// ─── Eye icon (show/hide password) ────────────────────────────────────────────

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <View className="w-4 h-4 items-center justify-center">
      {visible ? (
        // Eye open
        <View className="w-4 h-4 items-center justify-center">
          <View className="w-full h-[8px] rounded-full border border-core-black overflow-hidden items-center justify-center">
            <View className="w-[6px] h-[6px] rounded-full bg-core-black" />
          </View>
        </View>
      ) : (
        // Eye closed – strikethrough line
        <View className="w-full h-4 items-center justify-center">
          <View className="w-full h-[8px] rounded-full border border-core-black overflow-hidden items-center justify-center">
            <View className="w-[6px] h-[6px] rounded-full bg-core-black" />
          </View>
          <View className="absolute w-full h-[1.5px] bg-core-black rotate-45" />
        </View>
      )}
    </View>
  );
}

// ─── Chevron-down icon ─────────────────────────────────────────────────────────

function ChevronDownIcon() {
  return (
    <View className="w-4 h-4 items-center justify-center">
      <View
        style={{
          width: 8,
          height: 8,
          borderBottomWidth: 1.5,
          borderRightWidth: 1.5,
          borderColor: "#000",
          transform: [{ rotate: "45deg" }, { translateY: -2 }],
        }}
      />
    </View>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetStarted = async () => {
    // Validate
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setAuthError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log(data, error, "supabase signup");

      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setAuthError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Save userId to AsyncStorage
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, userId);

      // Check if onboarding is complete on the profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", userId)
        .single();

      const onboardingDone = profile?.onboarding_complete === true;

      if (onboardingDone) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(onboarding)");
      }
    } catch {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-core-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-between">
          {/* ── Top: Headline ── */}
          <View className="flex-1 items-center justify-center px-8">
            <Text className="font-josefin-bold text-display-xl text-core-black text-center">
              Personalised beauty. Powered by you.
            </Text>
          </View>

          {/* ── Bottom: Form ── */}
          <View className="px-[16px] pb-8 gap-3">
            {/* Auth-level error (e.g. wrong credentials) */}
            {authError ? (
              <View className="px-3 py-2 bg-crimson-50 rounded-xs">
                <Text className="font-josefin-regular text-[12px] text-deep-crimson text-center">
                  {authError}
                </Text>
              </View>
            ) : null}

            {/* Email */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (emailError) setEmailError(validateEmail(v));
              }}
              placeholder="xyz@email.com"
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              rightElement={<ChevronDownIcon />}
            />

            {/* Password */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (passwordError) setPasswordError(validatePassword(v));
              }}
              placeholder="••••••••••"
              error={passwordError}
              secureTextEntry={!showPassword}
              rightElement={
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={8}
                >
                  <EyeIcon visible={showPassword} />
                </Pressable>
              }
            />

            {/* Get Started button */}
            <PrimaryButton
              label="get started"
              onPress={handleGetStarted}
              loading={loading}
              disabled={loading}
            />

            {/* Divider */}
            <View className="items-center">
              <Text className="font-josefin-regular text-body-md text-core-black text-center">
                or
              </Text>
            </View>

            {/* Continue with Apple button */}
            <SecondaryButton label="Continue with Apple" onPress={() => {}} />

            {/* New user signup link */}
            <TextButton
              label="New user? Signup"
              onPress={() => router.push("/(auth)/signup")}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
