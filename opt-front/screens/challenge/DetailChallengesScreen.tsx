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
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXPO_PUBLIC_BASE_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  DetailChallenge: { challengeId: number };
  OtherProfileScreen: { hostId: number }; // OtherProfileScreen의 라우트 추가
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
        {/* 백버튼 */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* 콘텐츠 */}
        <View style={styles.contentContainer}>
          {/* 호스트 정보 */}
          <View style={styles.hostInfoContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("OtherProfileScreen", {
                  hostId: challenge.hostId,
                })
              }
            >
              <FontAwesome
                name="user-circle-o"
                size={40}
                color="#666"
                style={styles.profileIcon}
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.hostNameText}>{challenge.hostRealName}</Text>
              <Text style={styles.hostSubtitleText}>
                {challenge.hostNickname}
              </Text>
            </View>
          </View>
          {/* 챌린지 카드 */}
          <View style={styles.rowContainer}>
            <View style={styles.challengeCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{challenge.title}</Text>
                <Text style={styles.cardSubtitle}>{challenge.type}</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>기간</Text>
                  <Text
                    style={styles.infoValue}
                  >{`${challenge.startDate} ~ ${challenge.endDate}`}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>상태</Text>
                  <Text style={styles.infoValue}>{challenge.status}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>보상</Text>
                  <Text style={styles.infoValue}>{challenge.reward}</Text>
                </View>
              </View>
            </View>

            {/* 챌린지 설명 */}
            <View style={styles.challengeDescription}>
              <Text style={styles.descriptionTitle}>
                챌린지 내용에 대한 설명
              </Text>
              <Text style={styles.descriptionContent}>
                {challenge.description}
              </Text>
            </View>
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
    flex: 1,
  },
  backButtonContainer: {
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 5, // 백버튼과 카드 사이 간격
  },
  backButton: {
    padding: 10,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  hostInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  hostNameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  hostSubtitleText: {
    fontSize: 14,
    color: "#666",
  },
  profileIcon: {
    paddingHorizontal: 10,
    marginRight: 10,
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
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "flex-start",
    marginBottom: 20,
  },
  challengeCard: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 10,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  cardContent: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: 14,
    color: "#555",
  },
  challengeDescription: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  descriptionContent: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },
});

export default DetailChallengeScreen;
