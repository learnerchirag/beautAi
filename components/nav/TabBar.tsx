import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TABS: TabConfig[] = [
  {
    name: "index",
    label: "Home",
    icon: "home-outline",
    iconActive: "home",
  },
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

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
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
              color={isActive ? "#008080" : "#bdbdbd"}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? "#008080" : "#bdbdbd" },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    paddingTop: 8,
    // Shadow for iOS
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
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
