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
    const loadAuthInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Loading token from storage:', token ? `${token.substring(0, 10)}...` : 'null');
        
        if (token) {
          setAccessToken(token);
          const storedUserId = await AsyncStorage.getItem('userId');
          const storedUserType = await AsyncStorage.getItem('userType') as 'USER' | 'TRAINER' | null;
          
          setUserId(storedUserId);
          setUserType(storedUserType);
          console.log('Auth info loaded successfully');
        } else {
          console.log('No token found in storage');
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
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', id);
      await AsyncStorage.setItem('userType', type);
      
      console.log('Setting token in state:', token.substring(0, 10) + '...');
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
      await AsyncStorage.multiRemove(['token', 'userId', 'userType']);
      setAccessToken(null);
      setUserId(null);
      setUserType(null);
    } catch (error) {
      console.error('Failed to remove auth info:', error);
      throw error;
    }
  };

  const value = {
    accessToken,
    userId,
    userType,
    login,
    logout
  };

  console.log('AuthContext current value:', { 
    hasAccessToken: !!accessToken,
    hasUserId: !!userId,
    userType 
  });

  return (
    <AuthContext.Provider value={value}>
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