// api/chatApi.ts
import { ApiChatRoom, ApiChatMessage } from '../types/chat';

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
      
      // content 배열 반환
      return data.content;
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
      throw error;
    }
  },

  getChatMessages: async (roomId: number, accessToken: string): Promise<ApiChatMessage[]> => {
    try {
      const response = await fetch(`${BASE_URL}/chat-rooms/message?roomId=${roomId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  },

  createChatRoom: async (otherMemberId: number, accessToken: string): Promise<ApiChatRoom> => {
    try {
      const response = await fetch(`${BASE_URL}/chat-rooms/create?otherMemberId=${otherMemberId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to create chat room:', error);
      throw error;
    }
  },
};