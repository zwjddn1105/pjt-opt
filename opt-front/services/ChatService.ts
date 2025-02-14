import { Client } from '@stomp/stompjs';

class ChatService {
  private client: Client | null = null;
  private subscriptions: Map<number, any> = new Map();

  isConnected(): boolean {
    return this.client?.connected || false;
  }

  async connect(token: string): Promise<void> {
    if (this.client?.connected) return;

    this.client = new Client({
      brokerURL: 'wss://i12a309.p.ssafy.io/ws-chat',
      connectHeaders: { Authorization: `Bearer ${token}` },
      webSocketFactory: () => new WebSocket('wss://i12a309.p.ssafy.io/ws-chat'),
    });

    return new Promise((resolve, reject) => {
      if (!this.client) return reject('Client not initialized');

      this.client.onConnect = () => {
        console.log('Connected to WebSocket');
        resolve();
      };

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client?.connected) {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
    }
  }

  subscribeToRoom(roomId: number, callback: (message: any) => void): void {
    if (!this.client?.connected) return;
    if (this.subscriptions.has(roomId)) return;

    const subscription = this.client.subscribe(`/topic/chat/room/${roomId}`, message => {
      const parsedMessage = JSON.parse(message.body);
      callback(parsedMessage);
    });

    this.subscriptions.set(roomId, subscription);
  }

  unsubscribeFromRoom(roomId: number): void {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
    }
  }

  sendMessage(roomId: number, message: string): void {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: `/app/chat/message`,
      body: JSON.stringify({ roomId, message }),
    });
  }
}

export default new ChatService();
