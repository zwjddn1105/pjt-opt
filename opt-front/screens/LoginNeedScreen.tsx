import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video, ResizeMode } from "expo-av";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  홈: undefined;
  MyChallenge: undefined;
  KakaoLogin: undefined;
  Main: { screen?: string };
  LoginNeedScreen: { returnScreen: string } | undefined;
};

type LoginNeedScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type LoginNeedScreenRouteParams = {
  returnScreen?: string;
};

const LoginNeedScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<Record<string, LoginNeedScreenRouteParams>, string>>();

  const video = useRef<Video>(null);
  const navigation = useNavigation<LoginNeedScreenNavigationProp>();
  const [email, setEmail] = useState("");

  const loginWithEmail = async () => {
    try {
      const response = await fetch("http://10.0.2.2:8080/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("로그인 실패");
      }

      const data = await response.json();
      const refreshToken = data.refreshToken;

      await AsyncStorage.setItem("refreshToken", refreshToken);
      Alert.alert("로그인 성공", "환영합니다!");
      if (route.params?.returnScreen) {
        const screen = route.params.returnScreen as keyof RootStackParamList;
        if (screen === "Main") {
          navigation.replace("Main", { screen: "홈" });
        } else {
          navigation.replace(screen);
        }
      } else {
        navigation.replace("Main", { screen: "홈" });
      }
    } catch (error) {
      Alert.alert("로그인 실패", "이메일을 확인해주세요.");
    }
  };

  useEffect(() => {
    playVideo();
  }, []);

  const playVideo = async () => {
    if (video.current) {
      await video.current.playAsync();
      await video.current.setIsLoopingAsync(true);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={require("../assets/mv.mp4")}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
      />
      <View style={styles.overlay}>
        <View style={styles.optContainer}>
          <Text style={styles.optText}>OPT</Text>
        </View>

        {/* -------------------임시---------------- */}
        {/* 이메일 입력창 */}
        <TextInput
          style={styles.input}
          placeholder="이메일을 입력하세요"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {/* 로그인 버튼 */}
        <TouchableOpacity style={styles.loginButton} onPress={loginWithEmail}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>
        {/*---------- 여기까지가 임시 ------------*/}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("KakaoLogin")}
        >
          <Ionicons
            name="chatbubble"
            size={20}
            color="black"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>카카오 로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.laterLoginContainer}
          onPress={() => navigation.navigate("Main", { screen: "홈" })}
        >
          <Text style={styles.laterLoginText}>나중에 로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 400, // 버튼을 아래로 내리기 위해 추가
  },
  optContainer: {
    position: "absolute",
    top: -220, // 상단에서 50 포인트 떨어진 위치
    alignSelf: "center",
  },
  optText: {
    fontSize: 64,
    color: "white",
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: "#FEE500",
    paddingVertical: 20, // 세로 패딩 증가
    paddingHorizontal: 20, // 가로 패딩 증가
    borderRadius: 12, // 모서리 라운드 증가
    flexDirection: "row",
    alignItems: "center",
    width: "80%", // 버튼 너비 지정
    justifyContent: "center", // 내용 가운데 정렬
  },
  buttonText: {
    fontSize: 22, // 폰트 크기 증가
    color: "#000",
    fontWeight: "800", // 폰트 두께 추가
  },
  icon: {
    marginRight: 24, // 아이콘과 텍스트 사이 간격 증가
    fontSize: 30, // 아이콘 크기 증가
  },
  laterLoginContainer: {
    marginTop: 20, // 카카오 로그인 버튼 아래 여백
  },
  laterLoginText: {
    color: "#888888", // 회색 글자
    fontSize: 16, // 적당한 폰트 크기
    textDecorationLine: "underline", // 밑줄 추가 (선택사항)
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: "80%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginNeedScreen;
