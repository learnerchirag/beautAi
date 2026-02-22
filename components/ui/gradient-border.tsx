import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import { StyleSheet, ViewStyle } from "react-native";

interface GradientBorderProps {
  children: ReactNode;
  gradientColors?: [string, string, ...string[]];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  containerStyle?: ViewStyle;
  locations?: [number, number, ...number[]];
}

const GradientBorder: React.FC<GradientBorderProps> = ({
  children,
  containerStyle,
  gradientColors = ["#FFF1D0", "#008080"],
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 0 },
  locations = [0, 1],
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={gradientStart}
      end={gradientEnd}
      locations={locations}
      style={[styles.gradient, containerStyle]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    padding: 2,
    borderRadius: 8,
  },
});

export default GradientBorder;
