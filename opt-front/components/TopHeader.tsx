// components/TopHeader.tsx
import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ProfileButton from "./ProfileButton";
import SendButton from "./SendButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  홈: undefined;
  LoginNeedScreen: undefined;
  DMScreen: undefined;
  TrainerProfile: undefined;
  Main: {
    screen?: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TopHeader = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleProfilePress = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      // 프로필 화면으로 이동하는 로직 (아직 미구현)
    } else {
      navigation.navigate("TrainerProfile");
    }
  };
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("refreshToken");
      navigation.reset({
        index: 0,
        routes: [{ name: "Main", params: { screen: "홈" } }],
      });
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Main", { screen: "홈" })}
        >
          <Image
            source={require("../assets/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>카카오 로그아웃</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.topButtons}>
        <ProfileButton onPress={handleProfilePress} />
        <SendButton onPress={() => navigation.navigate("DMScreen")} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: "#fff",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 80,
    height: 60,
  },
  topButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingRight: 5,
  },
  logoutButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "#333",
  },
});
