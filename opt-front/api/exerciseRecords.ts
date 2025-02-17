import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const API_URL = 'https://i12a309.p.ssafy.io';

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

    const url = `${API_URL}/exercise-records`;
    console.log('Request URL:', url);

    // 모든 플랫폼에서 Content-Type 헤더 제거 (FormData가 자동으로 설정)
    const headers: any = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${responseText}`);
    }

    if (!responseText) {
      throw new Error('Empty response from server');
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Invalid JSON response from server');
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
