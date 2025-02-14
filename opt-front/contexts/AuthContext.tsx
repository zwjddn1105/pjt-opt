// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  accessToken: string | null;
  userId: string | null;
  userType: 'USER' | 'TRAINER' | null;
  login: (token: string, id: string, type: 'USER' | 'TRAINER') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<'USER' | 'TRAINER' | null>(null);

  useEffect(() => {
    // 앱 시작 시 저장된 인증 정보 로드
    const loadAuthInfo = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('accessToken');
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedUserType = await AsyncStorage.getItem('userType') as 'USER' | 'TRAINER' | null;
        
        if (storedToken && storedUserId && storedUserType) {
          setAccessToken(storedToken);
          setUserId(storedUserId);
          setUserType(storedUserType);
        }
      } catch (error) {
        console.error('Failed to load auth info:', error);
      }
    };

    loadAuthInfo();
  }, []);

  const login = async (
    token: string, 
    id: string, 
    type: 'USER' | 'TRAINER'
  ) => {
    try {
      await AsyncStorage.setItem('accessToken', token);
      await AsyncStorage.setItem('userId', id);
      await AsyncStorage.setItem('userType', type);
      
      setAccessToken(token);
      setUserId(id);
      setUserType(type);
    } catch (error) {
      console.error('Failed to save auth info:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'userId', 'userType']);
      
      setAccessToken(null);
      setUserId(null);
      setUserType(null);
    } catch (error) {
      console.error('Failed to remove auth info:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      accessToken, 
      userId, 
      userType,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};