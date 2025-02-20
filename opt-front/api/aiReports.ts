import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_BASE_URL } from "@env";

export const fetchAIReport = async (year: number, month: number, weekNumber: number): Promise<string> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    // Log request parameters for debugging
    console.log('Fetching AI report with params:', { year, month, weekNumber });
    console.log('API URL:', `${EXPO_PUBLIC_BASE_URL}/ai-report`);

    const response = await fetch(
      `${EXPO_PUBLIC_BASE_URL}/ai-reports?year=${year}&month=${month}&weekNumber=${weekNumber}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Log response status and headers for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      // Try to get error details from response
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.message || errorData.error || '';
      } catch (e) {
        errorDetail = await response.text();
      }
      
      throw new Error(`Failed to fetch AI report: ${response.status} ${errorDetail}`);
    }

    const data = await response.text();
    if (!data) {
      throw new Error('Empty response received from server');
    }

    return data;

  } catch (error) {
    // Add more context to the error
    const enhancedError = error instanceof Error 
      ? error 
      : new Error('Unknown error occurred while fetching AI report');
    
    console.error('Detailed error in fetchAIReport:', {
      message: enhancedError.message,
      stack: enhancedError.stack,
      cause: error
    });
    
    throw enhancedError;
  }
};