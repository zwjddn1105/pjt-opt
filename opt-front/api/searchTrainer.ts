// api/searchTrainer.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_BASE_URL } from '@env';

export interface TrainerResponse {
  trainer_id: number;
  gymId: number;
  intro: string;
  experienceYears: number | null;
  availableHours: string | null;
  oneDayAvailable: boolean;
}

interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface TrainerSearchRequest {
  myLatitude?: number | null;
  myLongitude?: number | null;
  page?: number;
  size?: number;
}

export const getRecommendedTrainers = async (
  params: TrainerSearchRequest = { page: 0, size: 10 }
): Promise<PageResponse<TrainerResponse>> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');
    }

    const response = await fetch(`${EXPO_PUBLIC_BASE_URL}/trainers/recommends?page=${params.page}&size=${params.size}&sort=desending()`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        myLatitude: params.myLatitude,
        myLongitude: params.myLongitude,
      }),
    });

    const responseText = await response.text();
    console.log('Server response:', response.status, responseText);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error('트레이너 목록을 불러오는데 실패했습니다.');
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('API Error details:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.');
  }
};