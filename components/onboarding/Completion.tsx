import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// @ts-ignore
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

interface CompletionScreenProps {
  onLoadDashboard: () => void;
  isLoading?: boolean;
}

export default function Completion({
  onLoadDashboard,
  isLoading = false,
}: CompletionScreenProps) {
  const confettiRef = useRef<any>(null);
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Fire confetti on mount
    setTimeout(() => {
      confettiRef.current?.play();
    }, 100);

    // Animate elements in sequence
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Animated.Values are stable refs — safe to omit

  return (
    <View style={styles.container}>
      {/* Confetti cannon — fires from top center */}
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <LottieView
          ref={confettiRef}
          source={require("../../assets/lottie/Conffetti.json")}
          style={{
            width: width,
            height: height,
          }}
          autoPlay={false}
          loop={false}
        />
      </View>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          }}
        >
          <Text style={styles.title}>{"Looking Good\nAlready"}</Text>
        </Animated.View>
      </View>

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Welcome to your personalised beauty journey.
        </Animated.Text>

        <Animated.View
          style={{
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslateY }],
            width: "100%",
          }}
        >
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={onLoadDashboard}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Setting up…" : "Load My Dashboard"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: "JosefinSans_700Bold",
    fontSize: 40,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    lineHeight: 44,
    letterSpacing: -1.6,
  },
  bottomContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 20,
    alignItems: "center",
  },
  subtitle: {
    fontFamily: "JosefinSans_400Regular",
    fontSize: 12,
    fontWeight: "400",
    color: "#000000",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  button: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#DA99A6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: "JosefinSans_600SemiBold",
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    letterSpacing: -0.4,
    textTransform: "capitalize",
  },
});
