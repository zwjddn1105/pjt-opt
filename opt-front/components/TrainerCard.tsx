// components/TrainerCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

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
  // Find the lowest priced menu
  const lowestPriceMenu = trainer.menus.length > 0 
    ? trainer.menus.reduce((prev, curr) => 
        prev.price < curr.price ? prev : curr
      ) 
    : null;

  const roundedRating = Math.round(trainer.averageRating * 10) / 10;

  return (
    <View style={styles.card}>
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
    </View>
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