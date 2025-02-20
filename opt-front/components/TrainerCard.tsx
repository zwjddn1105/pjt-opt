// components/TrainerCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert   } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from 'axios';
import { EXPO_PUBLIC_BASE_URL } from "@env";

type RootStackParamList = {
  ProfileScreen: { profileData: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Menu {
  id: number;
  name: string;
  trainerId: number;
  price: number;
  totalSessions: number;
}

interface TrainerCardProps {
  trainer: {
    keywords: string[];
    averageRating: number;
    reviewCount: number;
    menus: Menu[];
    trainerId: number;
    intro: string;
    experienceYears: number;
    availableHours: string;
    trainerProfileImage: string;
    gymName: string;
    gymAddress: string;
    oneDayAvailable: boolean;
    trainerNickname: string;
  };
}

const TrainerCard: React.FC<TrainerCardProps> = ({ trainer }) => {
  const navigation = useNavigation<NavigationProp>();
  const BASE_URL = EXPO_PUBLIC_BASE_URL;

  const lowestPriceMenu = trainer.menus.length > 0 
    ? trainer.menus.reduce((prev, curr) => 
        prev.price < curr.price ? prev : curr
      ) 
    : null;

  const roundedRating = Math.round(trainer.averageRating * 10) / 10;

  const handlePress = async () => {
    try {
      if (!trainer.trainerId) {
        console.error("트레이너 ID가 유효하지 않습니다.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/profile/${trainer.trainerId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status < 500; // 500 미만의 상태 코드는 에러로 처리하지 않음
        }
      });

      if (response.status === 200) {
        navigation.navigate("ProfileScreen", { profileData: response.data });
      } else if (response.status === 400) {
        console.error("잘못된 요청입니다:", response.data);
        // TODO: 사용자에게 에러 메시지 표시
        Alert.alert(
          "오류",
          "프로필을 불러올 수 없습니다. 잠시 후 다시 시도해주세요."
        );
      } else if (response.status === 401) {
        console.error("인증이 필요합니다.");
        // TODO: 로그인 화면으로 이동하거나 사용자에게 로그인 필요성 알림
        Alert.alert(
          "로그인 필요",
          "프로필을 보기 위해 로그인이 필요합니다."
        );
      } else {
        console.error("프로필 데이터를 가져오는데 실패했습니다.", response.status, response.data);
        Alert.alert(
          "오류",
          "프로필을 불러오는 중 문제가 발생했습니다."
        );
      }
    } catch (error) {
      console.error("프로필 요청 중 오류 발생:", error);
      Alert.alert(
        "오류",
        "네트워크 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: trainer.trainerProfileImage }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{trainer.trainerNickname}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.reviewText}>
              ({trainer.reviewCount}) {roundedRating}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>
          {trainer.keywords.join(', ')}
        </Text>

        {lowestPriceMenu && (
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.sessionText}>{lowestPriceMenu.totalSessions}회 패키지</Text>
              <Text style={styles.price}>{lowestPriceMenu.price.toLocaleString()}원</Text>
            </View>
          </View>
        )}

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {trainer.gymName} · {trainer.gymAddress}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
});

export default TrainerCard;