import { create } from 'zustand';
import { ChatRoom, ChatMessage } from '../types/chat';

interface ChatStore {
  rooms: Record<string, ChatRoom>;
  messages: Record<string, Record<string, ChatMessage>>;
  roomIds: string[];
  currentRoomId: string | null;
  
  addRoom: (room: ChatRoom) => void;
  addMessage: (message: ChatMessage) => void;
  clearRooms: () => void;  // 추가
}

export const useChatStore = create<ChatStore>((set, get) => ({
  rooms: {},
  messages: {},
  roomIds: [],
  currentRoomId: null,

  addRoom: (room) => set(state => {
    // 이미 존재하는 방이면 업데이트하지 않음
    if (state.rooms[room.id]) {
      return state;
    }

    return {
      rooms: { ...state.rooms, [room.id]: room },
      roomIds: [...state.roomIds, room.id],
    };
  }),

  addMessage: (message) => set(state => {
    const { roomId } = message;
    if (!state.messages[roomId]) state.messages[roomId] = {};

    return {
      messages: {
        ...state.messages,
        [roomId]: { ...state.messages[roomId], [message.id]: message },
      },
    };
  }),

  clearRooms: () => set({
    rooms: {},
    roomIds: [],
    currentRoomId: null
  }),
}));