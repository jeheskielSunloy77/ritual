import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  useColorScheme,
  Platform,
  SafeAreaView,
} from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Neumorphic } from "./Neumorphic";
import { ThemedText } from "./themed-text";
import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  if (pathname === "/profile") {
    return <Slot />;
  }

  // Map route pathname to active tab
  let activeTab = "home";
  if (pathname === "/analytics") {
    activeTab = "analytics";
  } else if (pathname === "/me") {
    activeTab = "habits";
  }

  const navigateTo = (tabName: "home" | "analytics" | "habits") => {
    if (tabName === "home") {
      router.navigate("/");
    } else if (tabName === "habits") {
      router.navigate("/me");
    } else {
      router.navigate(`/${tabName}`);
    }
  };

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
        style={[styles.navBar, { backgroundColor: colors.background }]}
      >
        {/* Analytics Tab */}
        <Pressable
          onPress={() => navigateTo("analytics")}
          style={styles.tabItem}
        >
          {activeTab === "analytics" ? (
            <Neumorphic
              variant="button-inset"
              borderRadius={16}
              style={styles.activeTabContainer}
            >
              <MaterialIcons name="insights" size={22} color="#944a19" />
              <ThemedText style={styles.activeTabText}>Analytics</ThemedText>
            </Neumorphic>
          ) : (
            <View style={styles.inactiveTabContainer}>
              <MaterialIcons name="insights" size={22} color="#54433a" />
              <ThemedText style={styles.inactiveTabText}>Analytics</ThemedText>
            </View>
          )}
        </Pressable>

        {/* Home Tab */}
        <Pressable onPress={() => navigateTo("home")} style={styles.tabItem}>
          {activeTab === "home" ? (
            <Neumorphic
              variant="button-inset"
              borderRadius={16}
              style={styles.activeTabContainer}
            >
              <MaterialIcons name="home" size={22} color="#944a19" />
              <ThemedText style={styles.activeTabText}>Home</ThemedText>
            </Neumorphic>
          ) : (
            <View style={styles.inactiveTabContainer}>
              <MaterialIcons name="home" size={22} color="#54433a" />
              <ThemedText style={styles.inactiveTabText}>Home</ThemedText>
            </View>
          )}
        </Pressable>

        {/* Habits Tab */}
        <Pressable onPress={() => navigateTo("habits")} style={styles.tabItem}>
          {activeTab === "habits" ? (
            <Neumorphic
              variant="button-inset"
              borderRadius={16}
              style={styles.activeTabContainer}
            >
              <MaterialIcons name="person" size={22} color="#944a19" />
              <ThemedText style={styles.activeTabText}>Me</ThemedText>
            </Neumorphic>
          ) : (
            <View style={styles.inactiveTabContainer}>
              <MaterialIcons name="person" size={22} color="#54433a" />
              <ThemedText style={styles.inactiveTabText}>Me</ThemedText>
            </View>
          )}
        </Pressable>
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
    width: "90%",
    maxWidth: 440,
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    zIndex: 50,
  },
  tabItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabContainer: {
    width: "95%",
    maxWidth: 110,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
  },
  activeTabText: {
    fontFamily: "Handlee-Regular",
    fontSize: 12,
    color: "#944a19",
  },
  inactiveTabContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  inactiveTabText: {
    fontFamily: "Handlee-Regular",
    fontSize: 12,
    color: "#54433a",
  },
});
