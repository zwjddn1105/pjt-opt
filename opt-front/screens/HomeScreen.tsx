import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SendButton from '../components/SendButton';
import ProfileButton from '../components/ProfileButton';

type RootStackParamList = {
  Home: undefined;
  KakaoLogin: undefined;
  DMScreen: undefined;
  Profile: undefined;
  LoginNeedScreen: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const ChallengeCard = () => (
  <View style={styles.card}>
    <Image 
      source={require('../assets/challenge-placeholder.png')} 
      style={styles.cardImage}
      defaultSource={require('../assets/challenge-placeholder.png')}
    />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>X-CHALLENGE SEOUL</Text>
      <Text style={styles.cardDescription}>서울시 청년 도전 지원사업</Text>
      <Text style={styles.cardPeriod}>2024.01.01 ~ 2024.12.31</Text>
    </View>
  </View>
);

const TrainerCard = () => (
  <View style={styles.trainerCard}>
    <Image 
      source={require('../assets/trainer-placeholder.png')} 
      style={styles.trainerImage}
      defaultSource={require('../assets/trainer-placeholder.png')}
    />
    <View style={styles.trainerContent}>
      <Text style={styles.trainerName}>임성진 트레이너</Text>
      <Text style={styles.trainerDescription}>0.4km · 경력 4년</Text>
      <Text style={styles.trainerPrice}>1회당 60,000원</Text>
    </View>
  </View>
);

interface SpecialtyButtonProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

const SpecialtyButton: React.FC<SpecialtyButtonProps> = ({ title, isSelected, onPress }) => (
  <TouchableOpacity 
    style={[styles.specialtyButton, isSelected && styles.specialtyButtonSelected]} 
    onPress={onPress}
  >
    <Text style={[styles.specialtyButtonText, isSelected && styles.specialtyButtonTextSelected]}>
      {title}
    </Text>
  </TouchableOpacity>
);

interface TabButtonProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, isSelected, onPress }) => (
  <TouchableOpacity 
    style={[styles.tabButton, isSelected && styles.tabButtonSelected]} 
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, isSelected && styles.tabButtonTextSelected]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedSpecialty, setSelectedSpecialty] = useState('다이어트');
  const [selectedTab, setSelectedTab] = useState('nearby');
  const [streak, setStreak] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<string[]>([]);

  const specialties = ['다이어트', '빌크업', '필라테스', '체형교정'];

  const calculateWorkoutStats = async () => {
    try {
      const records = await AsyncStorage.getItem('exerciseRecords');
      if (!records) return;
      
      const exerciseRecords = JSON.parse(records);
      const workoutDates = [...new Set(exerciseRecords.map((record: any) => record.date))].sort();
      
      // 연속 운동일수 계산
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const startCheckingDate = workoutDates.includes(today) ? today : yesterday;
      
      for (let i = new Date(startCheckingDate); ; i.setDate(i.getDate() - 1)) {
        const dateString = i.toISOString().split('T')[0];
        if (!workoutDates.includes(dateString)) break;
        currentStreak++;
      }
      
      // 주간 운동 현황
      const weeklyDates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        weeklyDates.push(date);
      }
      
      setStreak(currentStreak);
      setWeeklyWorkouts(weeklyDates.filter(date => workoutDates.includes(date)));
    } catch (error) {
      console.error('Failed to calculate workout stats:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      calculateWorkoutStats();
    }, [])
  );

  const handleProfilePress = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      navigation.navigate("Profile");
    } else {
      navigation.navigate("LoginNeedScreen");
    }
  };

  const renderTrainerSection = () => (
    <>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialtyButtonsContainer}
      >
        {specialties.map((specialty) => (
          <SpecialtyButton
            key={specialty}
            title={specialty}
            isSelected={selectedSpecialty === specialty}
            onPress={() => setSelectedSpecialty(specialty)}
          />
        ))}
      </ScrollView>

      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TrainerCard />
        <TrainerCard />
        <TrainerCard />
        <TrainerCard />
        <TrainerCard />
      </ScrollView>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topButtons}>
        <ProfileButton onPress={handleProfilePress} />
        <SendButton onPress={() => navigation.navigate("DMScreen")} />
      </View>
      
      <ScrollView style={styles.mainContent}>
        <View style={styles.workoutStatsSection}>
          <View style={styles.streakContainer}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakText}>일 연속 운동 중</Text>
          </View>
          <View style={styles.weeklyContainer}>
            {Array.from({ length: 7 }).map((_, index) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - index));
              const dateString = date.toISOString().split('T')[0];
              const isWorkoutDay = weeklyWorkouts.includes(dateString);
              const isToday = index === 6;
              
              return (
                <View key={dateString} style={styles.dayContainer}>
                  <Text style={styles.dayText}>
                    {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
                  </Text>
                  <View style={[
                    styles.dayDot,
                    isWorkoutDay && styles.workoutDot,
                    isToday && styles.todayDot,
                  ]} />
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>진행중인 챌린지</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <ChallengeCard />
            <ChallengeCard />
            <ChallengeCard />
            <ChallengeCard />
            <ChallengeCard />
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.trainerHeader}>
            <View style={styles.tabContainer}>
              <TabButton
                title="내 주변 트레이너"
                isSelected={selectedTab === 'nearby'}
                onPress={() => setSelectedTab('nearby')}
              />
              <TabButton
                title="1Day Class 트레이너"
                isSelected={selectedTab === 'oneday'}
                onPress={() => setSelectedTab('oneday')}
              />
            </View>
          </View>
          {renderTrainerSection()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff'
  },
  mainContent: {
    flex: 1,
  },
  section: {
    marginTop: 40,
  },
  topButtons: {
    position: 'absolute',
    top: 40,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  specialtyButtonsContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  specialtyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  specialtyButtonSelected: {
    backgroundColor: '#000',
  },
  specialtyButtonText: {
    fontSize: 14,
    color: '#666',
  },
  specialtyButtonTextSelected: {
    color: '#fff',
  },
  card: {
    width: 300,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.84,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cardPeriod: {
    fontSize: 12,
    color: '#888',
  },
  trainerCard: {
    width: 300,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.84,
    elevation: 3,
  },
  trainerImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  trainerContent: {
    padding: 15,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trainerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  trainerPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  trainerHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  tabButton: {
    paddingBottom: 8,
  },
  tabButtonSelected: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
  },
  tabButtonTextSelected: {
    color: '#000',
  },
  workoutStatsSection: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    marginTop: 80,
    marginHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  streakText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  weeklyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  workoutDot: {
    backgroundColor: '#007AFF',
  },
  todayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
});

export default HomeScreen;