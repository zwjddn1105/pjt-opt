import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BADGES } from '../data/badges';
import { Badge } from '../types/badge';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type BadgeScreenProps = {
    navigation: NativeStackNavigationProp<any>;
  };

  const BadgeScreen: React.FC<BadgeScreenProps> = ({ navigation }) => {
  const screenWidth = Dimensions.get('window').width;
  const itemSize = (screenWidth - 48) / 3;

  const getBadgeColor = (badge: Badge) => {
    if (!badge.isUnlocked) return '#333333';
    switch (badge.level) {
      case 3:
        return '#FFD700'; // 골드
      case 2:
        return '#C0C0C0'; // 실버
      default:
        return '#CD7F32'; // 브론즈
    }
  };

  const renderBadgeProgress = (badge: Badge) => {
    if (!badge.requiredCount || !badge.currentCount) return null;
    
    const progress = (badge.currentCount / badge.requiredCount) * 100;
    return (
      <Text style={styles.progressText}>
        {badge.currentCount}/{badge.requiredCount}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={32}
            color="#000000"
          />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <Text style={styles.title}>운동</Text>
        <Text style={styles.subtitle}>새로운 기록과 뱃지로 목표를 달성해 보세요</Text>
        <View style={styles.badgeContainer}>
          {BADGES.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badgeItem,
                { width: itemSize, height: itemSize + 40 },
              ]}
            >
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getBadgeColor(badge) },
                ]}
              >
                <MaterialCommunityIcons
                  name={badge.icon as any}
                  size={itemSize * 0.4}
                  color={badge.isUnlocked ? '#000000' : '#666666'}
                />
              </View>
              <Text
                style={[
                  styles.badgeTitle,
                  { color: badge.isUnlocked ? '#000000' : '#666666' },
                ]}
                numberOfLines={2}
              >
                {badge.title}
              </Text>
              {renderBadgeProgress(badge)}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  badgeItem: {
    padding: 12,
    alignItems: 'center',
  },
  badge: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 50,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#999999',
  },
});

export default BadgeScreen;