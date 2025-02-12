import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { TopHeader } from "../../components/TopHeader";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  MyChallenge: undefined;
};

type Challenge = {
  id: number;
  type: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
};

const BASE_URL = "http://70.12.246.176:8080";

const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem("refreshToken");
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    return null;
  }
};

const PastChallengesScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isEnabled, setIsEnabled] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("Refresh token not found");

        const response = await axios.get<Challenge[]>(
          `${BASE_URL}/challenges/past`,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );
        setChallenges(response.data);
      } catch (error) {
        console.error("참여했던 챌린지 불러오기 실패:", error);
      }
    };

    fetchChallenges();
  }, []);

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopHeader />
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={toggleSwitch}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.toggleTrack,
                isEnabled && styles.toggleTrackActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  isEnabled && styles.toggleTextActive,
                ]}
              >
                MY
              </Text>
              <View
                style={[
                  styles.toggleThumb,
                  isEnabled && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {renderSectionHeader("내가 참여했던 챌린지")}
          <View style={styles.cardContainer}>
            {challenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{challenge.title}</Text>
                  <Text style={styles.cardSubtitle}>{challenge.type}</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>기간</Text>
                    <Text style={styles.infoValue}>
                      {`${challenge.startDate} ~ ${challenge.endDate}`}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>상태</Text>
                    <Text style={styles.infoValue}>{challenge.status}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>설명</Text>
                    <Text style={styles.infoValue}>
                      {challenge.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    marginBottom: 10,
    flex: 1,
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 30,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  addButtonText: {
    fontSize: 18,
    color: "#666",
    lineHeight: 24,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  challengeCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 14,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    width: 70,
    fontSize: 12,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
  },
  toggleContainer: {
    width: 75,
    height: 30,
  },
  toggleTrack: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
    backgroundColor: "#767577",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  toggleTrackActive: {
    backgroundColor: "#0C508B",
  },
  toggleTextActive: {
    color: "#fff",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f4f3f4",
    position: "absolute",
    left: 4,
  },
  toggleText: {
    color: "#f4f3f4",
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 8,
  },
  toggleThumbActive: {
    left: "auto",
    right: 4,
    backgroundColor: "#fff",
  },
  customToggle: {
    width: 70,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#767577",
    justifyContent: "center",
    alignItems: "center",
  },
  customToggleActive: {
    backgroundColor: "#0C508B",
  },
  backButton: {
    padding: 8,
    marginLeft: 12,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 20,
  },
});

export default PastChallengesScreen;
