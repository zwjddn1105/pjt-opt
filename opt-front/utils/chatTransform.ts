// utils/chatTransform.ts
import { ApiChatRoom, ApiChatMessage, ChatRoom, ChatMessage } from '../types/chat';

export const transformApiChatRoom = (apiRoom: ApiChatRoom, currentUserId: number): ChatRoom => {
  const otherUserId = apiRoom.participants.find(id => id !== currentUserId);
  
  return {
    id: apiRoom.id,
    name: `User ${otherUserId}`,
    lastMessage: '',
    time: new Date().toISOString(),
    userType: 'USER',
    unreadCount: 0
  };
};

export const transformApiChatMessage = (apiMessage: ApiChatMessage): ChatMessage => {
  return {
    id: apiMessage.id,
    roomId: apiMessage.roomId,
    senderId: apiMessage.senderId.toString(),
    content: apiMessage.content,
    timestamp: apiMessage.createdAt,
    messageType: apiMessage.senderId === 0 ? 'SYSTEM' : 'CHAT'
  };
};