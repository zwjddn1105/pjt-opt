import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const API_URL = 'http://70.12.246.176:8080';

// API 응답 타입
export interface Media {
  id: number;
  type: string;
  path: string;
  createdAt: string | null;
}

// 선택된 미디어 타입
export interface SelectedMedia {
  uri: string;
  type: 'image' | 'video';
  fileName?: string;
}

// GET 응답에서 사용되는 타입
export interface ExerciseRecord {
  id: number;
  exerciseId: number;
  exerciseName: string;
  exerciseImage: string | null;
  medias: Media[];
  sets: number;
  rep: number;
  weight: number;
  duration: number | null;
  distance: number | null;
}

// POST 요청에서 사용되는 타입
export interface CreateExerciseRecordRequest {
  data: {
    exerciseId: number;
    set: number;
    rep: number;
    weight: number;
  };
  medias?: SelectedMedia[];
}

// PATCH 요청에서 사용되는 타입
export interface UpdateExerciseRecordRequest {
  data: {
    exerciseRecordId: number;
    set: number;
    rep: number;
    weight: number;
    mediaIdsToDelete?: number[];
  };
  medias?: SelectedMedia[];
}

// 운동 기록 조회
export const fetchExerciseRecords = async (date: string): Promise<ExerciseRecord[]> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const formattedDate = date.replace(/-/g, ''); // YYYY-MM-DD를 YYYYMMDD로 변환

    const response = await fetch(`${API_URL}/exercise-records?date=${formattedDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch exercise records');

    return await response.json();
  } catch (error) {
    console.error('Error fetching exercise records:', error);
    throw error;
  }
};

// 운동 기록 생성
export const createExerciseRecord = async (formData: FormData): Promise<ExerciseRecord> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    // 요청 URL 확인
    const url = `${API_URL}/exercise-records`;
    console.log('Making request to:', url);

    // 헤더 설정
    const headers: any = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };

    // Android에서는 Content-Type 설정
    if (Platform.OS === 'android') {
      headers['Content-Type'] = 'multipart/form-data';
    }

    try {
      // fetch 요청
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const responseText = await response.text();
      console.log('Response:', response.status, responseText);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${responseText}`);
      }

      // 빈 응답이 아닌 경우에만 JSON 파싱
      return responseText ? JSON.parse(responseText) : null;

    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          // Android 에뮬레이터에서 발생할 수 있는 네트워크 문제 해결 방법 제시
          console.error('Network error. Please check:');
          console.error('1. AndroidManifest.xml has INTERNET permission');
          console.error('2. App allows cleartext traffic if using http');
          console.error('3. Using correct IP address for emulator');
          
          Alert.alert(
            '네트워크 오류',
            '서버 연결에 실패했습니다. 다음을 확인해주세요:\n\n' +
            '1. 서버가 실행 중인지 확인\n' +
            '2. IP 주소가 올바른지 확인\n' +
            '3. 에뮬레이터 네트워크 설정 확인'
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in createExerciseRecord:', error);
    throw error;
  }
};

// 운동 기록 삭제
export const deleteExerciseRecord = async (id: number): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/exercise-records/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Failed to delete exercise record: ${response.status} ${responseText}`);
    }
  } catch (error) {
    console.error('Error deleting exercise record:', error);
    throw error;
  }
};

// 운동 기록 수정
export const updateExerciseRecord = async (id: number, formData: FormData): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/exercise-records/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Failed to update exercise record: ${response.status} ${responseText}`);
    }
  } catch (error) {
    console.error('Error updating exercise record:', error);
    throw error;
  }
};
