import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Image, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  LayoutAnimationConfig,
} from 'react-native-reanimated';
import { useHabits } from '@/context/HabitsContext';
import { Neumorphic } from '@/components/Neumorphic';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const { habits, loading, toggleHabit } = useHabits();

  const allCompleted = habits.length > 0 && habits.every((h) => h.completed);

  // Reanimated scale value for the central plinth
  const scale = useSharedValue(1);

  useEffect(() => {
    if (allCompleted) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 12, stiffness: 100 })
      );
    }
  }, [allCompleted]);

  const animatedPlinthStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#944a19" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#ffe4d6', '#fef8f3']}
        locations={[0, 0.7]}
        style={StyleSheet.absoluteFill}
      />

      {/* Greeting Header */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <ThemedText style={styles.greeting}>
          {allCompleted ? "You're on fire today!" : "Morning, Jay. Your coffee is brewing..."}
        </ThemedText>
      </Animated.View>

      {/* Central Illustration Plinth */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(100)}
        style={[styles.plinthContainer, animatedPlinthStyle]}
      >
        <Neumorphic variant="extruded" borderRadius={112} style={styles.plinthOuter}>
          <View style={styles.plinthInner}>
            {allCompleted ? (
              <Image
                source={require('@/assets/images/flame.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('@/assets/images/coffee.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            )}
          </View>
        </Neumorphic>
      </Animated.View>

      {/* Subtitle / Status */}
      <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.statusContainer}>
        <ThemedText style={styles.statusText}>
          {allCompleted
            ? "All habits completed. You've earned 50 points."
            : `${habits.filter((h) => !h.completed).length} habits to start your day.`}
        </ThemedText>
      </Animated.View>

      {/* Habit Cards List */}
      <LayoutAnimationConfig skipEntering>
        <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.listContainer}>
          {habits.map((habit) => {
            const iconName = habit.icon as any;
            
            return (
              <Pressable
                key={habit.id}
                onPress={() => toggleHabit(habit.id)}
                style={styles.cardPressable}
              >
                <Neumorphic
                  variant={habit.completed ? 'inset' : 'extruded'}
                  borderRadius={20}
                  style={[styles.card, habit.completed && styles.cardCompleted]}
                >
                  {/* Custom Checkbox */}
                  <View style={styles.checkboxContainer}>
                    {habit.completed ? (
                      <Neumorphic
                        variant="button-inset"
                        borderRadius={16}
                        backgroundColor="#ff9f67"
                        style={styles.checkboxChecked}
                      >
                        <MaterialIcons name="check" size={18} color="#773402" />
                      </Neumorphic>
                    ) : (
                      <Neumorphic
                        variant="button-extruded"
                        borderRadius={16}
                        style={styles.checkboxUnchecked}
                      >
                        <View style={styles.checkboxInnerPlaceholder} />
                      </Neumorphic>
                    )}
                  </View>

                  {/* Habit Info */}
                  <View style={styles.infoContainer}>
                    <ThemedText
                      style={[
                        styles.habitTitle,
                        habit.completed && styles.textCompleted,
                      ]}
                    >
                      {habit.title}
                    </ThemedText>
                    <ThemedText style={styles.habitSubtitle}>
                      {habit.subtitle}
                    </ThemedText>
                  </View>

                  {/* Habit Icon Category */}
                  <Neumorphic
                    variant="inset"
                    borderRadius={20}
                    style={styles.iconWell}
                  >
                    <MaterialIcons name={iconName} size={20} color="#944a19" />
                  </Neumorphic>
                </Neumorphic>
              </Pressable>
            );
          })}
        </Animated.View>
      </LayoutAnimationConfig>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef8f3',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 110,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    textAlign: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    textAlign: 'center',
    color: '#1d1b19',
  },
  plinthContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plinthOuter: {
    width: 224,
    height: 224,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  plinthInner: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '90%',
    height: '90%',
  },
  statusContainer: {
    marginBottom: 32,
  },
  statusText: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 16,
    color: '#54433a',
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
  },
  cardPressable: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 16,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  checkboxContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnchecked: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInnerPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  checkboxChecked: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  habitTitle: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 18,
    color: '#1d1b19',
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  habitSubtitle: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 13,
    color: '#54433a',
    marginTop: 2,
  },
  iconWell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
