import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useHabits } from '@/context/HabitsContext';
import { Neumorphic } from '@/components/Neumorphic';
import { ThemedText } from '@/components/themed-text';

// Component for a single animated bar in the chart
function ChartBar({ day, percentage, isToday }: { day: string; percentage: number; isToday: boolean }) {
  const heightVal = useSharedValue(0);

  useEffect(() => {
    // Animate height to the percentage
    heightVal.value = withSpring(percentage, { damping: 15, stiffness: 100 });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${heightVal.value}%`,
    };
  });

  return (
    <View style={styles.barColumn}>
      {/* Outer Inset Well */}
      <Neumorphic variant="inset-deep" borderRadius={16} style={styles.barWell}>
        {/* Animated Inner Progress Pill */}
        {percentage > 0 && (
          <Animated.View
            style={[
              styles.barFill,
              isToday ? styles.barFillToday : styles.barFillNormal,
              animatedStyle,
            ]}
          />
        )}
      </Neumorphic>
      <ThemedText
        themeColor={isToday ? "text" : "textSecondary"}
        style={[styles.barLabel, isToday && styles.barLabelToday]}
      >
        {day}
      </ThemedText>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { weeklyProgress, streakStats, habits, loading } = useHabits();
  const [activeFilter, setActiveFilter] = useState<'all' | string>('all');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#944a19" />
      </View>
    );
  }

  // Define filters (All habits, plus each individual habit)
  const filters = [
    { id: 'all', label: 'All Habits' },
    ...habits.map((h) => ({ id: h.id, label: h.title })),
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      {/* Page Header */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <ThemedText themeColor="text" style={styles.title}>
          Analytics
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Track your gentle progress.
        </ThemedText>
      </Animated.View>

      {/* Filter Pills Scroll View */}
      <Animated.View entering={FadeInUp.duration(600).delay(100)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterContainer}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                style={styles.filterPressable}
              >
                {isActive ? (
                  <Neumorphic
                    variant="button-inset"
                    borderRadius={20}
                    style={styles.filterPillActive}
                  >
                    <ThemedText style={styles.filterTextActive}>
                      {filter.label}
                    </ThemedText>
                  </Neumorphic>
                ) : (
                  <Neumorphic
                    variant="button-extruded"
                    borderRadius={20}
                    style={styles.filterPillInactive}
                  >
                    <ThemedText themeColor="textSecondary" style={styles.filterTextInactive}>
                      {filter.label}
                    </ThemedText>
                  </Neumorphic>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Chart Card */}
      <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.chartCardContainer}>
        <Neumorphic variant="extruded" borderRadius={24} style={styles.chartCard}>
          {/* Card Header */}
          <View style={styles.chartHeader}>
            <View>
              <ThemedText themeColor="text" style={styles.chartTitle}>
                Weekly Flow
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.chartSubtitle}>
                This Week vs Last Week
              </ThemedText>
            </View>
            <View style={styles.trendContainer}>
              <MaterialIcons name="trending-up" size={20} color="#944a19" />
              <ThemedText style={styles.trendText}>+12%</ThemedText>
            </View>
          </View>

          {/* Neumorphic Chart */}
          <View style={styles.chartContainer}>
            {weeklyProgress.map((item, index) => (
              <ChartBar
                key={index}
                day={item.day}
                // If filtering by individual habit, we just display placeholder or mock data variation for demonstration,
                // otherwise overall weekly progress rate.
                percentage={activeFilter === 'all' ? item.percentage : Math.min(100, item.percentage * (index % 2 === 0 ? 1.5 : 0.5))}
                isToday={item.isToday}
              />
            ))}
          </View>
        </Neumorphic>
      </Animated.View>

      {/* Stats Cards Section */}
      <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.statsContainer}>
        <ThemedText themeColor="text" style={styles.sectionTitle}>
          Key Metrics
        </ThemedText>

        <View style={styles.statsGrid}>
          {/* Streak Card */}
          <Neumorphic variant="extruded" borderRadius={20} style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="local-fire-department" size={24} color="#944a19" />
            </View>
            <ThemedText themeColor="text" style={styles.statValue}>
              {streakStats.currentStreak} Days
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>
              Current Streak
            </ThemedText>
          </Neumorphic>

          {/* Completion Rate Card */}
          <Neumorphic variant="extruded" borderRadius={20} style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="insights" size={24} color="#944a19" />
            </View>
            <ThemedText themeColor="text" style={styles.statValue}>
              {streakStats.completionRate}%
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>
              Completion Rate
            </ThemedText>
          </Neumorphic>
        </View>
      </Animated.View>
    </ScrollView>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  filterContainer: {
    width: '100%',
    maxWidth: 480,
    height: 48,
    marginBottom: 32,
  },
  filterScroll: {
    gap: 12,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  filterPressable: {
    height: 38,
  },
  filterPillActive: {
    height: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTextActive: {
    fontSize: 14,
    color: '#944a19',
  },
  filterPillInactive: {
    height: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTextInactive: {
    fontSize: 14,
  },
  chartCardContainer: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 32,
  },
  chartCard: {
    padding: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 20,
  },
  chartSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    color: '#944a19',
  },
  chartContainer: {
    height: 192,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    gap: 8,
  },
  barWell: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: 3,
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  barFillNormal: {
    backgroundColor: '#ff9f67', // primary container
  },
  barFillToday: {
    backgroundColor: '#944a19', // primary active
  },
  barLabel: {
    fontSize: 12,
  },
  barLabelToday: {
    color: '#944a19',
  },
  statsContainer: {
    width: '100%',
    maxWidth: 480,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    alignItems: 'flex-start',
    gap: 12,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef8f3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e6e2dd',
  },
  statValue: {
    fontSize: 22,
  },
  statLabel: {
    fontSize: 12,
  },
});
