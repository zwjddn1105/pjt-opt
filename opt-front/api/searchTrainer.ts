import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_BASE_URL } from '@env';

export interface TrainerResponse {
  keywords: string[];
  averageRating: number;
  reviewCount: number;
  menus: {
    id: number;
    name: string;
    trainerId: number;
    price: number;
    totalSessions: number;
  }[];
  trainer_id: number;
  intro: string;
  experienceYears: number;
  availableHours: string;
  trainerProfileImage: string;
  gymName: string;
  gymAddress: string;
  oneDayAvailable: boolean;
}

interface SearchTrainerRequest {
  myLatitude?: number | null;
  myLongitude?: number | null;
  name?: string | null;
  address?: string | null;
  interests?: string[] | null;
  sortBy?: string | null;
  page?: number;
  size?: number;
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

type RequestBodyType = {
  [K in keyof SearchTrainerRequest]: SearchTrainerRequest[K];
};

const handleApiResponse = async (response: Response) => {
  const responseText = await response.text();
  
  try {
    // Try to parse error response if exists
    const data = JSON.parse(responseText);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      // Use server error message if available
      const errorMessage = data.message || data.error || '트레이너 목록을 불러오는데 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (e) {
    if (e instanceof SyntaxError) {
      // JSON parse error
      console.error('Invalid JSON response:', responseText);
      throw new Error('서버 응답을 처리하는데 실패했습니다.');
    }
    throw e;
  }
};

export const getRecommendedTrainers = async (
  params: SearchTrainerRequest = { page: 0, size: 10 }
): Promise<PageResponse<TrainerResponse>> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');
    }

    const response = await fetch(
      `${EXPO_PUBLIC_BASE_URL}/trainers/recommends?page=${params.page}&size=${params.size}&sort=descending`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          myLatitude: params.myLatitude,
          myLongitude: params.myLongitude,
        }),
      }
    );

    return handleApiResponse(response);
  } catch (error) {
    console.error('API Error details:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.');
  }
};

export const searchTrainers = async (
  params: SearchTrainerRequest = { page: 0, size: 10 }
): Promise<PageResponse<TrainerResponse>> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');
    }

    // 모든 필드를 포함한 요청 본문 생성 (null이라도 포함)
    const requestBody = {
      myLatitude: params.myLatitude ?? null,
      myLongitude: params.myLongitude ?? null,
      name: params.name ?? null,
      address: params.address ?? null,
      interests: params.interests ?? null,
      sortBy: params.sortBy ?? 'recommendation',  // 기본값을 'recommendation'으로 설정
      page: params.page ?? 0,
      size: params.size ?? 10
    };

    console.log('Complete Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${EXPO_PUBLIC_BASE_URL}/trainers/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Body:', responseText);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.message || errorData.error || '트레이너 목록을 불러오는데 실패했습니다.');
      } catch (e) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('Response parsing error:', e);
      throw new Error('서버 응답을 처리하는데 실패했습니다.');
    }
  } catch (error) {
    console.error('API Error details:', error);
    throw error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.');
  }
};