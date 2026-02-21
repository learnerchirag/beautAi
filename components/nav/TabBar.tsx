import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TABS: TabConfig[] = [
  { name: "index", label: "Home", icon: "home-outline", iconActive: "home" },
  {
    name: "search",
    label: "Search",
    icon: "search-outline",
    iconActive: "search",
  },
  {
    name: "saved",
    label: "Saved",
    icon: "bookmark-outline",
    iconActive: "bookmark",
  },
  {
    name: "chat",
    label: "Chat",
    icon: "chatbubble-outline",
    iconActive: "chatbubble",
  },
];

const COLOR_LIGHT = "#ffffff";
const COLOR_DARK = "#200007";
const ICON_TEAL = "#008080";
const ICON_GREY = "#bdbdbd";
const ICON_WHITE = "#ffffff";
const ICON_GREY_DARK = "rgba(255,255,255,0.4)";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteIndex = state.index;

  const routeNameMap = useMemo(() => {
    const map: Record<string, number> = {};
    state.routes.forEach((route, i) => {
      map[route.name] = i;
    });
    return map;
  }, [state.routes]);

  const chatTabIndex = routeNameMap["chat"] ?? 3;
  const isChatActive = activeRouteIndex === chatTabIndex;

  // Animate TabBar background: white (light tabs) ↔ deep crimson (chat tab)
  const darkProgress = useSharedValue(isChatActive ? 1 : 0);

  useEffect(() => {
    darkProgress.value = withTiming(isChatActive ? 1 : 0, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatActive]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      darkProgress.value,
      [0, 1],
      [COLOR_LIGHT, COLOR_DARK],
    ),
    borderTopColor: interpolateColor(
      darkProgress.value,
      [0, 1],
      ["#f5f5f5", "#3a0010"],
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8) },
        animatedContainerStyle,
      ]}
    >
      {TABS.map((tab) => {
        const routeIndex = routeNameMap[tab.name];
        const isActive = routeIndex === activeRouteIndex;
        const route = state.routes[routeIndex];
        if (!route) return null;

        const { options } = descriptors[route.key];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconColor = isChatActive
          ? isActive
            ? ICON_WHITE
            : ICON_GREY_DARK
          : isActive
            ? ICON_TEAL
            : ICON_GREY;

        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={options.title ?? tab.label}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={24}
              color={iconColor}
            />
            <Text
              style={[styles.label, { color: iconColor }]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  label: {
    fontFamily: "JosefinSans_600SemiBold",
    fontSize: 10,
    letterSpacing: -0.3,
    lineHeight: 13,
  },
});
