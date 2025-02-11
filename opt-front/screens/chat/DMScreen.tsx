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
import { SafeAreaView } from "react-native-safe-area-context";

type RootStackParamList = {
  MainTabs: undefined;
  ManagerChat: undefined;
  TrainerChat: undefined;
  UserChat: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  profileImage: string;
  isPinned?: boolean;
}

interface Follower {
  id: string;
  name: string;
  profileImage: string;
}

export const DMScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isFollowerListVisible, setFollowerListVisible] = React.useState(false);

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
      name: "User",
      lastMessage: "오운레(오늘 운동 레전드) ㅋㅋ",
      time: "오후 1:29",
      profileImage: "일반회원프로필이미지경로",
      isPinned: false,
    },
  ];

  const followers: Follower[] = [
    { id: "1", name: "Follower1", profileImage: "팔로워1프로필이미지경로" },
    { id: "2", name: "Follower2", profileImage: "팔로워2프로필이미지경로" },
    { id: "3", name: "Follower3", profileImage: "팔로워3프로필이미지경로" },
  ];

  const filteredChatRooms = chatRooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      onPress={() => {
        if (item.name === "Manager") {
          navigation.navigate("ManagerChat");
        } else if (item.name === "Trainer") {
          navigation.navigate("TrainerChat");
        } else if (item.name === "User") {
          navigation.navigate("UserChat");
        }
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

  const renderFollower = ({ item }: { item: Follower }) => (
    <TouchableOpacity>
      <View style={styles.chatRoomContainer}>
        <Image
          source={{ uri: item.profileImage }}
          style={styles.profileImage}
        />
        <View style={styles.chatInfo}>
          <Text style={styles.name}>{item.name}</Text>
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
          <Text style={styles.headerTitle}>nickname</Text>
          <TouchableOpacity
            onPress={() => setFollowerListVisible(!isFollowerListVisible)}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {isFollowerListVisible ? (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>팔로워</Text>
            <FlatList
              data={followers}
              renderItem={renderFollower}
              keyExtractor={(item) => item.id}
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
            <Text style={styles.sectionTitle}>메시지</Text>
            <FlatList
              data={filteredChatRooms}
              renderItem={renderChatRoom}
              keyExtractor={(item) => item.id}
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
    justifyContent: "flex-start",
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    padding: 4,
    marginLeft: "auto",
  },
  searchContainer: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
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
});

export default DMScreen;
