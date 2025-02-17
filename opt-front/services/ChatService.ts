// services/ChatService.ts
import { Client } from '@stomp/stompjs';
import { Message, ApiMessage } from '../types/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

class ChatService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();
  private messageQueue: Map<string, { content: string; retries: number }> = new Map();
  private reconnectAttempts: number = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RECONNECT_INTERVAL = 5000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageCache: Map<string, Message[]> = new Map();

  public getCachedMessages(roomId: string): Message[] {
    return this.messageCache.get(roomId) || [];
  }
  
  public setCachedMessages(roomId: string, messages: Message[]) {
    this.messageCache.set(roomId, messages);
  }

  // 읽음 상태 관리
  private readTimestamps: Map<string, string> = new Map(); // roomId -> timestamp

  constructor() {
    // 알림 설정 초기화
    if (Platform.OS !== 'web') {
      this.initializeNotifications();
    }
  }

  private async initializeNotifications() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('알림 권한이 거부되었습니다.');
      return;
    }

    // 알림 핸들러 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }

  async connect(token: string): Promise<boolean> {
    if (this.client?.connected) {
      console.log('Already connected');
      return true;
    }
  
    this.client = new Client({
      brokerURL: 'wss://i12a309.p.ssafy.io/ws-chat',
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        'accept-version': '1.1',
        'heart-beat': '0,0'
      },
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
      }
    });
  
    return new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        console.log('Connection timeout');
        reject(new Error('Connection timeout'));
      }, 5000);
  
      this.client!.onConnect = (frame) => {
        clearTimeout(connectionTimeout);
        console.log('Connected, frame:', frame);
        resolve(true);
      };
  
      this.client!.onStompError = (frame) => {
        clearTimeout(connectionTimeout);
        console.error('STOMP Error:', frame);
        reject(new Error(`STOMP error: ${frame.headers.message}`));
      };
  
      try {
        console.log('Activating client with headers:', this.client!.connectHeaders);
        this.client!.activate();
      } catch (error) {
        clearTimeout(connectionTimeout);
        console.error('Activation error:', error);
        reject(error);
      }
    });
  }

  private async handleConnectionError(error: string, token: string) {
    if (this.reconnectAttempts < 5) {
      this.reconnectAttempts++;
      console.log(`재연결 시도 ${this.reconnectAttempts}/5...`);
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect(token);
      }, this.RECONNECT_INTERVAL);
    } else {
      console.error('최대 재연결 시도 횟수 초과');
    }
  }

  private handleDisconnection(token: string) {
    this.handleConnectionError('연결 끊김', token);
  }

  disconnect(): void {
    if (this.client?.connected) {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }

  async subscribeToRoom(roomId: string, callback: (message: Message) => void) {
    if (!this.client?.connected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }
  
    // 기존 구독이 있더라도, 실제로 활성화된 상태인지 확인
    const existingSubscription = this.subscriptions.get(roomId);
    if (existingSubscription) {
      try {
        // 구독 상태 확인을 위한 더미 메시지 전송
        existingSubscription.send("");
        console.log(`Existing subscription for room ${roomId} is active`);
        return;
      } catch (e) {
        // 구독이 비활성 상태면 제거
        console.log(`Removing inactive subscription for room ${roomId}`);
        this.subscriptions.delete(roomId);
      }
    }
  
    console.log(`Creating new subscription for room: ${roomId}`);
    return new Promise<void>((resolve) => {
      // this.client는 null이 아님이 보장됨 (위에서 체크했으므로)
      const client = this.client!;
      const subscription = client.subscribe(
        `/topic/chat-room/${roomId}`,
        message => {
          try {
            console.log('Received WebSocket message:', message.body);
            const apiMessage = JSON.parse(message.body) as ApiMessage;
            
            const convertedMessage: Message = {
              id: apiMessage.id,
              roomId: apiMessage.roomId,
              senderId: apiMessage.senderId.toString(),
              receiverId: apiMessage.receiverId.toString(),
              content: apiMessage.content,
              timestamp: apiMessage.createdAt,
              messageType: apiMessage.messageType
            };
    
            console.log('Converted message:', convertedMessage);
            callback(convertedMessage);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        },
        {
          id: `room-${roomId}`,
          Authorization: client.connectHeaders.Authorization
        }
      );
    
      this.subscriptions.set(roomId, subscription);
      console.log(`Successfully subscribed to room: ${roomId}`);
      resolve();
    });
  }

  private convertApiMessage(apiMessage: ApiMessage): Message {
    return {
      id: apiMessage.id,
      roomId: apiMessage.roomId,
      senderId: apiMessage.senderId.toString(),
      receiverId: apiMessage.receiverId.toString(),
      content: apiMessage.content,
      timestamp: apiMessage.createdAt,
      messageType: apiMessage.senderId === 0 ? 'SYSTEM' : 'CHAT'
    };
  }

  private async showNotificationIfNeeded(message: ApiMessage) {
    const isBackground = await AsyncStorage.getItem('isBackground') === 'true';
    const currentUserId = await AsyncStorage.getItem('userId');
    
    if (isBackground && message.senderId.toString() !== currentUserId) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '새 메시지',
          body: message.content,
          data: { roomId: message.roomId },
        },
        trigger: null,
      });
    }
  }

  unsubscribeFromRoom(roomId: string): void {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      console.log(`Unsubscribing from room: ${roomId}`);
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
    }
  }

  sendMessage(roomId: string, content: string, token: string): boolean {
    if (!this.client?.connected) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }
  
    try {
      this.client.publish({
        destination: `/app/chat-room/${roomId}`,  // 발행 경로 수정
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roomId, content })
      });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  private async processMessageQueue() {
    if (!this.client?.connected) return;

    for (const [messageId, { content, retries }] of this.messageQueue.entries()) {
      if (retries >= this.MAX_RETRIES) {
        this.messageQueue.delete(messageId);
        continue;
      }

      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) continue;

        this.client.publish({
          destination: `/app/chat/message`,
          body: content,
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.messageQueue.delete(messageId);
      } catch (error) {
        this.messageQueue.set(messageId, { content, retries: retries + 1 });
      }
    }
  }

  // 읽음 처리 관련 메서드
  async markMessageAsRead(roomId: string) {
    const timestamp = new Date().toISOString();
    this.readTimestamps.set(roomId, timestamp);
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // 서버에 읽음 상태 전송
      await fetch(`https://i12a309.p.ssafy.io/chat-rooms/read/${roomId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ timestamp })
      });
    } catch (error) {
      console.error('읽음 처리 에러:', error);
    }
  }

  async getUnreadCount(roomId: string): Promise<number> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return 0;

      const response = await fetch(`https://i12a309.p.ssafy.io/chat-rooms/unread/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      return data.unreadCount || 0;
    } catch (error) {
      console.error('읽지 않은 메시지 수 조회 에러:', error);
      return 0;
    }
  }
}

export default new ChatService();