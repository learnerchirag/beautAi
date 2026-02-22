import {
  forceCenter,
  forceCollide,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import { Accelerometer } from "expo-sensors";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH_ABSOLUTE } = Dimensions.get("window");
const SCREEN_WIDTH = SCREEN_WIDTH_ABSOLUTE - 8;
const CONTAINER_HEIGHT = 450;

interface Brand {
  name: string;
}

const BRANDS_LIST: Brand[] = [
  { name: "Charlotte Tilbury" },
  { name: "Chanel" },
  { name: "Fenty" },
  { name: "Clinique" },
  { name: "Estée Lauder" },
  { name: "Dior" },
  { name: "Bare Minerals" },
  { name: "MAC" },
];

const SIZES = [100, 120, 140, 160];

interface NodeType {
  name: string;
  size: number;
  x: number;
  y: number;
}

interface BubbleClusterProps {
  selected: Set<string>;
  onToggle: (brand: string) => void;
}

export default function BubbleCluster({
  selected,
  onToggle,
}: BubbleClusterProps) {
  const [bubbles, setBubbles] = useState<NodeType[]>([]);
  const lastShake = useRef(0);

  const generateLayout = useCallback(() => {
    const nodes: NodeType[] = BRANDS_LIST.map((brand) => ({
      name: brand.name,
      size: SIZES[Math.floor(Math.random() * SIZES.length)],
      x: SCREEN_WIDTH / 2,
      y: CONTAINER_HEIGHT / 2,
    }));

    const simulation = forceSimulation(nodes as any)
      .force(
        "collide",
        forceCollide<NodeType>().radius((d) => d.size / 2 + 6),
      )
      .force("center", forceCenter(SCREEN_WIDTH / 2, CONTAINER_HEIGHT / 2))
      .force("charge", forceManyBody().strength(5))
      .force("x", forceX(SCREEN_WIDTH / 2).strength(0.05))
      .force("y", forceY(CONTAINER_HEIGHT / 2).strength(0.05))
      .stop();

    // Run fixed number of ticks (important!)
    for (let i = 0; i < 250; i++) {
      simulation.tick();
    }

    simulation.stop();
    console.log(SCREEN_WIDTH);
    nodes.forEach((node) => {
      const radius = node.size / 2;

      node.x = Math.max(radius, Math.min(SCREEN_WIDTH - radius, node.x));
      node.y = Math.max(radius, Math.min(CONTAINER_HEIGHT - radius, node.y));
      console.log(node);
    });

    setBubbles([...nodes]);
  }, []);

  const shuffle = useCallback(() => {
    generateLayout();
  }, [generateLayout]);

  useEffect(() => {
    generateLayout();
  }, [generateLayout]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (acceleration > 2.2 && now - lastShake.current > 1000) {
        lastShake.current = now;
        runOnJS(shuffle)();
      }
    });

    return () => subscription.remove();
  }, [shuffle]);

  return (
    <View className="relative w-full">
      <View
        style={{
          height: CONTAINER_HEIGHT,
          width: "100%",
        }}
      >
        {bubbles.map((data) => (
          <BubbleItem
            key={data.name}
            data={data}
            isSelected={selected.has(data.name)}
            onToggle={onToggle}
          />
        ))}
      </View>

      <Text
        className="text-center text-core-black mt-4 opacity-50"
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
  data,
  isSelected,
  onToggle,
}: {
  data: NodeType;
  isSelected: boolean;
  onToggle: (name: string) => void;
}) {
  const scale = useSharedValue(0);
  const posX = useSharedValue(data.x - data.size / 2);
  const posY = useSharedValue(data.y - data.size / 2);
  const sizeValue = useSharedValue(data.size);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  useEffect(() => {
    posX.value = withSpring(data.x - data.size / 2, { damping: 15 });
    posY.value = withSpring(data.y - data.size / 2, { damping: 15 });
    sizeValue.value = withSpring(data.size, { damping: 15 });
  }, [data.x, data.y, data.size]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    left: posX.value,
    top: posY.value,
    width: sizeValue.value,
    height: sizeValue.value,
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );
    onToggle(data.name);
  }, [data.name, onToggle]);

  const parts = data.name.split(" ");
  const fontSize = data.size > 130 ? 15 : 13;

  return (
    <Animated.View
      style={[
        animStyle,
        {
          position: "absolute",
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 999,
          backgroundColor: isSelected ? "#008080" : "#f5f5f5",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
          borderWidth: isSelected ? 2 : 0,
          borderColor: isSelected ? "#006666" : "transparent",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 2,
        }}
      >
        <View style={{ alignItems: "center" }}>
          {parts.map((part, i) => (
            <Text
              key={i}
              style={{
                fontFamily: "JosefinSans_600SemiBold",
                fontSize: fontSize,
                letterSpacing: -0.4,
                color: isSelected ? "#fff" : "#1A1A1A",
                textAlign: "center",
                lineHeight: fontSize + 2,
              }}
            >
              {part}
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
