import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useHabits } from '@/context/HabitsContext';
import { Neumorphic } from '@/components/Neumorphic';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();

  const { username, avatarUri, updateProfile } = useHabits();

  // Local state
  const [tempUsername, setTempUsername] = useState(username);
  const [selectedAvatarUri, setSelectedAvatarUri] = useState(avatarUri);
  const [isSaved, setIsSaved] = useState(false);

  // Preference mock states (just UI)
  const [themePreference, setThemePreference] = useState(scheme === 'dark' ? 'dark' : 'light');
  const [languagePreference, setLanguagePreference] = useState('en'); // 'en' | 'es' | 'fr'

  // Update local state when context values load
  useEffect(() => {
    setTempUsername(username);
    setSelectedAvatarUri(avatarUri);
  }, [username, avatarUri]);

  const pickImage = async () => {
    // Request permission if needed (not strictly required for launchImageLibraryAsync in standard setups but good to handle)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access photos is required to select an avatar!');
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
    setSelectedAvatarUri('');
  };

  const handleSave = async () => {
    if (!tempUsername.trim()) return;
    await updateProfile(tempUsername.trim(), selectedAvatarUri);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fef8f3' }]}>
      {/* Centered Top Bar aligned with 480px content on desktop */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButtonPressable}>
          <Neumorphic variant="button-extruded" borderRadius={20} style={styles.backButton}>
            <MaterialIcons name="chevron-left" size={28} color="#944a19" />
          </Neumorphic>
        </Pressable>
        <ThemedText style={styles.topBarTitle}>Profile</ThemedText>
        <View style={{ width: 40 }} /> {/* Spacer to balance the title */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Centered Big Avatar Section */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.avatarContainer}>
          <Neumorphic variant="extruded" borderRadius={100} style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              {selectedAvatarUri ? (
                <Image
                  source={{ uri: selectedAvatarUri }}
                  style={styles.avatarInnerImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatarInner, { backgroundColor: '#ffe4d6', justifyContent: 'center', alignItems: 'center' }]}>
                  <MaterialIcons name="person" size={80} color="#944a19" />
                </View>
              )}
            </View>
          </Neumorphic>

          {/* Camera/Upload badge overlay */}
          <Pressable onPress={pickImage} style={styles.editAvatarBadge}>
            <Neumorphic variant="button-extruded" borderRadius={16} style={styles.editBadgeInner}>
              <MaterialIcons name="edit" size={18} color="#944a19" />
            </Neumorphic>
          </Pressable>
        </Animated.View>

        {/* Remove Photo text link if photo is selected */}
        {!!selectedAvatarUri && (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.removePhotoLinkContainer}>
            <Pressable onPress={removeImage}>
              <ThemedText style={styles.removePhotoText}>Remove Photo</ThemedText>
            </Pressable>
          </Animated.View>
        )}

        {/* Username Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.formContainer}>
          <Neumorphic variant="extruded" borderRadius={24} style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Profile Details</ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Username</ThemedText>
              <Neumorphic variant="inset" borderRadius={12} style={styles.inputField}>
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
                variant={isSaved ? 'inset' : 'button-extruded'}
                borderRadius={16}
                style={[styles.saveBtn, isSaved && styles.saveBtnSuccess]}
              >
                <MaterialIcons name={isSaved ? 'check' : 'save'} size={20} color={isSaved ? '#fff' : '#944a19'} />
                <ThemedText style={[styles.saveBtnText, isSaved && { color: '#fff' }]}>
                  {isSaved ? 'Saved!' : 'Save Profile'}
                </ThemedText>
              </Neumorphic>
            </Pressable>
          </Neumorphic>
        </Animated.View>

        {/* Preferences Section (UI Only) */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.formContainer}>
          <Neumorphic variant="extruded" borderRadius={24} style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

            {/* App Theme Preferences Mock */}
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <MaterialIcons name="dark-mode" size={22} color="#54433a" />
                <ThemedText style={styles.preferenceText}>App Theme</ThemedText>
              </View>
              <View style={styles.toggleGroup}>
                <Pressable
                  onPress={() => setThemePreference('light')}
                  style={[
                    styles.toggleBtn,
                    themePreference === 'light' && styles.toggleBtnActive,
                  ]}
                >
                  <ThemedText style={[styles.toggleBtnText, themePreference === 'light' && styles.toggleBtnTextActive]}>
                    Light
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setThemePreference('dark')}
                  style={[
                    styles.toggleBtn,
                    themePreference === 'dark' && styles.toggleBtnActive,
                  ]}
                >
                  <ThemedText style={[styles.toggleBtnText, themePreference === 'dark' && styles.toggleBtnTextActive]}>
                    Dark
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Language Preferences Mock */}
            <View style={[styles.preferenceRow, { borderTopWidth: 1, borderColor: '#e6e2dd', paddingTop: 16 }]}>
              <View style={styles.preferenceInfo}>
                <MaterialIcons name="language" size={22} color="#54433a" />
                <ThemedText style={styles.preferenceText}>Language</ThemedText>
              </View>
              <View style={styles.langSelector}>
                {(['en', 'es', 'fr'] as const).map((lang) => {
                  const labelMap = { en: 'EN', es: 'ES', fr: 'FR' };
                  return (
                    <Pressable
                      key={lang}
                      onPress={() => setLanguagePreference(lang)}
                      style={[
                        styles.langBadge,
                        languagePreference === lang && styles.langBadgeActive,
                      ]}
                    >
                      <ThemedText style={[styles.langBadgeText, languagePreference === lang && styles.langBadgeTextActive]}>
                        {labelMap[lang]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Neumorphic>
        </Animated.View>

        {/* Logout Section */}
        <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.logoutContainer}>
          <Pressable onPress={() => router.replace('/')} style={styles.logoutBtnPressable}>
            <Neumorphic variant="button-extruded" borderRadius={24} style={styles.logoutBtn}>
              <MaterialIcons name="logout" size={20} color="#ba1a1a" />
              <ThemedText style={styles.logoutText}>Log Out</ThemedText>
            </Neumorphic>
          </Pressable>
          <ThemedText style={styles.versionText}>Ritual App v1.0.0</ThemedText>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  backButtonPressable: {
    height: 40,
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontFamily: 'Handlee-Regular',
    fontSize: 22,
    color: '#944a19',
    fontWeight: '800',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 64,
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
  },
  avatarInnerImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    width: 44,
    height: 44,
    zIndex: 11,
  },
  editBadgeInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoLinkContainer: {
    marginBottom: 20,
  },
  removePhotoText: {
    fontFamily: 'Handlee-Regular',
    fontSize: 14,
    color: '#ba1a1a',
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  formContainer: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 24,
  },
  card: {
    padding: 24,
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'Handlee-Regular',
    fontSize: 18,
    color: '#944a19',
    marginBottom: 16,
    fontWeight: '800',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 18,
  },
  inputLabel: {
    fontFamily: 'Handlee-Regular',
    fontSize: 14,
    color: '#54433a',
    marginBottom: 6,
  },
  inputField: {
    width: '100%',
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontFamily: 'Handlee-Regular',
    fontSize: 16,
    color: '#1d1b19',
    width: '100%',
    height: '100%',
    outlineStyle: 'none', // For web view
  } as any,
  saveBtnPressable: {
    height: 48,
    width: '100%',
    marginTop: 8,
  },
  saveBtn: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnSuccess: {
    backgroundColor: '#944a19',
  },
  saveBtnText: {
    fontFamily: 'Handlee-Regular',
    fontSize: 16,
    color: '#944a19',
    fontWeight: '700',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preferenceText: {
    fontFamily: 'Handlee-Regular',
    fontSize: 16,
    color: '#1d1b19',
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e2dd',
    backgroundColor: '#fef8f3',
  },
  toggleBtnActive: {
    backgroundColor: '#ffd6d6',
    borderColor: '#944a19',
  },
  toggleBtnText: {
    fontFamily: 'Handlee-Regular',
    fontSize: 14,
    color: '#54433a',
  },
  toggleBtnTextActive: {
    color: '#944a19',
    fontWeight: '700',
  },
  langSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  langBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6e2dd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef8f3',
  },
  langBadgeActive: {
    backgroundColor: '#ffd6d6',
    borderColor: '#944a19',
  },
  langBadgeText: {
    fontFamily: 'Handlee-Regular',
    fontSize: 12,
    color: '#54433a',
  },
  langBadgeTextActive: {
    color: '#944a19',
    fontWeight: '700',
  },
  logoutContainer: {
    width: '100%',
    maxWidth: 480,
    marginTop: 8,
    alignItems: 'center',
  },
  logoutBtnPressable: {
    height: 52,
    width: '100%',
    marginBottom: 16,
  },
  logoutBtn: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontFamily: 'Handlee-Regular',
    fontSize: 16,
    color: '#ba1a1a',
    fontWeight: '700',
  },
  versionText: {
    fontFamily: 'Handlee-Regular',
    fontSize: 12,
    color: '#877369',
    marginTop: 8,
  },
});
