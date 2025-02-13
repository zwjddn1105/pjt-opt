import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopHeader } from "../../components/TopHeader";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  hostName: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  currentParticipants: number;
  maxParticipants: number;
  frequency: number;
  progress: number;
  imagePath: string | null;
  exerciseType: string;
  exerciseCount: number | null;
  exerciseDuration: number | null;
  exerciseDistance: number | null;
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

const DetailChallengeScreen: React.FC<DetailChallengeProps> = ({ route }) => {
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : challenge ? (
          <>
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={styles.type}>{challenge.type}</Text>
            <Text style={styles.description}>{challenge.description}</Text>
            <View style={styles.infoContainer}>
              <InfoItem label="보상" value={challenge.reward} />
              <InfoItem label="주최자" value={challenge.hostName} />
              <InfoItem label="시작일" value={challenge.startDate} />
              <InfoItem label="종료일" value={challenge.endDate} />
              <InfoItem label="상태" value={challenge.status} />
              <InfoItem
                label="참가자"
                value={`${challenge.currentParticipants}/${challenge.maxParticipants}`}
              />
              <InfoItem label="빈도" value={`${challenge.frequency}일`} />
              <InfoItem label="진행률" value={`${challenge.progress}%`} />
              <InfoItem label="운동 유형" value={challenge.exerciseType} />
              {challenge.exerciseCount !== null && (
                <InfoItem
                  label="운동 횟수"
                  value={challenge.exerciseCount.toString()}
                />
              )}
              {challenge.exerciseDuration && (
                <InfoItem
                  label="운동 시간"
                  value={`${challenge.exerciseDuration}분`}
                />
              )}
              {challenge.exerciseDistance && (
                <InfoItem
                  label="운동 거리"
                  value={`${challenge.exerciseDistance}km`}
                />
              )}
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              챌린지 정보를 찾을 수 없습니다.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  type: {
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  infoValue: {
    fontSize: 16,
    color: "#666",
  },
});

export default DetailChallengeScreen;
