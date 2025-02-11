import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import PlusButton from '../components/PlusButton';
import ExerciseModal from '../components/ExerciseModal';

interface ExerciseRecord {
  id: string;
  exerciseId: string;
  date: string;
  minutes: number;
  sets: number;
  weight: number;
  reps: number;
}

interface Exercise {
  id: string;
  name: string;
  isFavorite: boolean;
  imageSource: any;
}

interface FoodRecord {
  id: string;
  date: string;
  calories: string;
  imageUri: string | null;
}

type RootStackParamList = {
  Main: undefined;
  Food: { date: string };
};

export const CalendarScreen = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);
  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadExercises = async () => {
    try {
      const exercisesData = [
        { id: '1', name: '바벨 백스쿼트', isFavorite: false, imageSource: null },
        { id: '2', name: '프론트 스쿼트', isFavorite: false, imageSource: null },
        { id: '3', name: '저처 스쿼트', isFavorite: false, imageSource: null },
        { id: '4', name: '바벨 불가리안 스플릿 스쿼트', isFavorite: false, imageSource: null },
        { id: '5', name: '덤벨 불가리안 스플릿 스쿼트', isFavorite: false, imageSource: null },
      ];
      setExercises(exercisesData);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const loadRecords = async () => {
    try {
      const records = await AsyncStorage.getItem('exerciseRecords');
      if (records) {
        setExerciseRecords(JSON.parse(records));
      }
    } catch (error) {
      console.error('Failed to load exercise records:', error);
    }
  };

  const loadFoodRecords = async () => {
    try {
      const records = await AsyncStorage.getItem('foodRecords');
      if (records) {
        setFoodRecords(JSON.parse(records));
      }
    } catch (error) {
      console.error('Failed to load food records:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadExercises();
      loadRecords();
      loadFoodRecords();
    }, [])
  );

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    return exercise ? exercise.name : '알 수 없는 운동';
  };

  const handleFoodButtonPress = () => {
    navigation.navigate('Food', { date: selectedDate });
  };

  const handleDeleteRecord = async (recordToDelete: ExerciseRecord) => {
    Alert.alert(
      "운동 기록 삭제",
      "이 운동 기록을 삭제하시겠습니까?",
      [
        { text: "취소" },
        {
          text: "삭제",
          onPress: async () => {
            try {
              // 날짜와 exerciseId로 정확히 비교
              const updatedRecords = exerciseRecords.filter(
                record => !(
                  new Date(record.date).toISOString().split('T')[0] === new Date(recordToDelete.date).toISOString().split('T')[0] &&
                  record.exerciseId === recordToDelete.exerciseId
                )
              );
              await AsyncStorage.setItem('exerciseRecords', JSON.stringify(updatedRecords));
              setExerciseRecords(updatedRecords);
            } catch (error) {
              console.error('Failed to delete exercise record:', error);
              Alert.alert("오류", "삭제 중 문제가 발생했습니다.");
            }
          }
        }
      ]
    );
  };

  const filteredRecords = exerciseRecords.filter(record => {
    const recordDate = record.date;  // date가 이미 YYYY-MM-DD 형식으로 저장되어 있음
    return recordDate === selectedDate;
  });

  const renderExerciseRecords = () => {
    if (filteredRecords.length === 0) {
      return (
        <View style={styles.spacer}>
          <Text style={styles.spacerText}>현재 기록된 운동 기록이 없습니다.</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.recordsContainer}>
        {filteredRecords.map((record, index) => (
          <View key={`${record.exerciseId}-${index}`} style={styles.recordItem}>
            <View style={styles.recordHeader}>
              <Text style={styles.exerciseName}>
                {getExerciseName(record.exerciseId)}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteRecord(record);
                }}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FF0000" />
              </TouchableOpacity>
            </View>
            <View style={styles.recordDetails}>
              <Text style={styles.recordText}>
                {record.minutes}분
                {record.sets ? ` · ${record.sets}세트` : ''}
                {record.weight ? ` · ${record.weight}kg` : ''}
                {record.reps ? ` · ${record.reps}회` : ''}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  const renderFoodRecords = () => {
    const filteredFoodRecords = foodRecords.filter(record => record.date === selectedDate);

    if (filteredFoodRecords.length === 0) {
      return (
        <View style={styles.spacer}>
          <Text style={styles.spacerText}>현재 기록된 식단 기록이 없습니다.</Text>
        </View>
      );
    }

    return (
      <View style={styles.recordsContainer}>
        {filteredFoodRecords.map((record) => (
          <View key={record.id} style={styles.recordItem}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordText}>{record.calories} kcal</Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  // 삭제 기능 구현 필요
                }}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FF0000" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    // 운동 기록이 있는 날짜에 파란색 점 추가
    exerciseRecords.forEach(record => {
      const date = record.date;
      if (!marked[date]) {
        marked[date] = { dots: [] };
      }
      
      if (!marked[date].dots.some((dot: any) => dot.key === 'exercise')) {
        marked[date].dots.push({ 
          key: 'exercise', 
          color: '#007AFF',  // 운동은 파란색 유지
          selectedDotColor: 'white' 
        });
      }
    });
  
    // 식단 기록이 있는 날짜에 보라색 점 추가
    foodRecords.forEach(record => {
      const date = record.date;
      if (!marked[date]) {
        marked[date] = { dots: [] };
      }
      
      if (!marked[date].dots.some((dot: any) => dot.key === 'meal')) {
        marked[date].dots.push({ 
          key: 'meal', 
          color: '#8E44AD',  // 식단은 보라색으로 변경
          selectedDotColor: 'white' 
        });
      }
    });
  
    // 선택된 날짜 표시 (dots 유지하면서)
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#007AFF',
      };
    }
  
    return marked;
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.calendarContainer}>
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        markingType="multi-dot"
        theme={{
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: 'white',
          todayTextColor: '#007AFF',
          textDayFontWeight: '400',
          dotStyle: {
            width: 6,
            height: 6,
            marginTop: 2,
            marginBottom: 2,
            borderRadius: 3,
          },
          'stylesheet.calendar.main': {
            container: {
              paddingRight: 40,
            },
            week: {
              marginTop: 10,
              marginBottom: 7,
              flexDirection: 'row',
              justifyContent: 'space-around',
            }
          }
        }}
        initialDate={today}
      />
      </View>
      {selectedDate ? (
        <View>
          <View style={styles.divider} />
          <Text style={styles.dateText}>{selectedDate}</Text>
          {renderExerciseRecords()}
          <View style={styles.buttonWrapper}>
            <PlusButton onPress={() => setModalVisible(true)} />
          </View>
          <View style={styles.secondDivider} />
          {renderFoodRecords()}
          <View style={styles.buttonWrapper}>
            <PlusButton onPress={handleFoodButtonPress} />
          </View>
        </View>
      ) : null}

      <ExerciseModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={loadRecords}  // 저장 시 기록 다시 로드
        selectedDate={selectedDate}  // 선택된 날짜 전달
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  calendarContainer: {
    paddingTop: 50,
  },
  dateText: {
    fontSize: 18,
    textAlign: 'left',
    marginTop: -15,
    marginLeft: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 30,
    marginHorizontal: 20,
  },
  spacer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacerText: {
    fontSize: 14,
    color: '#666',
  },
  secondDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 40,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  recordsContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  recordItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDetails: {
    marginTop: 4,
  },
  recordText: {
    fontSize: 14,
    color: '#666',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 5,
  },
  setsContainer: {
    marginLeft: 10,
  },
  setText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});

export default CalendarScreen;