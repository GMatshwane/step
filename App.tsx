import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pedometer } from "expo-sensors";
import Svg, { Circle } from "react-native-svg";

const STEP_GOAL = 10000;
const STRIDE_LENGTH_METERS = 0.78;
const CALORIES_PER_STEP = 0.04;
const RING_SIZE = 176;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function App() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | null>(null);
  const [steps, setSteps] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let subscription: { remove: () => void } | null = null;

    const initPedometer = async () => {
      const available = await Pedometer.isAvailableAsync();
      if (!isMounted) {
        return;
      }

      setIsPedometerAvailable(available);

      if (available) {
        subscription = Pedometer.watchStepCount((result) => {
          setSteps(result.steps);
        });
      }
    };

    initPedometer().catch(() => {
      if (isMounted) {
        setIsPedometerAvailable(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!isSimulating) {
      return;
    }

    const id = setInterval(() => {
      setSteps((current) => current + 1);
    }, 700);

    return () => clearInterval(id);
  }, [isSimulating]);

  const progress = useMemo(() => Math.min(steps / STEP_GOAL, 1), [steps]);
  const distanceKm = useMemo(() => (steps * STRIDE_LENGTH_METERS) / 1000, [steps]);
  const calories = useMemo(() => steps * CALORIES_PER_STEP, [steps]);
  const remainingSteps = useMemo(() => Math.max(STEP_GOAL - steps, 0), [steps]);
  const ringOffset = useMemo(
    () => RING_CIRCUMFERENCE * (1 - progress),
    [progress]
  );

  const resetSteps = () => {
    setSteps(0);
  };

  const toggleSimulation = () => {
    if (isPedometerAvailable) {
      Alert.alert(
        "Live sensor is active",
        "This device supports pedometer tracking, so simulation mode is disabled."
      );
      return;
    }

    setIsSimulating((current) => !current);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Activity</Text>
            <Text style={styles.subheading}>Track your daily activity</Text>
          </View>
          <View style={styles.headerIcons}>
            <View style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={18} color="#5a6075" />
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{isPedometerAvailable ? "Live" : "Demo"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.primaryCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="shoe-print" size={16} color="#dfe3ff" />
              <Text style={styles.primaryLabel}>Walk</Text>
            </View>
            <Text style={styles.primaryTrend}>
              {Math.round(progress * 100)}
              %
            </Text>
          </View>

          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="#8084ff"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="#c7ffdf"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                strokeDashoffset={ringOffset}
                fill="none"
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <MaterialCommunityIcons name="shoe-print" size={20} color="#ffffff" />
              <Text style={styles.primarySteps}>{steps.toLocaleString()}</Text>
              <Text style={styles.primaryCaption}>Steps</Text>
            </View>
          </View>

          <Text style={styles.goalLine}>
            {remainingSteps === 0
              ? "Goal reached"
              : `${remainingSteps.toLocaleString()} steps to reach ${STEP_GOAL.toLocaleString()}`}
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Feather name="map-pin" size={14} color="#8b92a6" />
              <Text style={styles.metricTitle}>Distance</Text>
            </View>
            <Text style={styles.metricValue}>{distanceKm.toFixed(2)} km</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Feather name="activity" size={14} color="#8b92a6" />
              <Text style={styles.metricTitle}>Calories</Text>
            </View>
            <Text style={styles.metricValue}>{calories.toFixed(0)} kcal</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Feather name="target" size={14} color="#8b92a6" />
              <Text style={styles.metricTitle}>Goal</Text>
            </View>
            <Text style={styles.metricValue}>{STEP_GOAL.toLocaleString()}</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Feather name="cpu" size={14} color="#8b92a6" />
              <Text style={styles.metricTitle}>Sensor</Text>
            </View>
            <Text style={styles.metricValueSmall}>
              {isPedometerAvailable ? "Available" : "Unavailable"}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={resetSteps}>
            <Text style={styles.primaryButtonText}>Reset</Text>
          </Pressable>

          <Pressable
            style={[
              styles.secondaryButton,
              isPedometerAvailable ? styles.buttonDisabled : undefined
            ]}
            onPress={toggleSimulation}
          >
            <Text style={styles.secondaryButtonText}>
              {isSimulating ? "Stop Demo" : "Start Demo"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.tabShell}>
        <View style={styles.tabItemActive}>
          <Ionicons name="home" size={17} color="#5f64ff" />
          <Text style={styles.tabTextActive}>Home</Text>
        </View>
        <View style={styles.tabItem}>
          <Ionicons name="leaf-outline" size={17} color="#9aa1b5" />
          <Text style={styles.tabText}>Diet</Text>
        </View>
        <View style={styles.tabItem}>
          <MaterialCommunityIcons name="chart-donut" size={18} color="#9aa1b5" />
          <Text style={styles.tabText}>Report</Text>
        </View>
        <View style={styles.tabItem}>
          <Ionicons name="person-outline" size={17} color="#9aa1b5" />
          <Text style={styles.tabText}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef1f7"
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2430"
  },
  subheading: {
    marginTop: 4,
    fontSize: 14,
    color: "#7a8194"
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center"
  },
  statusBadge: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  statusBadgeText: {
    color: "#5f64ff",
    fontWeight: "600",
    fontSize: 13
  },
  primaryCard: {
    backgroundColor: "#5f64ff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  primaryLabel: {
    color: "#dfe3ff",
    fontSize: 14
  },
  primaryTrend: {
    color: "#e9ebff",
    fontSize: 14,
    fontWeight: "600"
  },
  primarySteps: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: "700",
    color: "#ffffff"
  },
  primaryCaption: {
    marginTop: 1,
    color: "#e6e8ff",
    fontSize: 14
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center"
  },
  goalLine: {
    marginTop: 14,
    color: "#edf0ff",
    fontSize: 13,
    textAlign: "center"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 2
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    width: "48%",
    marginBottom: 10
  },
  metricTitle: {
    color: "#8b92a6",
    fontSize: 13
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  metricValue: {
    marginTop: 10,
    fontSize: 23,
    fontWeight: "600",
    color: "#23283a"
  },
  metricValueSmall: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#23283a"
  },
  actions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  primaryButton: {
    backgroundColor: "#23283a",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    width: "48%"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d8dcea",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    width: "48%"
  },
  secondaryButtonText: {
    color: "#4b5165",
    fontWeight: "600",
    fontSize: 15
  },
  buttonDisabled: {
    opacity: 0.45
  },
  tabShell: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e8ebf5",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  tabItem: {
    alignItems: "center",
    width: 64
  },
  tabItemActive: {
    alignItems: "center",
    width: 64
  },
  tabText: {
    marginTop: 4,
    fontSize: 12,
    color: "#9aa1b5"
  },
  tabTextActive: {
    marginTop: 4,
    fontSize: 12,
    color: "#5f64ff",
    fontWeight: "600"
  }
});
