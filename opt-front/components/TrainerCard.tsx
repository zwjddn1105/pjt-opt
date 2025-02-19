// components/TrainerCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity   } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from 'axios';
import { EXPO_PUBLIC_BASE_URL } from "@env";

type RootStackParamList = {
  TrainerProfile: { trainerId: number };
  // ... 기존 라우트들
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
    trainer_id: number;
    intro: string;
    experienceYears: number;
    availableHours: string;
    trainerProfileImage: string;
    gymName: string;
    gymAddress: string;
    oneDayAvailable: boolean;
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
      const response = await axios.get(`${BASE_URL}/profile/${trainer.trainer_id}`);
      if (response.status === 200) {
        navigation.navigate("ProfileScreen", { profileData: response.data });
      } else {
        console.error("프로필 데이터를 가져오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("프로필 요청 중 오류 발생:", error);
      // 트레이너 프로필의 경우 로그인이 필요 없을 수 있으므로, 
      // 단순히 에러 로깅만 하거나 별도의 에러 처리를 하실 수 있습니다
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
          <Text style={styles.title}>{trainer.intro}</Text>
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