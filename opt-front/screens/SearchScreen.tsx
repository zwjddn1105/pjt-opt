// screens/SearchScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopHeader } from '../components/TopHeader';
import * as Location from 'expo-location';
import { getRecommendedTrainers, type TrainerResponse } from '../api/searchTrainer';

const TrainerCard: React.FC<{ trainer: TrainerResponse }> = ({ trainer }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <Text style={styles.intro}>{trainer.intro}</Text>
      {trainer.experienceYears != null && (
        <Text style={styles.experience}>경력 {trainer.experienceYears}년</Text>
      )}
      {trainer.availableHours && (
        <Text style={styles.availableHours}>가능 시간: {trainer.availableHours}</Text>
      )}
      {trainer.oneDayAvailable && (
        <View style={styles.oneDayBadge}>
          <Text style={styles.oneDayText}>원데이 클래스 가능</Text>
        </View>
      )}
    </View>
  </View>
);

const SearchScreen = () => {
  const [trainers, setTrainers] = useState<TrainerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (!refreshing) {
      fetchRecommendedTrainers();
    }
  }, [userLocation, page]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (err) {
      console.error('Error getting location:', err);
    }
  };

  const fetchRecommendedTrainers = async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await getRecommendedTrainers({
        myLatitude: userLocation?.latitude,
        myLongitude: userLocation?.longitude,
        page,
        size: 10,
      });

      if (page === 0) {
        setTrainers(result.content);
      } else {
        setTrainers(prev => [...prev, ...result.content]);
      }

      setHasMore(!result.last);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '트레이너 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      
      if (errorMessage.includes('인증')) {
        Alert.alert('인증 오류', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    fetchRecommendedTrainers();
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#004AAD" />
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopHeader />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopHeader />
      <View style={styles.container}>
        <FlatList
          data={trainers}
          renderItem={({ item }) => <TrainerCard trainer={item} />}
          keyExtractor={item => item.trainer_id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>추천 트레이너가 없습니다.</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cardContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    gap: 8,
  },
  intro: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  experience: {
    fontSize: 14,
    color: '#666',
  },
  availableHours: {
    fontSize: 14,
    color: '#666',
  },
  oneDayBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  oneDayText: {
    color: '#004AAD',
    fontSize: 12,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#004AAD',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default SearchScreen;