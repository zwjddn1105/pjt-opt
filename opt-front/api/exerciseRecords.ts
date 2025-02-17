import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_BASE_URL } from "@env";

// Response Types
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

export interface Media {
  id: number;
  type: string;
  path: string;
  createdAt: string | null;
}

// Request Types
export interface CreateExerciseRecordRequest {
  exerciseId: number;
  set: number;
  rep: number;
  weight: number;
  duration?: number | null;
  distance?: number | null;
}

export interface UpdateExerciseRecordRequest {
  exerciseRecordId: number;
  set: number;
  rep: number;
  weight: number;
  duration?: number | null;
  distance?: number | null;
  mediaIdsToDelete?: number[];
}

// API Functions
export const fetchExerciseRecords = async (date: string): Promise<ExerciseRecord[]> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token found');

    const formattedDate = date.replace(/-/g, '');
    const url = `${EXPO_PUBLIC_BASE_URL}/exercise-records?date=${formattedDate}`;

    console.log('Fetching exercise records:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', response.status, errorText);
      throw new Error(`Failed to fetch exercise records: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in fetchExerciseRecords:', error);
    throw error;
  }
};

export const createExerciseRecord = async (formData: FormData): Promise<ExerciseRecord> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token found');

    console.log('Creating exercise record...');

    const response = await fetch(`${EXPO_PUBLIC_BASE_URL}/exercise-records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        // 이 부분을 추가하세요
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Server response:', response.status, responseText);
      throw new Error(`Server error: ${response.status} ${responseText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createExerciseRecord:', error);
    throw error;
  }
};

export const deleteExerciseRecord = async (id: number): Promise<void> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token found');

    console.log('Deleting exercise record:', id);

    const response = await fetch(`${EXPO_PUBLIC_BASE_URL}/exercise-records/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json'
      },
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Delete error response:', responseText);
      throw new Error(`Failed to delete exercise record: ${responseText}`);
    }
  } catch (error) {
    console.error('Error in deleteExerciseRecord:', error);
    throw error;
  }
};

export const updateExerciseRecord = async (id: number, formData: FormData): Promise<void> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token found');

    console.log('Updating exercise record:', id);

    const response = await fetch(`${EXPO_PUBLIC_BASE_URL}/exercise-records/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'multipart/form-data'  // 이 부분을 추가하세요
      },
      body: formData,
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Update error response:', responseText);
      throw new Error(`Failed to update exercise record: ${responseText}`);
    }
  } catch (error) {
    console.error('Error in updateExerciseRecord:', error);
    throw error;
  }
};