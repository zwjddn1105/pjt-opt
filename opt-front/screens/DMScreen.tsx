import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  MainTabs: undefined;
  ManagerChat: undefined;
  TrainerChat: undefined;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
// 채팅방 데이터의 타입을 정의하는 인터페이스
interface ChatRoom {
  id: string; // 채팅방 고유 식별자
  name: string; // 채팅 상대방 이름
  lastMessage: string; // 마지막 메시지 내용
  time: string; // 마지막 메시지 시간
  profileImage: string; // 프로필 이미지 URL
  isPinned?: boolean; // 상단 고정 여부 (optional)
}

export const DMScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  // 검색어를 관리하는 상태
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // TODO: 실제 구현 시에는 이 부분을 백엔드 API 호출로 대체해야 함
  // 예시: const [chatRooms, setChatRooms] = React.useState<ChatRoom[]>([]);
  // useEffect(() => {
  //   const fetchChatRooms = async () => {
  //     const response = await api.getChatRooms();
  //     setChatRooms(response.data);
  //   };
  //   fetchChatRooms();
  // }, []);

  const chatRooms: ChatRoom[] = [
    {
      id: "1",
      name: "Manager",
      lastMessage: "회원님의 회원권 첫 수강 곧 만료...",
      time: "오후 1:28",
      profileImage: "매니저프로필이미지경로",
      isPinned: true,
    },
    {
      id: "2",
      name: "Trainer",
      lastMessage: "오늘 세트를 좀 많이 했던데데 짝짝...",
      time: "오후 1:28",
      profileImage: "트레이너프로필이미지경로",
      isPinned: true,
    },
    {
      id: "3",
      name: "그다음은 최신순",
      lastMessage: "오운레(오늘 운동 레전드) ㅋㅋ",
      time: "오후 1:29",
      profileImage: "일반회원프로필이미지경로",
      isPinned: false,
    },
  ];

  // 검색어에 따라 채팅방을 필터링하는 함수
  const filteredChatRooms = chatRooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // FlatList에서 각 채팅방을 렌더링하는 컴포넌트
  // item 파라미터의 타입을 명시적으로 지정
  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      onPress={() => {
        if (item.name === "Manager") {
          navigation.navigate("ManagerChat");
        } else if (item.name === "Trainer") {
          navigation.navigate("TrainerChat");
        }
        // 다른 채팅방들의 네비게이션 처리
      }}
    >
      <View style={styles.chatRoomContainer}>
        <Image
          source={{ uri: item.profileImage }}
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

  return (
    <View style={styles.container}>
      {/* 헤더 영역 */}
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
        <Text style={styles.headerTitle}>nickname</Text>
      </View>

      {/* 검색창 영역 */}
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
      {/* 메시지 섹션 제목 */}
      <Text style={styles.sectionTitle}>메시지</Text>
      {/* 채팅방 목록 */}
      <FlatList
        data={filteredChatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: 8,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
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
    backgroundColor: "#f0f0f0", // 이미지 로딩 전 배경색
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
});

export default DMScreen;