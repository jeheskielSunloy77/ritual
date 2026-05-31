import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  SlideInDown,
  SlideOutDown,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useHabits } from '@/context/HabitsContext';
import { Neumorphic } from '@/components/Neumorphic';
import { ThemedText } from '@/components/themed-text';

export default function MeScreen() {
  const { habits, loading, toggleHabit, addHabit, deleteHabit } = useHabits();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  
  // Modal visibility states
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [frequency, setFrequency] = useState('daily'); // 'daily' | 'weekdays' | 'weekends'
  const [icon, setIcon] = useState('water_drop');
  const [color, setColor] = useState<'primary' | 'secondary' | 'tertiary'>('primary');
  const [targetType, setTargetType] = useState<'boolean' | 'counter'>('boolean');
  const [targetValue, setTargetValue] = useState('1');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#944a19" />
      </View>
    );
  }

  const handleCreateHabit = async () => {
    if (!title.trim()) return;
    
    const parsedTargetValue = parseInt(targetValue, 10) || 1;
    await addHabit(
      title,
      subtitle || 'Ritual habit',
      frequency,
      icon,
      color,
      targetType,
      parsedTargetValue
    );

    // Reset Form
    setTitle('');
    setSubtitle('');
    setFrequency('daily');
    setIcon('water_drop');
    setColor('primary');
    setTargetType('boolean');
    setTargetValue('1');
    setModalVisible(false);
  };

  const handleIncrement = async (id: string) => {
    await toggleHabit(id, true);
  };

  const availableIcons = [
    'water_drop',
    'self_improvement',
    'menu_book',
    'directions_walk',
    'fitness_center',
    'hotel',
    'favorite',
    'emoji_objects',
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Page Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <View>
            <ThemedText style={styles.pageTitle}>My Habits</ThemedText>
            <ThemedText style={styles.pageSubtitle}>Your active routines to nurture.</ThemedText>
          </View>
          {/* Add Habit Header Action */}
          <Pressable onPress={() => setModalVisible(true)} style={styles.addHeaderBtnPressable}>
            <Neumorphic variant="button-extruded" borderRadius={24} style={styles.addHeaderBtn}>
              <MaterialIcons name="add" size={24} color="#944a19" />
            </Neumorphic>
          </Pressable>
        </Animated.View>

        {/* Habits Grid */}
        <Animated.View entering={FadeInUp.duration(600).delay(150)} style={styles.grid}>
          {habits.map((habit) => {
            const iconName = habit.icon as any;
            const progressPercent = habit.target_type === 'counter'
              ? Math.round((habit.current_progress / habit.target_value) * 100)
              : 0;

            const iconColors = {
              primary: '#944a19',
              secondary: '#765b06',
              tertiary: '#615e57',
            };

            return (
              <View key={habit.id} style={styles.cardContainer}>
                {habit.completed ? (
                  /* Completed Inset Card */
                  <Neumorphic variant="inset-deep" borderRadius={24} style={styles.cardCompleted}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Neumorphic variant="inset" borderRadius={20} style={styles.iconWellCompleted}>
                          <MaterialIcons name={iconName} size={20} color="#ff9f67" />
                        </Neumorphic>
                        <View>
                          <ThemedText style={styles.habitTitleCompleted}>
                            {habit.title}
                          </ThemedText>
                          <ThemedText style={styles.habitMeta}>
                            {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                          </ThemedText>
                        </View>
                      </View>
                      
                      {/* Completed Check icon */}
                      <View style={styles.completedIndicator}>
                        <MaterialIcons name="check-circle" size={24} color="#944a19" />
                      </View>
                    </View>

                    <View style={styles.completedBody}>
                      <ThemedText style={styles.completedText}>
                        Great job! Completed today.
                      </ThemedText>
                      <Pressable style={styles.deleteBtn} onPress={() => deleteHabit(habit.id)}>
                        <MaterialIcons name="delete-outline" size={18} color="#ba1a1a" />
                      </Pressable>
                    </View>
                  </Neumorphic>
                ) : (
                  /* Pending Extruded Card */
                  <Neumorphic variant="extruded" borderRadius={24} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Neumorphic variant="inset" borderRadius={20} style={styles.iconWell}>
                          <MaterialIcons name={iconName} size={20} color={iconColors[habit.color] || '#944a19'} />
                        </Neumorphic>
                        <View>
                          <ThemedText style={styles.habitTitle}>{habit.title}</ThemedText>
                          <ThemedText style={styles.habitMeta}>
                            {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                          </ThemedText>
                        </View>
                      </View>
                      
                      <Pressable style={styles.deleteBtn} onPress={() => deleteHabit(habit.id)}>
                        <MaterialIcons name="delete-outline" size={18} color="#877369" />
                      </Pressable>
                    </View>

                    {/* Progress details if counter */}
                    {habit.target_type === 'counter' ? (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressLabelRow}>
                          <ThemedText style={styles.progressLabel}>Progress</ThemedText>
                          <ThemedText style={styles.progressValue}>
                            {habit.current_progress}/{habit.target_value}
                          </ThemedText>
                        </View>
                        <Neumorphic variant="inset" borderRadius={8} style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${Math.min(100, progressPercent)}%` },
                            ]}
                          />
                        </Neumorphic>
                        
                        <View style={styles.logActionRow}>
                          <Pressable onPress={() => handleIncrement(habit.id)} style={styles.logPressable}>
                            <Neumorphic variant="button-extruded" borderRadius={16} style={styles.logBtn}>
                              <MaterialIcons name="add" size={16} color="#944a19" />
                              <ThemedText style={styles.logBtnText}>Log Progress</ThemedText>
                            </Neumorphic>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      /* Toggle Check if boolean */
                      <View style={styles.booleanActionRow}>
                        <ThemedText style={styles.targetLabel}>{habit.subtitle}</ThemedText>
                        <Pressable onPress={() => toggleHabit(habit.id)} style={styles.checkPressable}>
                          <Neumorphic variant="button-extruded" borderRadius={16} style={styles.checkBtn}>
                            <MaterialIcons name="check" size={18} color="#944a19" />
                          </Neumorphic>
                        </Pressable>
                      </View>
                    )}
                  </Neumorphic>
                )}
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>

      {/* Create Habit Modal Bottom Sheet / Dialog */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, isWide ? styles.modalOverlayCentered : styles.modalOverlayBottom]}>
          {/* Backdrop Closer */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          
          <Animated.View
            entering={isWide ? FadeIn.duration(300) : SlideInDown.duration(400)}
            exiting={isWide ? FadeOut.duration(200) : SlideOutDown.duration(300)}
            style={[styles.modalSheet, isWide ? styles.modalSheetCentered : styles.modalSheetBottom]}
          >
            {/* Grab Handle */}
            {!isWide && <View style={styles.grabHandle} />}

            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Create New Habit</ThemedText>
              <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#54433a" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll}>
              {/* Title Input */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>Habit Title</ThemedText>
                <Neumorphic variant="inset" borderRadius={12} style={styles.inputWell}>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g. Hydration"
                    placeholderTextColor="#877369"
                    style={styles.input}
                  />
                </Neumorphic>
              </View>

              {/* Subtitle Input */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>Description / Goal</ThemedText>
                <Neumorphic variant="inset" borderRadius={12} style={styles.inputWell}>
                  <TextInput
                    value={subtitle}
                    onChangeText={setSubtitle}
                    placeholder="e.g. Drink 8 glasses of water"
                    placeholderTextColor="#877369"
                    style={styles.input}
                  />
                </Neumorphic>
              </View>

              {/* Frequency selection */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>Frequency</ThemedText>
                <View style={styles.optionsRow}>
                  {['daily', 'weekdays', 'weekends'].map((f) => {
                    const isSelected = frequency === f;
                    return (
                      <Pressable key={f} onPress={() => setFrequency(f)} style={styles.optionPressable}>
                        {isSelected ? (
                          <Neumorphic variant="button-inset" borderRadius={16} style={styles.optionBtnActive}>
                            <ThemedText style={styles.optionTextActive}>
                              {f.charAt(0).toUpperCase() + f.slice(1)}
                            </ThemedText>
                          </Neumorphic>
                        ) : (
                          <Neumorphic variant="button-extruded" borderRadius={16} style={styles.optionBtn}>
                            <ThemedText style={styles.optionText}>
                              {f.charAt(0).toUpperCase() + f.slice(1)}
                            </ThemedText>
                          </Neumorphic>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Icon selection */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>Icon Category</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconsRow}>
                  {availableIcons.map((ic) => {
                    const isSelected = icon === ic;
                    return (
                      <Pressable key={ic} onPress={() => setIcon(ic)} style={styles.iconPressable}>
                        {isSelected ? (
                          <Neumorphic variant="button-inset" borderRadius={16} style={styles.iconBtnActive}>
                            <MaterialIcons name={ic as any} size={20} color="#944a19" />
                          </Neumorphic>
                        ) : (
                          <Neumorphic variant="button-extruded" borderRadius={16} style={styles.iconBtn}>
                            <MaterialIcons name={ic as any} size={20} color="#54433a" />
                          </Neumorphic>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Color Theme selection */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>Color Accent</ThemedText>
                <View style={styles.optionsRow}>
                  {(['primary', 'secondary', 'tertiary'] as const).map((c) => {
                    const isSelected = color === c;
                    const cColors = {
                      primary: '#ff9f67',
                      secondary: '#ffd97d',
                      tertiary: '#bbb6ae',
                    };
                    return (
                      <Pressable key={c} onPress={() => setColor(c)} style={styles.optionPressable}>
                        {isSelected ? (
                          <Neumorphic variant="button-inset" borderRadius={16} style={styles.colorPillActive}>
                            <View style={[styles.colorDot, { backgroundColor: cColors[c] }]} />
                            <ThemedText style={styles.optionTextActive}>
                              {c.charAt(0).toUpperCase() + c.slice(1)}
                            </ThemedText>
                          </Neumorphic>
                        ) : (
                          <Neumorphic variant="button-extruded" borderRadius={16} style={styles.colorPill}>
                            <View style={[styles.colorDot, { backgroundColor: cColors[c] }]} />
                            <ThemedText style={styles.optionText}>
                              {c.charAt(0).toUpperCase() + c.slice(1)}
                            </ThemedText>
                          </Neumorphic>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Target Type selection */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>Goal Target Mode</ThemedText>
                <View style={styles.optionsRow}>
                  {['boolean', 'counter'].map((t) => {
                    const isSelected = targetType === t;
                    return (
                      <Pressable key={t} onPress={() => setTargetType(t as any)} style={styles.optionPressable}>
                        {isSelected ? (
                          <Neumorphic variant="button-inset" borderRadius={16} style={styles.optionBtnActive}>
                            <ThemedText style={styles.optionTextActive}>
                              {t === 'boolean' ? 'Simple Check' : 'Counter Number'}
                            </ThemedText>
                          </Neumorphic>
                        ) : (
                          <Neumorphic variant="button-extruded" borderRadius={16} style={styles.optionBtn}>
                            <ThemedText style={styles.optionText}>
                              {t === 'boolean' ? 'Simple Check' : 'Counter Number'}
                            </ThemedText>
                          </Neumorphic>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Target Value input if counter */}
              {targetType === 'counter' && (
                <View style={styles.formGroup}>
                  <ThemedText style={styles.inputLabel}>Target Goal (e.g. 8 times)</ThemedText>
                  <Neumorphic variant="inset" borderRadius={12} style={styles.inputWell}>
                    <TextInput
                      value={targetValue}
                      onChangeText={setTargetValue}
                      keyboardType="numeric"
                      placeholder="e.g. 8"
                      placeholderTextColor="#877369"
                      style={styles.input}
                    />
                  </Neumorphic>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.formActionRow}>
                <Pressable onPress={handleCreateHabit} style={styles.submitPressable}>
                  <Neumorphic variant="button-extruded" borderRadius={24} style={styles.submitBtn}>
                    <ThemedText style={styles.submitText}>Save Habit</ThemedText>
                  </Neumorphic>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef8f3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef8f3',
  },
  scrollContainer: {
    paddingTop: 32,
    paddingBottom: 110,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  pageTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 26,
    color: '#1d1b19',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 14,
    color: '#54433a',
  },
  addHeaderBtnPressable: {
    height: 48,
  },
  addHeaderBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    width: '100%',
    maxWidth: 480,
    gap: 20,
  },
  cardContainer: {
    width: '100%',
  },
  card: {
    padding: 20,
    gap: 16,
  },
  cardCompleted: {
    padding: 20,
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWell: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWellCompleted: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: '#1d1b19',
  },
  habitTitleCompleted: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: '#1d1b19',
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  habitMeta: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 12,
    color: '#54433a',
    marginTop: 2,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIndicator: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 13,
    color: '#54433a',
  },
  progressValue: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 13,
    color: '#54433a',
  },
  progressBar: {
    height: 14,
    padding: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff9f67',
    borderRadius: 6,
  },
  logActionRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  logPressable: {
    height: 36,
  },
  logBtn: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 4,
  },
  logBtnText: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 12,
    color: '#944a19',
  },
  booleanActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e6e2dd',
  },
  targetLabel: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 14,
    color: '#54433a',
  },
  checkPressable: {
    height: 36,
  },
  checkBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e6e2dd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedText: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 14,
    color: '#54433a',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 27, 25, 0.4)',
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
    paddingTop: 8,
    paddingHorizontal: 24,
    shadowColor: '#1d1b19',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 20,
  },
  modalSheetCentered: {
    borderRadius: 28,
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    paddingBottom: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  modalSheetBottom: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: Dimensions.get('window').height * 0.85,
    shadowOffset: { width: 0, height: -10 },
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#dac2b6',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    color: '#1d1b19',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 14,
    color: '#54433a',
  },
  inputWell: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 16,
    color: '#1d1b19',
    outlineStyle: 'none',
  } as any,
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionPressable: {
    flex: 1,
    height: 40,
  },
  optionBtnActive: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBtn: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextActive: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 13,
    color: '#944a19',
  },
  optionText: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 13,
    color: '#54433a',
  },
  iconsRow: {
    gap: 12,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  iconPressable: {
    width: 44,
    height: 44,
  },
  iconBtnActive: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPillActive: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  colorPill: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  formActionRow: {
    marginTop: 16,
    marginBottom: 8,
  },
  submitPressable: {
    height: 50,
  },
  submitBtn: {
    height: 50,
    backgroundColor: '#ff9f67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#773402',
  },
});
