// screens/chat/ChatScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatService from '../../services/ChatService';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { ChatErrorView } from '../../components/ChatErrorView';
import { ChatLoadingIndicator } from '../../components/ChatLoadingIndicator';

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  messageType: 'CHAT' | 'SYSTEM';
}

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface ChatScreenProps {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { roomId, otherUserName, otherUserType } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { accessToken, userId: currentUserId } = useAuth();

  const connectWebSocket = useCallback(async () => {
    if (!accessToken) {
      setError('인증 토큰이 없습니다. 다시 로그인해주세요.');
      return;
    }

    try {
      setError(null);
      await ChatService.connect(accessToken);
      setIsConnected(true);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setError('채팅 서버 연결에 실패했습니다.');
      setIsConnected(false);
    }
  }, [accessToken]);

  const loadPreviousMessages = useCallback(async () => {
    if (!accessToken) {
      setError('인증 토큰이 없습니다. 다시 로그인해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `https://i12a309.p.ssafy.io/chat-rooms/message?roomId=${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('서버 응답에 문제가 있습니다.');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('메시지를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, roomId]);

  useEffect(() => {
    connectWebSocket();
    loadPreviousMessages();

    // Cleanup
    return () => {
      ChatService.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (isConnected) {
      const subscription = ChatService.subscribeToRoom(roomId, (message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [isConnected, roomId]);

  const sendMessage = useCallback(() => {
    console.log('Send message attempted:', {
      hasMessage: Boolean(newMessage.trim()),
      isConnected,
      hasToken: Boolean(accessToken)
    });

    if (!newMessage.trim()) {
      console.log('Message is empty');
      return;
    }
    if (!isConnected) {
      console.log('WebSocket is not connected');
      return;
    }
    if (!accessToken) {
      console.log('No access token available');
      return;
    }

    const success = ChatService.sendMessage(roomId, newMessage, accessToken);
    if (success) {
      console.log('Message sent successfully');
      setNewMessage('');
    } else {
      console.log('Failed to send message');
      setError('메시지 전송에 실패했습니다.');
    }
  }, [newMessage, roomId, isConnected, accessToken]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === currentUserId;
    const isSystemMessage = item.messageType === 'SYSTEM';

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : null,
        isSystemMessage ? styles.systemMessageContainer : null,
      ]}>
        {!isOwnMessage && !isSystemMessage && (
          <Image
            source={{ uri: otherUserType === 'TRAINER' ? 'trainer-profile-image' : 'user-profile-image' }}
            style={styles.profileImage}
          />
        )}
        <View style={[
          styles.messageContent,
          isOwnMessage ? styles.ownMessageContent : null,
          isSystemMessage ? styles.systemMessageContent : null,
        ]}>
          <Text style={[
            styles.messageText,
            isSystemMessage ? styles.systemMessageText : null,
          ]}>
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{otherUserName}</Text>
          {!isConnected && (
            <Text style={styles.connectionStatus}>연결 중...</Text>
          )}
        </View>

        {isLoading ? (
          <ChatLoadingIndicator />
        ) : error ? (
          <ChatErrorView onRetry={() => {
            connectWebSocket();
            loadPreviousMessages();
          }} />
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            inverted
          />
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="메시지를 입력하세요"
              multiline
            />
            <View>
              {!isConnected && (
                <Text style={styles.connectionWarning}>연결 중...</Text>
              )}
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!newMessage.trim() || !isConnected || !accessToken}
                style={[
                  styles.sendButton,
                  (!newMessage.trim() || !isConnected || !accessToken) && styles.sendButtonDisabled,
                ]}
              >
                <Ionicons 
                  name="send" 
                  size={24} 
                  color={newMessage.trim() && isConnected && accessToken ? '#007AFF' : '#999'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  connectionWarning: {
    color: '#ff9500',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  connectionStatus: {
    marginLeft: 'auto',
    color: '#999',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    flexDirection: 'row-reverse',
  },
  systemMessageContainer: {
    justifyContent: 'center',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '70%',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    padding: 12,
  },
  ownMessageContent: {
    backgroundColor: '#007AFF',
  },
  systemMessageContent: {
    backgroundColor: '#eee',
    alignSelf: 'center',
    borderRadius: 12,
    padding: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  systemMessageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    padding: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;