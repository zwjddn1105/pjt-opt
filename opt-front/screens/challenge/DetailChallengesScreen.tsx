import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopHeader } from "../../components/TopHeader";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXPO_PUBLIC_BASE_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  DetailChallenge: { challengeId: number };
};

type DetailChallengeProps = {
  route: RouteProp<RootStackParamList, "DetailChallenge">;
};

type Challenge = {
  id: number;
  type: string;
  title: string;
  description: string;
  reward: string;
  templateId: number;
  winnerName: string | null;
  hostId: number;
  hostNickname: string;
  hostRealName: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  currentParticipants: number;
  maxParticipants: number;
  frequency: number;
  progress: number | null;
  imagePath: string | null;
  exerciseType: string;
  exerciseCount: number | null;
  exerciseDuration: number | null;
  exerciseDistance: number | null;
};

const BASE_URL = EXPO_PUBLIC_BASE_URL;

const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem("refreshToken");
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    return null;
  }
};

const DetailChallengeScreen: React.FC<DetailChallengeProps> = ({ route }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { challengeId } = route.params;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("Refresh token not found");
        const response = await axios.get<Challenge>(
          `${BASE_URL}/challenges/${challengeId}`,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );
        setChallenge(response.data);
        setLoading(false);
      } catch (error) {
        console.error("챌린지 상세 정보 불러오기 실패:", error);
        setError("챌린지 정보를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };
    fetchChallengeDetails();
  }, [challengeId]);
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  if (!challenge) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>챌린지 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});

export default DetailChallengeScreen;
