// screens/chat/ChatScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { ApiMessage, Message } from '../../types/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface ChatScreenProps {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { roomId, otherUserName, otherUserType } = route.params;
  const { accessToken, userId: currentUserId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      console.log('Stored token in AsyncStorage:', storedToken ? `${storedToken.substring(0, 10)}...` : 'null');
      console.log('Token from AuthContext:', accessToken ? `${accessToken.substring(0, 10)}...` : 'null');
    };
    checkToken();
  }, [accessToken]);

  const connectWebSocket = useCallback(async () => {
    if (!accessToken) {
      setError('인증 토큰이 없습니다. 다시 로그인해주세요.');
      return;
    }

    try {
      setError(null);
      if (!ChatService.isConnected()) {
        await ChatService.connect(accessToken);
      }
      setIsConnected(true);

      // 연결 후 바로 구독 설정
      ChatService.subscribeToRoom(roomId, (newMessage) => {
        console.log('Received new message:', newMessage);
        setMessages(prevMessages => [...prevMessages, newMessage]);
        scrollToBottom();
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setError('채팅 서버 연결에 실패했습니다.');
      setIsConnected(false);
    }
  }, [accessToken, roomId]);

  const loadPreviousMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching messages for roomId:', roomId);
      console.log('Using accessToken:', accessToken?.substring(0, 10) + '...');
  
      const response = await fetch(
        `https://i12a309.p.ssafy.io/chat-rooms/message?roomId=${roomId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
  
      const responseText = await response.text();
      console.log('Raw response:', responseText);
  
      if (!response.ok) {
        console.error('Server error details:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
      }
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }
  
      console.log('Parsed response data:', data);
  
      // 페이지네이션 응답에서 content 배열 추출
      const messageArray = data.content;
      if (!Array.isArray(messageArray)) {
        console.error('Expected content to be array but got:', typeof messageArray);
        throw new Error('잘못된 응답 형식입니다.');
      }
  
      const convertedMessages: Message[] = messageArray.map((msg: ApiMessage) => ({
        id: msg.id,
        roomId: msg.roomId,
        senderId: msg.senderId.toString(),
        receiverId: msg.receiverId.toString(),
        content: msg.content,
        timestamp: msg.createdAt,
        messageType: 'CHAT'
      }));
  
      // 시간순으로 메시지 정렬 (오래된 순)
      const sortedMessages = convertedMessages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  
      setMessages(sortedMessages);
      
      // 메시지 설정 후 자동 스크롤
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
      
    } catch (error) {
      console.error('Message loading error details:', error);
      setError(error instanceof Error ? error.message : '메시지를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, roomId]);

  useEffect(() => {
    let isSubscribed = true;
  
    const initialize = async () => {
      try {
        if (isSubscribed) {
          await connectWebSocket();
          await loadPreviousMessages();
        }
      } catch (error) {
        console.error('초기화 중 오류:', error);
        if (isSubscribed) {
          setError('연결에 실패했습니다.');
        }
      }
    };
  
    initialize();
  
    return () => {
      isSubscribed = false;
      ChatService.unsubscribeFromRoom(roomId);
    };
  }, [roomId, connectWebSocket, loadPreviousMessages]);

  const sendMessage = useCallback(async () => {
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

    try {
      const success = await ChatService.sendMessage(roomId, newMessage, accessToken);
      if (success) {
        console.log('Message sent successfully');
        setNewMessage('');
      } else {
        console.log('Failed to send message');
        setError('메시지 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('메시지 전송 중 오류가 발생했습니다.');
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
            isOwnMessage ? styles.ownMessageText : null,
            isSystemMessage ? styles.systemMessageText : null,
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : null
          ]}> 
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
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
            onContentSizeChange={() => scrollToBottom()} // 컨텐츠 크기 변경 시에도 스크롤
            onLayout={() => scrollToBottom()} // 레이아웃 완료 시에도 스크롤
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
              {/* 디버깅 정보 표시 */}
              <Text style={styles.debugInfo}>
                {`메시지: ${Boolean(newMessage.trim())}, 
                  연결: ${isConnected}, 
                  토큰: ${Boolean(accessToken)}`}
              </Text>
              {!isConnected && (
                <Text style={styles.connectionWarning}>연결 중...</Text>
              )}
              <TouchableOpacity
                onPress={sendMessage}
                style={styles.sendButton}
              >
                <Ionicons 
                  name="send" 
                  size={24} 
                  color="#007AFF"
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
  ownMessageText: {
    color: '#fff',
  },
  ownTimestamp: {
    color: '#rgba(255,255,255,0.7)',
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
  debugInfo: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
});

export default ChatScreen;