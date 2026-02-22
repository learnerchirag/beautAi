import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 80;
const CARD_HEIGHT = CARD_WIDTH * 1.78; // ~16:9 portrait ratio
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface Vibe {
  name: string;
  image: number;
}

const VIBES: Vibe[] = [
  { name: "Natural", image: require("@/assets/vibes/natural.png") },
  { name: "Glam", image: require("@/assets/vibes/glam.png") },
  { name: "Minimal", image: require("@/assets/vibes/minimal.png") },
  { name: "Bold", image: require("@/assets/vibes/bold.png") },
  { name: "Classic", image: require("@/assets/vibes/classic.png") },
  { name: "Edgy", image: require("@/assets/vibes/edgy.png") },
];

interface VibeCardsProps {
  selected: string | null;
  onSelect: (vibe: string) => void;
}

export default function VibeCards({ selected, onSelect }: VibeCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipedRight = useCallback(
    (vibe: string) => {
      onSelect(vibe);
      setCurrentIndex((prev) => Math.min(prev + 1, VIBES.length - 1));
    },
    [onSelect],
  );

  const handleSwipedLeft = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, VIBES.length - 1));
  }, []);

  const visibleVibes = VIBES.slice(currentIndex, currentIndex + 3);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          position: "relative",
        }}
      >
        {/* Render back cards first (bottom of stack) */}
        {visibleVibes
          .slice()
          .reverse()
          .map((vibe, reversedIndex) => {
            const stackIndex = visibleVibes.length - 1 - reversedIndex;
            const isTop = stackIndex === 0;

            if (isTop) {
              return (
                <SwipeableCard
                  key={vibe.name}
                  vibe={vibe}
                  onSwipeRight={() => handleSwipedRight(vibe.name)}
                  onSwipeLeft={handleSwipedLeft}
                  onSelect={() => onSelect(vibe.name)}
                  isSelected={selected === vibe.name}
                />
              );
            }

            return (
              <VibeCard
                key={vibe.name}
                vibe={vibe}
                stackIndex={stackIndex}
                isSelected={selected === vibe.name}
              />
            );
          })}
      </View>
    </View>
  );
}

interface VibeCardProps {
  vibe: Vibe;
  isSelected: boolean;
  stackIndex?: number;
}

function VibeCard({ vibe, isSelected, stackIndex = 0 }: VibeCardProps) {
  return (
    <View
      style={{
        position: "absolute",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 32,
        overflow: "hidden",
        transform:
          stackIndex > 0
            ? [
                { scale: 1 - stackIndex * 0.04 },
                { translateX: stackIndex * 12 },
              ]
            : [],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 24 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
        elevation: stackIndex > 0 ? 10 - stackIndex * 3 : 12,
        backgroundColor: "#fff", // Ensure card has a background
      }}
    >
      <Image
        source={vibe.image}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.5)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          minHeight: CARD_HEIGHT * 0.2,
          justifyContent: "flex-end",
          paddingBottom: 46,
        }}
      >
        <Text
          style={{
            alignSelf: "center",
            fontFamily: "JosefinSans_700Bold",
            fontSize: 40,
            letterSpacing: -1.6,
            color: "#fff",
            textAlign: "center",
          }}
        >
          {vibe.name}
        </Text>
      </LinearGradient>
      {isSelected && (
        <View
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "#008080",
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontFamily: "JosefinSans_600SemiBold",
              fontSize: 11,
              color: "#fff",
            }}
          >
            ✓ Selected
          </Text>
        </View>
      )}
    </View>
  );
}

function SwipeableCard({
  vibe,
  onSwipeRight,
  onSwipeLeft,
  onSelect,
  isSelected,
}: {
  vibe: Vibe;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
      rotate.value = e.translationX / 20;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        // Swipe right — select AND complete/remove from stack
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(onSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        // Swipe left — skip/remove from stack
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(onSwipeLeft)();
      } else {
        // Snap back
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    // Tap — only select, do not swipe or remove
    runOnJS(onSelect)();
  });

  const gesture = Gesture.Simultaneous(tapGesture, panGesture);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={cardStyle}>
        <VibeCard vibe={vibe} isSelected={isSelected} />
      </Animated.View>
    </GestureDetector>
  );
}
