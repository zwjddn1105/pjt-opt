import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, Animated, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Exercise {
  id: string;
  name: string;
  isFavorite: boolean;
  imageSource: any;
}

interface ExerciseSet {
  weight: string;
  reps: string;
}

interface ExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: () => void;
  selectedDate: string;
}

interface ExerciseRecordFormProps {
  exercise: Exercise;
  onBack: () => void;
  onClose: () => void;
  onSave?: () => void;
  selectedDate: string;
}

const ExerciseRecordForm = ({ exercise, onBack, onClose, onSave, selectedDate }: ExerciseRecordFormProps) => {
  const [minutes, setMinutes] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [weight, setWeight] = useState('');

  const handleNumberInput = (value: string, setter: (value: string) => void) => {
    // 숫자만 허용하는 정규식
    const numbersOnly = value.replace(/[^0-9]/g, '');
    setter(numbersOnly);
  };

  // 저장 버튼 활성화 여부 확인
  const isSaveEnabled = minutes.length > 0;

  const handleSave = async () => {
    if (!minutes) return; // 운동 시간이 없으면 저장하지 않음

    try {
      const record = {
        id: Date.now().toString(),
        exerciseId: exercise.id,
        date: selectedDate,
        minutes: parseInt(minutes) || 0,
        reps: parseInt(reps) || 0,
        sets: parseInt(sets) || 0,
        weight: parseInt(weight) || 0,
      };

      const existingRecords = await AsyncStorage.getItem('exerciseRecords');
      const records = existingRecords ? JSON.parse(existingRecords) : [];
      records.push(record);

      await AsyncStorage.setItem('exerciseRecords', JSON.stringify(records));
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Failed to save exercise record:', error);
    }
  };

  return (
    <View style={styles.modalContent}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exercise.name}</Text>
        <Text style={styles.headerDate}>{selectedDate}</Text>
      </View>

      <View style={styles.videoPlaceholder} />

      <Text style={styles.guideTitle}>운동 가이드</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="운동 시간을 입력하세요"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={minutes}
          onChangeText={(value) => handleNumberInput(value, setMinutes)}
        />
        <View style={styles.unitContainer}>
          <Text style={styles.inputUnit}>분</Text>
          <Text style={styles.requiredMark}>*</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="세트 수를 입력하세요"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={sets}
          onChangeText={(value) => handleNumberInput(value, setSets)}
        />
        <Text style={styles.inputUnit}>세트</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="무게를 입력하세요."
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={weight}
          onChangeText={(value) => handleNumberInput(value, setWeight)}
        />
        <Text style={styles.inputUnit}>kg</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="운동 횟수를 입력하세요."
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={reps}
          onChangeText={(value) => handleNumberInput(value, setReps)}
        />
        <Text style={styles.inputUnit}>횟수</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            !isSaveEnabled && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isSaveEnabled}
        >
          <Text style={[
            styles.saveButtonText,
            !isSaveEnabled && styles.saveButtonTextDisabled
          ]}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ExerciseModal = ({ visible, onClose, onSave, selectedDate }: ExerciseModalProps) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: '바벨 백스쿼트', isFavorite: false, imageSource: null },
    { id: '2', name: '프론트 스쿼트', isFavorite: false, imageSource: null },
    { id: '3', name: '저처 스쿼트', isFavorite: false, imageSource: null },
    { id: '4', name: '바벨 불가리안 스플릿 스쿼트', isFavorite: false, imageSource: null },
    { id: '5', name: '덤벨 불가리안 스플릿 스쿼트', isFavorite: false, imageSource: null },
  ]);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setSelectedExercise(null);  // 모달이 닫힐 때 선택된 운동 초기화
    }
  }, [visible]);

  const loadFavorites = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favoriteIds = JSON.parse(favorites);
        setExercises(prev => prev.map(exercise => ({
          ...exercise,
          isFavorite: favoriteIds.includes(exercise.id)
        })));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const toggleFavorite = async (exerciseId: string) => {
    try {
      setExercises(prev => prev.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, isFavorite: !exercise.isFavorite }
          : exercise
      ));

      const updatedExercises = exercises.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, isFavorite: !exercise.isFavorite }
          : exercise
      );
      const favoriteIds = updatedExercises
        .filter(ex => ex.isFavorite)
        .map(ex => ex.id);
      await AsyncStorage.setItem('favorites', JSON.stringify(favoriteIds));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getFilteredExercises = () => {
    return exercises.filter(exercise => {
      if (activeTab === 'favorites' && !exercise.isFavorite) {
        return false;
      }
      return exercise.name.toLowerCase().includes(searchText.toLowerCase());
    });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [800, 0]
  });

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View style={[styles.modalView, { transform: [{ translateY }] }]}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContainer}
          >
            {selectedExercise ? (
              <ExerciseRecordForm
                exercise={selectedExercise}
                onBack={() => setSelectedExercise(null)}
                onClose={onClose}
                onSave={onSave}
                selectedDate={selectedDate}
              />
            ) : (
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity 
                    onPress={onClose} 
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="chevron-back" size={24} color="black" />
                  </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                  <TextInput 
                    style={styles.searchInput}
                    placeholder="찾으시는 운동을 검색해보세요."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </View>

                <View style={styles.tabContainer}>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
                    onPress={() => setActiveTab('favorites')}
                  >
                    <Ionicons 
                      name="star" 
                      size={20} 
                      color={activeTab === 'favorites' ? '#000' : '#666'} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}
                  >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                      전체
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.exerciseList}>
                  {getFilteredExercises().map(exercise => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.exerciseItem}
                      onPress={() => handleExerciseSelect(exercise)}
                    >
                      <View style={styles.exerciseInfo}>
                        {exercise.imageSource && (
                          <Image source={exercise.imageSource} style={styles.exerciseImage} />
                        )}
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleFavorite(exercise.id);
                        }}
                        style={styles.favoriteButton}
                      >
                        <Ionicons 
                          name={exercise.isFavorite ? "bookmark" : "bookmark-outline"} 
                          size={24} 
                          color={exercise.isFavorite ? "#000" : "#999"} 
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    width: '100%',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 80,  // 저장 버튼 높이만큼 여백 추가
  },
  modalHeader: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 15,
  },
  backButton: {
    width: 34,  // 아이콘 크기 + 패딩
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#e0e0e0',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '500',
  },
  exerciseList: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  exerciseName: {
    fontSize: 16,
  },
  favoriteButton: {
    padding: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  headerDate: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
  },
  formScrollView: {
    flex: 1,
  },
  setContainer: {
    marginBottom: 20,
  },
  setTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  setInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonContainer: {
    position: 'absolute',  // 절대 위치로 변경
    bottom: 0,            // 화면 맨 아래에 위치
    left: 0,
    right: 0,
    padding: 20,         // 좌우 여백
    backgroundColor: 'white',  // 배경색 설정
  },
  addButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#666',
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    marginBottom: 20,
    borderRadius: 10,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#004AAD',
    padding: 18,         // 버튼 높이 증가
    width: '100%',       // 너비를 최대로
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',  // 비활성화 시 회색으로 변경
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputUnit: {
    fontSize: 16,
    color: '#666',
    width: 40,  // width 줄임
  },
  requiredMark: {
    color: '#FF0000',
    fontSize: 16,
    marginLeft: -7,  // 간격 줄임
    marginTop: -10,
  },
});

export default ExerciseModal;