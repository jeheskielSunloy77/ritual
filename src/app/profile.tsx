import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  SafeAreaView,
  useColorScheme,
  Platform,
  useWindowDimensions,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInUp, FadeIn, SlideInDown } from "react-native-reanimated";
import { useHabits } from "@/context/HabitsContext";
import { Neumorphic } from "@/components/Neumorphic";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  const { username, avatarUri, updateProfile } = useHabits();

  // Local state
  const [tempUsername, setTempUsername] = useState(username);
  const [selectedAvatarUri, setSelectedAvatarUri] = useState(avatarUri);
  const [isSaved, setIsSaved] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  // Preference mock states (just UI)
  const [themePreference, setThemePreference] = useState(
    scheme === "dark" ? "dark" : "light",
  );
  const [languagePreference, setLanguagePreference] = useState("en"); // 'en' | 'es' | 'fr'

  // Update local state when context values load
  useEffect(() => {
    setTempUsername(username);
    setSelectedAvatarUri(avatarUri);
  }, [username, avatarUri]);

  const pickImage = async () => {
    // Request permission if needed (not strictly required for launchImageLibraryAsync in standard setups but good to handle)
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access photos is required to select an avatar!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        setSelectedAvatarUri(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setSelectedAvatarUri(asset.uri);
      }
    }
  };

  const removeImage = () => {
    setSelectedAvatarUri("");
  };

  const handleSave = async () => {
    if (!tempUsername.trim()) return;
    await updateProfile(tempUsername.trim(), selectedAvatarUri);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#fef8f3" }]}>
      <View style={[styles.topBar, !isWide && { paddingHorizontal: 16 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButtonPressable}
        >
          <Neumorphic
            variant="button-extruded"
            borderRadius={20}
            style={styles.backButton}
          >
            <MaterialIcons name="chevron-left" size={28} color="#944a19" />
          </Neumorphic>
        </Pressable>
        <ThemedText style={styles.topBarTitle}>Profile</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={styles.avatarContainer}
        >
          <Neumorphic
            variant="extruded"
            borderRadius={100}
            style={styles.avatarOuter}
          >
            <View style={styles.avatarInner}>
              {selectedAvatarUri ? (
                <Image
                  source={{ uri: selectedAvatarUri }}
                  style={styles.avatarInnerImage}
                  contentFit="cover"
                />
              ) : (
                <Image
                  source={{
                    uri: `https://api.dicebear.com/10.x/adventurer/png?seed=${username}`,
                  }}
                  style={styles.avatarInnerImage}
                  contentFit="cover"
                />
              )}
            </View>
          </Neumorphic>

          <Pressable onPress={pickImage} style={styles.editAvatarBadge}>
            <Neumorphic
              variant="inset"
              borderRadius={16}
              style={styles.editBadgeInner}
            >
              <MaterialIcons name="edit" size={18} color="#944a19" />
            </Neumorphic>
          </Pressable>
        </Animated.View>

        {!!selectedAvatarUri && (
          <Animated.View
            entering={FadeInUp.duration(300)}
            style={styles.removePhotoLinkContainer}
          >
            <Pressable onPress={removeImage}>
              <ThemedText style={styles.removePhotoText}>
                Remove Photo
              </ThemedText>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInUp.duration(600).delay(100)}
          style={styles.formContainer}
        >
          <Neumorphic variant="extruded" borderRadius={24} style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Profile Details</ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Username</ThemedText>
              <Neumorphic
                variant="inset"
                borderRadius={12}
                style={styles.inputField}
              >
                <TextInput
                  value={tempUsername}
                  onChangeText={setTempUsername}
                  placeholder="Enter your username"
                  placeholderTextColor="#877369"
                  style={styles.textInput}
                />
              </Neumorphic>
            </View>

            <Pressable onPress={handleSave} style={styles.saveBtnPressable}>
              <Neumorphic
                variant={isSaved ? "inset" : "button-extruded"}
                borderRadius={16}
                style={[styles.saveBtn, isSaved && styles.saveBtnSuccess]}
              >
                <MaterialIcons
                  name={isSaved ? "check" : "save"}
                  size={20}
                  color={isSaved ? "#fff" : "#944a19"}
                />
                <ThemedText
                  style={[styles.saveBtnText, isSaved && { color: "#fff" }]}
                >
                  {isSaved ? "Saved!" : "Save Profile"}
                </ThemedText>
              </Neumorphic>
            </Pressable>
          </Neumorphic>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(200)}
          style={styles.formContainer}
        >
          <Neumorphic variant="extruded" borderRadius={24} style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

            <Pressable 
              onPress={() => setThemeModalVisible(true)} 
              style={[styles.settingListItem, { borderBottomWidth: 1, borderColor: '#e6e2dd' }]}
            >
              <View style={styles.settingListItemLeft}>
                <MaterialIcons name="dark-mode" size={22} color="#54433a" />
                <ThemedText style={styles.settingListItemLabel}>App Theme</ThemedText>
              </View>
              <View style={styles.settingListItemRight}>
                <ThemedText style={styles.settingListItemValue}>
                  {themePreference === 'light' ? 'Light Mode' : themePreference === 'dark' ? 'Dark Mode' : 'System Default'}
                </ThemedText>
                <MaterialIcons name="chevron-right" size={20} color="#877369" />
              </View>
            </Pressable>

            {/* Language Row */}
            <Pressable 
              onPress={() => setLangModalVisible(true)} 
              style={styles.settingListItem}
            >
              <View style={styles.settingListItemLeft}>
                <MaterialIcons name="language" size={22} color="#54433a" />
                <ThemedText style={styles.settingListItemLabel}>Language</ThemedText>
              </View>
              <View style={styles.settingListItemRight}>
                <ThemedText style={styles.settingListItemValue}>
                  {languagePreference === 'en' ? 'English' : languagePreference === 'es' ? 'Español' : 'Français'}
                </ThemedText>
                <MaterialIcons name="chevron-right" size={20} color="#877369" />
              </View>
            </Pressable>
          </Neumorphic>
        </Animated.View>

        {/* Logout Section */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(300)}
          style={styles.logoutContainer}
        >
          <Pressable
            onPress={() => router.replace("/")}
            style={styles.logoutBtnPressable}
          >
            <Neumorphic
              variant="button-extruded"
              borderRadius={24}
              style={styles.logoutBtn}
            >
              <MaterialIcons name="logout" size={20} color="#ba1a1a" />
              <ThemedText style={styles.logoutText}>Log Out</ThemedText>
            </Neumorphic>
          </Pressable>
          <ThemedText style={styles.versionText}>Ritual App v1.0.0</ThemedText>
        </Animated.View>
      </ScrollView>

      {/* App Theme Bottom Sheet Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={themeModalVisible}
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={[styles.modalOverlay, isWide ? styles.modalOverlayCentered : styles.modalOverlayBottom]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setThemeModalVisible(false)} />
          
          <Animated.View
            entering={isWide ? FadeIn.duration(300) : SlideInDown.duration(400)}
            style={[styles.modalSheet, isWide ? styles.modalSheetCentered : styles.modalSheetBottom]}
          >
            {!isWide && <View style={styles.grabHandle} />}
            
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Theme</ThemedText>
              <Pressable style={styles.closeBtn} onPress={() => setThemeModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#54433a" />
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              {/* Light Mode */}
              <Pressable 
                onPress={() => { setThemePreference('light'); setThemeModalVisible(false); }}
                style={[styles.modalRow, { borderBottomWidth: 1, borderColor: '#e6e2dd' }]}
              >
                <View style={styles.modalRowLeft}>
                  <MaterialIcons name="wb-sunny" size={20} color="#877369" />
                  <ThemedText style={styles.modalRowText}>Light Mode</ThemedText>
                </View>
                {themePreference === 'light' && (
                  <MaterialIcons name="check" size={20} color="#944a19" />
                )}
              </Pressable>

              {/* Dark Mode */}
              <Pressable 
                onPress={() => { setThemePreference('dark'); setThemeModalVisible(false); }}
                style={[styles.modalRow, { borderBottomWidth: 1, borderColor: '#e6e2dd' }]}
              >
                <View style={styles.modalRowLeft}>
                  <MaterialIcons name="nights-stay" size={20} color="#877369" />
                  <ThemedText style={styles.modalRowText}>Dark Mode</ThemedText>
                </View>
                {themePreference === 'dark' && (
                  <MaterialIcons name="check" size={20} color="#944a19" />
                )}
              </Pressable>

              {/* System Default */}
              <Pressable 
                onPress={() => { setThemePreference('system' as any); setThemeModalVisible(false); }}
                style={styles.modalRow}
              >
                <View style={styles.modalRowLeft}>
                  <MaterialIcons name="settings-suggest" size={20} color="#877369" />
                  <ThemedText style={styles.modalRowText}>System Default</ThemedText>
                </View>
                {themePreference === ('system' as any) && (
                  <MaterialIcons name="check" size={20} color="#944a19" />
                )}
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Language Bottom Sheet Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={langModalVisible}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={[styles.modalOverlay, isWide ? styles.modalOverlayCentered : styles.modalOverlayBottom]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setLangModalVisible(false)} />
          
          <Animated.View
            entering={isWide ? FadeIn.duration(300) : SlideInDown.duration(400)}
            style={[styles.modalSheet, isWide ? styles.modalSheetCentered : styles.modalSheetBottom]}
          >
            {!isWide && <View style={styles.grabHandle} />}
            
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Language</ThemedText>
              <Pressable style={styles.closeBtn} onPress={() => setLangModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#54433a" />
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              {/* English */}
              <Pressable 
                onPress={() => { setLanguagePreference('en'); setLangModalVisible(false); }}
                style={[styles.modalRow, { borderBottomWidth: 1, borderColor: '#e6e2dd' }]}
              >
                <View style={styles.modalRowLeft}>
                  <ThemedText style={styles.modalRowEmoji}>🇺🇸</ThemedText>
                  <ThemedText style={styles.modalRowText}>English</ThemedText>
                </View>
                {languagePreference === 'en' && (
                  <MaterialIcons name="check" size={20} color="#944a19" />
                )}
              </Pressable>

              {/* Spanish */}
              <Pressable 
                onPress={() => { setLanguagePreference('es'); setLangModalVisible(false); }}
                style={[styles.modalRow, { borderBottomWidth: 1, borderColor: '#e6e2dd' }]}
              >
                <View style={styles.modalRowLeft}>
                  <ThemedText style={styles.modalRowEmoji}>🇪🇸</ThemedText>
                  <ThemedText style={styles.modalRowText}>Español</ThemedText>
                </View>
                {languagePreference === 'es' && (
                  <MaterialIcons name="check" size={20} color="#944a19" />
                )}
              </Pressable>

              {/* French */}
              <Pressable 
                onPress={() => { setLanguagePreference('fr'); setLangModalVisible(false); }}
                style={styles.modalRow}
              >
                <View style={styles.modalRowLeft}>
                  <ThemedText style={styles.modalRowEmoji}>🇫🇷</ThemedText>
                  <ThemedText style={styles.modalRowText}>Français</ThemedText>
                </View>
                {languagePreference === 'fr' && (
                  <MaterialIcons name="check" size={20} color="#944a19" />
                )}
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  backButtonPressable: {
    height: 40,
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontFamily: "Handlee-Regular",
    fontSize: 22,
    color: "#944a19",
    fontWeight: "800",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 64,
    alignItems: "center",
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 20,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
  },
  avatarInnerImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 10,
    width: 44,
    height: 44,
    zIndex: 11,
  },
  editBadgeInner: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  removePhotoLinkContainer: {
    marginBottom: 20,
  },
  removePhotoText: {
    fontFamily: "Handlee-Regular",
    fontSize: 14,
    color: "#ba1a1a",
    textDecorationLine: "underline",
    fontWeight: "700",
  },
  formContainer: {
    width: "100%",
    maxWidth: 480,
    marginBottom: 24,
  },
  card: {
    padding: 24,
    width: "100%",
  },
  sectionTitle: {
    fontFamily: "Handlee-Regular",
    fontSize: 18,
    color: "#944a19",
    marginBottom: 16,
    fontWeight: "800",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 18,
  },
  inputLabel: {
    fontFamily: "Handlee-Regular",
    fontSize: 14,
    color: "#54433a",
    marginBottom: 6,
  },
  inputField: {
    width: "100%",
    height: 48,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  textInput: {
    fontFamily: "Handlee-Regular",
    fontSize: 16,
    color: "#1d1b19",
    width: "100%",
    height: "100%",
    outlineStyle: "none", // For web view
  } as any,
  saveBtnPressable: {
    height: 48,
    width: "100%",
    marginTop: 8,
  },
  saveBtn: {
    width: "100%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnSuccess: {
    backgroundColor: "#944a19",
  },
  saveBtnText: {
    fontFamily: "Handlee-Regular",
    fontSize: 16,
    color: "#944a19",
    fontWeight: "700",
  },
  settingListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    width: '100%',
  },
  settingListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingListItemLabel: {
    fontFamily: 'Handlee-Regular',
    fontSize: 16,
    color: '#1d1b19',
    fontWeight: '700',
  },
  settingListItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingListItemValue: {
    fontFamily: 'Handlee-Regular',
    fontSize: 14,
    color: '#877369',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalOverlayCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalOverlayBottom: {
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fef8f3',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalSheetCentered: {
    borderRadius: 32,
    maxWidth: 440,
    paddingBottom: 24,
    shadowOffset: { width: 0, height: 4 },
  },
  modalSheetBottom: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  grabHandle: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#e6e2dd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  modalTitle: {
    fontFamily: 'Handlee-Regular',
    fontSize: 20,
    color: '#944a19',
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '100%',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    width: '100%',
  },
  modalRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalRowText: {
    fontFamily: 'Handlee-Regular',
    fontSize: 16,
    color: '#1d1b19',
  },
  modalRowEmoji: {
    fontSize: 18,
    width: 20,
    textAlign: 'center',
  },
  logoutContainer: {
    width: "100%",
    maxWidth: 480,
    marginTop: 8,
    alignItems: "center",
  },
  logoutBtnPressable: {
    height: 52,
    width: "100%",
    marginBottom: 16,
  },
  logoutBtn: {
    width: "100%",
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    fontFamily: "Handlee-Regular",
    fontSize: 16,
    color: "#ba1a1a",
    fontWeight: "700",
  },
  versionText: {
    fontFamily: "Handlee-Regular",
    fontSize: 12,
    color: "#877369",
    marginTop: 8,
  },
});
