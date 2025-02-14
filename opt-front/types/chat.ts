// types/chat.ts
export interface PaginatedResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface User {
  id: number;
  email: string;
}

export interface ApiChatRoom {
  id: string;  // UUID 형식으로 변경
  participants: number[];
  roomName: string | null;
}

export interface ChatRoom {
  id: string;  // number에서 string으로 변경
  name: string;
  lastMessage: string;
  time: string;
  userType?: 'USER' | 'TRAINER';
  unreadCount: number;
}
