import { View, Text, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    Alert.alert('완료', '모든 데이터가 초기화되었습니다.');
  } catch (error) {
    console.error('Failed to clear storage:', error);
    Alert.alert('오류', '초기화 중 문제가 발생했습니다.');
  }
};

export const ChallengeScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>챌린지 화면 ⚙️</Text>
      <TouchableOpacity onPress={clearStorage}>
        <Text>초기화</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChallengeScreen;