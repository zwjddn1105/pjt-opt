// screens/chat/DMScreens.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { useChatStore } from '../../stores/chatStore';
import { User, ApiChatRoom, ChatRoom } from '../../types/chat';
import ChatService from '../../services/ChatService';
import { chatApi } from '../../api/chatApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DMScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUserListVisible, setUserListVisible] = useState(false);
  const { rooms, roomIds, addRoom, clearRooms } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const roomsArray = roomIds.map(id => rooms[id]);

  // 샘플 유저 데이터
  const users: User[] = [
    { id: 1, email: "a" },
    { id: 2, email: "b@b" },
    { id: 3, email: "c@c.com" },
    { id: 4, email: "d@d.com" },
    { id: 5, email: "e@example.com" },
    { id: 6, email: "frank06@example.com" },
    { id: 7, email: "grace07@example.com" },
    { id: 8, email: "hank08@example.com" },
    { id: 9, email: "ivy09@example.com" },
    { id: 10, email: "jack10@example.com" },
  ];

  // 채팅방 목록 로드
  const loadChatRooms = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setIsLoading(false);
        return;
      }

      const apiRooms = await chatApi.getChatRooms(token);
      const currentUserId = parseInt(await AsyncStorage.getItem('userId') || '1');

      clearRooms();

      apiRooms.forEach((apiRoom: ApiChatRoom) => {
        const otherUserId = apiRoom.participants.find(id => id !== currentUserId);
        
        const chatRoom: ChatRoom = {
          id: apiRoom.id,
          name: apiRoom.roomName || `User ${otherUserId || 'Unknown'}`,
          lastMessage: '',
          time: new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          userType: 'USER',
          unreadCount: 0
        };

        addRoom(chatRoom);
      });
    } catch (error) {
      console.error('채팅방 목록 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clearRooms, addRoom]);

  const setupWebSocket = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      if (!ChatService.isConnected()) {
        await ChatService.connect(token);
        
        roomsArray.forEach(room => {
          ChatService.subscribeToRoom(room.id, (message) => {
            console.log(`Received message in room ${room.id}:`, message);
          });
        });
      }
    } catch (error) {
      console.error('WebSocket setup error:', error);
    }
  }, [roomsArray]);

  // 채팅방 생성 함수
  const createChatRoom = async (user: User) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }
  
      const apiRoom = await chatApi.createChatRoom(user.id, token);
      
      const chatRoomData: ChatRoom = {
        id: Number(apiRoom.id),
        name: user.email,
        lastMessage: "새로운 채팅방이 생성되었습니다.",
        time: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        userType: 'USER',
        unreadCount: 0
      };
  
      addRoom(chatRoomData);
  
      if (!ChatService.isConnected()) {
        await ChatService.connect(token);
      }
      
      ChatService.subscribeToRoom(chatRoomData.id, (message) => {
        console.log('New message received:', message);
        // 메시지 처리 로직 구현
      });
  
      setUserListVisible(false);
      
      navigation.navigate('Chat', {
        roomId: chatRoomData.id.toString(), // number를 string으로 변환
        otherUserName: chatRoomData.name,
        otherUserType: chatRoomData.userType
      });
  
    } catch (error) {
      console.error('채팅방 생성 오류:', error);
      Alert.alert('오류', '채팅방 생성에 실패했습니다.');
    }
  };

  // 컴포넌트 마운트 시 채팅방 목록 로드
  useEffect(() => {
    let isMounted = true;
    let wsCleanup = false;

    const initialize = async () => {
      if (!isMounted) return;

      await loadChatRooms();

      if (!wsCleanup && roomsArray.length > 0) {
        const token = await AsyncStorage.getItem('token');
        if (token && !ChatService.isConnected()) {
          await ChatService.connect(token);
          
          roomsArray.forEach(room => {
            ChatService.subscribeToRoom(room.id, (message) => {
              console.log(`Received message in room ${room.id}:`, message);
            });
          });
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      wsCleanup = true;
      roomsArray.forEach(room => {
        ChatService.unsubscribeFromRoom(room.id);
      });
    };
  }, [loadChatRooms]);

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredChatRooms = roomsArray.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Chat', {
        roomId: item.id.toString(), // number를 string으로 변환
        otherUserName: item.name,
        otherUserType: item.userType
      })}
    >
      <View style={[
        styles.chatRoomContainer,
        item.userType === 'TRAINER' && styles.trainerChatRoom
      ]}>
        <Image
          source={{ 
            uri: item.userType === 'TRAINER' 
              ? "trainer-profile-image" 
              : "user-profile-image" 
          }}
          style={styles.profileImage}
        />
        <View style={styles.chatInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </View>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => createChatRoom(item)}
    >
      <View style={styles.userInfo}>
        <Image
          source={{ uri: "user-profile-image" }}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>채팅</Text>
          <TouchableOpacity
            onPress={() => setUserListVisible(!isUserListVisible)}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {isUserListVisible ? (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>사용자 목록</Text>
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color="#999"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="검색"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
            <FlatList
              data={filteredChatRooms}
              renderItem={renderChatRoom}
              keyExtractor={(item) => item.id}  // toString() 제거
              extraData={rooms}  // rooms 상태가 변경될 때 리렌더링
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 8,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatRoomContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  trainerChatRoom: {
    backgroundColor: '#f8f8f8',
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  userType: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
});

export default DMScreen;