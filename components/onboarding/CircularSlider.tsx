import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const RADIUS = 120;
const STROKE_WIDTH = 12;
const CENTER = RADIUS + STROKE_WIDTH;
const DIAMETER = CENTER * 2;
const MAX_MINUTES = 90;

interface TimeRange {
  min: number;
  max: number;
  label: string;
  description: string;
  exclamation: string;
}

const TIME_RANGES: TimeRange[] = [
  {
    min: 0,
    max: 5,
    label: "Speed Demon",
    description: "You're in and out before anyone notices!",
    exclamation: "Zoom!",
  },
  {
    min: 5,
    max: 15,
    label: "Quick & Easy",
    description: "Efficient beauty at its finest.",
    exclamation: "Nice!",
  },
  {
    min: 15,
    max: 30,
    label: "Midday Muse",
    description: "You're perfecting the art of looking effortlessly fabulous.",
    exclamation: "Woah!",
  },
  {
    min: 30,
    max: 60,
    label: "Devoted Diva",
    description: "Your routine is a ritual, and you love every second.",
    exclamation: "Love it!",
  },
  {
    min: 60,
    max: 90,
    label: "Glam Queen",
    description: "Go big or go home — you're all in!",
    exclamation: "Iconic!",
  },
];

function getTimeRange(minutes: number): TimeRange {
  return (
    TIME_RANGES.find((r) => minutes >= r.min && minutes < r.max) ||
    TIME_RANGES[TIME_RANGES.length - 1]
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  "worklet";
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  "worklet";
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

interface CircularSliderProps {
  value: number; // minutes 0-90
  onChange: (minutes: number) => void;
}

export default function CircularSlider({
  value,
  onChange,
}: CircularSliderProps) {
  const timeRange = getTimeRange(value);
  const angleDeg = (value / MAX_MINUTES) * 360; // 0 = top, clockwise

  // Thumb position
  const thumbPos = polarToCartesian(CENTER, CENTER, RADIUS, angleDeg);

  // Arc path
  const arcPath =
    angleDeg > 0 ? describeArc(CENTER, CENTER, RADIUS, 0, angleDeg) : "";

  const introAngle = useSharedValue(0);
  const introOpacity = useSharedValue(0);

  useEffect(() => {
    if (value !== 0) return;
    // Start with opacity 1, animate angle to 360, then fade out
    introOpacity.value = withSequence(
      withTiming(1, { duration: 800 }),
      withTiming(0, { duration: 500 }),
    );
    introAngle.value = withSequence(
      withTiming(360, { duration: 800 }),
      withTiming(0, { duration: 500 }),
    );
  }, [introAngle, introOpacity, value]);

  const introProps = useAnimatedProps(() => {
    const d =
      introAngle.value > 0
        ? describeArc(CENTER, CENTER, RADIUS, 0, introAngle.value)
        : "";
    return {
      d,
      opacity: introOpacity.value,
    };
  });

  const updateMinutes = useCallback(
    (mins: number) => {
      onChange(Math.max(0, Math.min(MAX_MINUTES, mins)));
    },
    [onChange],
  );

  const gesture = Gesture.Pan().onUpdate((e) => {
    const dx = e.x - CENTER;
    const dy = e.y - CENTER;
    // atan2 gives angle from positive x-axis; we want from top clockwise
    let angleDegNew = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angleDegNew < 0) angleDegNew += 360;
    const mins = Math.round((angleDegNew / 360) * MAX_MINUTES);
    runOnJS(updateMinutes)(mins);
  });

  const thumbStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: thumbPos.x - 32,
    top: thumbPos.y - 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#008080",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  }));

  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <View style={{ width: DIAMETER, height: DIAMETER }}>
          {/* SVG Track + Arc */}
          <Svg
            width={DIAMETER}
            height={DIAMETER}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {/* Background track */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="#eeeeee"
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Progress arc */}
            {arcPath ? (
              <Path
                d={arcPath}
                stroke="#008080"
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeLinecap="round"
              />
            ) : null}

            {/* Intro animation arc (dummy) */}
            <AnimatedPath
              animatedProps={introProps}
              stroke="#008080"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>

          {/* Thumb */}
          <Animated.View style={thumbStyle}>
            <Text
              style={{
                fontFamily: "JosefinSans_600SemiBold",
                fontSize: 14,
                color: "#fff",
                letterSpacing: -0.3,
              }}
            >
              {value}
            </Text>
          </Animated.View>

          {/* Center content */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 40,
            }}
          >
            <Ionicons name="time-outline" size={24} color="#000" />
            <Text
              style={{
                fontFamily: "JosefinSans_700Bold",
                fontSize: 36,
                letterSpacing: -1.4,
                lineHeight: 40,
                color: "#000",
                textAlign: "center",
                marginTop: 4,
              }}
            >
              {timeRange.exclamation}
            </Text>
            <Text
              style={{
                fontFamily: "JosefinSans_600SemiBold",
                fontSize: 12,
                letterSpacing: -0.3,
                color: "#000",
                textAlign: "center",
                marginTop: 2,
              }}
            >
              {timeRange.label}
            </Text>
            <Text
              style={{
                fontFamily: "JosefinSans_400Regular",
                fontSize: 11,
                letterSpacing: -0.2,
                color: "#555",
                textAlign: "center",
                marginTop: 4,
                lineHeight: 15,
              }}
            >
              {timeRange.description}
            </Text>
          </View>
        </View>
      </GestureDetector>
      <Text
        className="text-center text-core-black mt-4 opacity-50 absolute bottom-0"
        style={{
          fontFamily: "JosefinSans_600SemiBold",
          fontSize: 12,
          letterSpacing: -0.3,
        }}
      >
        Slide to save
      </Text>
    </View>
  );
}
