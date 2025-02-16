// api/chatApi.ts
import { ApiChatRoom, ApiMessage, PaginatedResponse, CreateChatRoomResponse } from '../types/chat';

const BASE_URL = 'https://i12a309.p.ssafy.io';

export const chatApi = {
  getChatRooms: async (accessToken: string): Promise<ApiChatRoom[]> => {
    try {
      const response = await fetch(`${BASE_URL}/chat-rooms/list`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data: PaginatedResponse<ApiChatRoom> = await response.json();
      return data.content;
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
      throw error;
    }
  },

  getChatMessages: async (roomId: string, accessToken: string) => {
    try {
      const response = await fetch(`${BASE_URL}/chat-rooms/message?roomId=${roomId}`, {
        headers: { 
          Authorization: `Bearer ${accessToken}` 
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  },

  createChatRoom: async (otherMemberId: number, accessToken: string): Promise<CreateChatRoomResponse> => {
    try {
      console.log('Creating chat room with otherMemberId:', otherMemberId); // 디버깅용 로그
      
      const response = await fetch(`${BASE_URL}/chat-rooms/create?otherMemberId=${otherMemberId}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status); // 디버깅용 로그

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText); // 디버깅용 로그
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      console.log('Success response:', result); // 디버깅용 로그
      return result;
    } catch (error) {
      console.error('Failed to create chat room:', error);
      throw error;
    }
  },
};