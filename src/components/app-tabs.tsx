import React, { useEffect } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  useWindowDimensions,
  LayoutChangeEvent,
} from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { Neumorphic } from "./Neumorphic";
import { ThemedText } from "./themed-text";
import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const isWideScreen = width >= 600;

  const [navBarWidth, setNavBarWidth] = React.useState(0);

  // Map route pathname to active tab
  let activeTab: "home" | "analytics" | "habits" = "home";
  let activeIndexVal = 0;
  if (pathname === "/analytics") {
    activeTab = "analytics";
    activeIndexVal = 1;
  } else if (pathname === "/me") {
    activeTab = "habits";
    activeIndexVal = 2;
  }

  const activeIndex = useSharedValue(activeIndexVal);

  useEffect(() => {
    activeIndex.value = withSpring(activeIndexVal, {
      damping: 18,
      stiffness: 120,
    });
  }, [activeIndexVal]);

  const onLayout = (event: LayoutChangeEvent) => {
    setNavBarWidth(event.nativeEvent.layout.width);
  };

  const navigateTo = (tabName: "home" | "analytics" | "habits") => {
    if (tabName === "home") {
      router.navigate("/");
    } else if (tabName === "habits") {
      router.navigate("/me");
    } else {
      router.navigate(`/${tabName}`);
    }
  };

  // Sliding pill animation style
  const animatedPillStyle = useAnimatedStyle(() => {
    if (navBarWidth === 0) return {};
    const tabWidth = navBarWidth / 3;

    let index = activeIndex.value;
    // Apply elastic resistance (soft clamp) to overshoot at the boundaries
    if (index < 0) {
      index = index * 0.25;
    } else if (index > 2) {
      index = 2 + (index - 2) * 0.25;
    }

    const tx = index * tabWidth;
    return {
      transform: [{ translateX: tx }],
      width: tabWidth,
    };
  });

  // Animated styles for each tab item declared unconditionally at the top level
  const homeTabStyle = useAnimatedStyle(() => {
    const distance = Math.abs(activeIndex.value - 0);
    const scale = withSpring(distance < 0.5 ? 1.06 : 0.96, { damping: 15 });
    const opacity = withSpring(distance < 0.5 ? 1 : 0.7, { damping: 15 });
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const analyticsTabStyle = useAnimatedStyle(() => {
    const distance = Math.abs(activeIndex.value - 1);
    const scale = withSpring(distance < 0.5 ? 1.06 : 0.96, { damping: 15 });
    const opacity = withSpring(distance < 0.5 ? 1 : 0.7, { damping: 15 });
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const habitsTabStyle = useAnimatedStyle(() => {
    const distance = Math.abs(activeIndex.value - 2);
    const scale = withSpring(distance < 0.5 ? 1.06 : 0.96, { damping: 15 });
    const opacity = withSpring(distance < 0.5 ? 1 : 0.7, { damping: 15 });
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Screen Content */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Floating Centered Bottom NavBar */}
      <Neumorphic
        variant="extruded"
        borderRadius={24}
        style={[
          styles.navBar,
          isWideScreen ? styles.navBarWide : styles.navBarMobile,
          { backgroundColor: colors.background },
        ]}
      >
        {/* Outer layer for detecting layout width */}
        <View onLayout={onLayout} style={styles.tabItemsContainer}>
          {/* Animated Sliding Pill Background */}
          {navBarWidth > 0 && (
            <Animated.View style={[styles.slidingIndicator, animatedPillStyle]}>
              <Neumorphic
                variant="button-inset"
                borderRadius={16}
                style={styles.activeTabContainerBackground}
              />
            </Animated.View>
          )}

          {/* Home Tab */}
          <Pressable onPress={() => navigateTo("home")} style={styles.tabItem}>
            <Animated.View style={[styles.tabContent, homeTabStyle]}>
              <MaterialIcons
                name="home"
                size={22}
                color={activeTab === "home" ? "#944a19" : "#54433a"}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === "home" ? "#944a19" : "#54433a" },
                ]}
              >
                Home
              </ThemedText>
            </Animated.View>
          </Pressable>

          {/* Analytics Tab */}
          <Pressable
            onPress={() => navigateTo("analytics")}
            style={styles.tabItem}
          >
            <Animated.View style={[styles.tabContent, analyticsTabStyle]}>
              <MaterialIcons
                name="insights"
                size={22}
                color={activeTab === "analytics" ? "#944a19" : "#54433a"}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === "analytics" ? "#944a19" : "#54433a" },
                ]}
              >
                Analytics
              </ThemedText>
            </Animated.View>
          </Pressable>

          {/* Habits Tab */}
          <Pressable
            onPress={() => navigateTo("habits")}
            style={styles.tabItem}
          >
            <Animated.View style={[styles.tabContent, habitsTabStyle]}>
              <MaterialIcons
                name="person"
                size={22}
                color={activeTab === "habits" ? "#944a19" : "#54433a"}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === "habits" ? "#944a19" : "#54433a" },
                ]}
              >
                Me
              </ThemedText>
            </Animated.View>
          </Pressable>
        </View>
      </Neumorphic>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  navBar: {
    position: "absolute",
    bottom: 20, // Float above bottom
    alignSelf: "center",
    height: 72,
    zIndex: 50,
  },
  navBarMobile: {
    width: "90%",
    maxWidth: 440,
  },
  navBarWide: {
    width: "100%",
    maxWidth: 480,
  },
  tabItemsContainer: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 24,
  },
  tabItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  slidingIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  activeTabContainerBackground: {
    width: "95%",
    maxWidth: 110,
    height: 56,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 2,
  },
  tabText: {
    fontSize: 12,
  },
});
