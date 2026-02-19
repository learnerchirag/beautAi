import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

interface Brand {
  name: string;
  size: "large" | "medium" | "small";
  x: number; // percentage of container width
  y: number; // absolute offset from top of cluster
}

const BRANDS: Brand[] = [
  { name: "Charlotte Tilbury", size: "large", x: 25, y: 0 },
  { name: "Chanel", size: "medium", x: 63, y: 95 },
  { name: "Fenty", size: "small", x: 0, y: 102 },
  { name: "Clinique", size: "medium", x: 50, y: 178 },
  { name: "Estée Lauder", size: "medium", x: 13, y: 180 },
  { name: "Dior", size: "small", x: 38, y: 285 },
  { name: "Bare Minerals", size: "small", x: 2, y: 297 },
  { name: "MAC", size: "medium", x: 63, y: 297 },
];

const SIZE_MAP = {
  large: 188,
  medium: 122,
  small: 100,
};

interface BubbleClusterProps {
  selected: Set<string>;
  onToggle: (brand: string) => void;
}

export default function BubbleCluster({
  selected,
  onToggle,
}: BubbleClusterProps) {
  return (
    <View style={{ position: "relative", gap: 16 }}>
      {/* Cluster container — fixed height to contain all bubbles */}
      <View style={{ height: 420, position: "relative", marginHorizontal: 8 }}>
        {BRANDS.map((brand) => (
          <BubbleItem
            key={brand.name}
            brand={brand}
            isSelected={selected.has(brand.name)}
            onToggle={onToggle}
          />
        ))}
      </View>

      <Text
        className="text-center text-core-black mt-2"
        style={{
          fontFamily: "JosefinSans_600SemiBold",
          fontSize: 12,
          letterSpacing: -0.3,
        }}
      >
        Shake to shuffle
      </Text>
    </View>
  );
}

function BubbleItem({
  brand,
  isSelected,
  onToggle,
}: {
  brand: Brand;
  isSelected: boolean;
  onToggle: (name: string) => void;
}) {
  const diameter = SIZE_MAP[brand.size];
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1, { damping: 10 }),
    );
    onToggle(brand.name);
  }, [brand.name, onToggle, scale]);

  const isMultiLine = brand.name.includes(" ");
  const parts = brand.name.split(" ");

  return (
    <Animated.View
      style={[
        animStyle,
        {
          position: "absolute",
          left: `${brand.x}%`,
          top: brand.y,
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={{
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: isSelected ? "#008080" : "#f5f5f5",
          alignItems: "center",
          justifyContent: "center",
          padding: 8,
        }}
      >
        {isMultiLine ? (
          <View style={{ alignItems: "center" }}>
            {parts.map((part, i) => (
              <Text
                key={i}
                style={{
                  fontFamily: "JosefinSans_600SemiBold",
                  fontSize: 14,
                  letterSpacing: -0.4,
                  color: isSelected ? "#fff" : "#000",
                  textAlign: "center",
                  lineHeight: 18,
                }}
              >
                {part}
              </Text>
            ))}
          </View>
        ) : (
          <Text
            style={{
              fontFamily: "JosefinSans_600SemiBold",
              fontSize: 14,
              letterSpacing: -0.4,
              color: isSelected ? "#fff" : "#000",
              textAlign: "center",
            }}
          >
            {brand.name}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
