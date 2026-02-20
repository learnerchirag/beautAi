import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View
} from "react-native";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { TextButton } from "@/components/buttons/TextButton";
import { TextInput } from "@/components/inputs/TextInput";

import { AUTH_STORAGE_KEY } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

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

function validateConfirmPassword(
  value: string,
  password: string,
): string | null {
  if (!value) return "Please confirm your password";
  if (value !== password) return "Passwords do not match";
  return null;
}

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = validateConfirmPassword(confirmPassword, password);
    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cErr);
    if (eErr || pErr || cErr) return;

    setAuthError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

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

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, userId);

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
              Create your account.
            </Text>
          </View>

          {/* ── Bottom: Form ── */}
          <View className="px-[16px] pb-8 gap-3">
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
            />

            {/* Password */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (passwordError) setPasswordError(validatePassword(v));
                if (confirmPasswordError)
                  setConfirmPasswordError(
                    validateConfirmPassword(confirmPassword, v),
                  );
              }}
              placeholder="••••••••••"
              error={passwordError}
              secureTextEntry
            />

            {/* Confirm Password */}
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                if (confirmPasswordError)
                  setConfirmPasswordError(validateConfirmPassword(v, password));
              }}
              placeholder="••••••••••"
              error={confirmPasswordError}
              secureTextEntry
            />

            {/* Sign up button */}
            <PrimaryButton
              label="sign up"
              onPress={handleSignup}
              loading={loading}
              disabled={loading}
            />

            {/* Already have an account */}
            <TextButton
              label="Already have an account? Login"
              onPress={() => router.back()}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
