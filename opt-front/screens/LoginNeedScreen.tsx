import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  KakaoLogin: undefined;
};

type LoginNeedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginNeedScreen = () => {
  const video = useRef<Video>(null);
  const navigation = useNavigation<LoginNeedScreenNavigationProp>();

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
        source={require('../assets/mv.mp4')}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
      />
      <View style={styles.overlay}>
      
  <View style={styles.optContainer}>
    <Text style={styles.optText}>OPT</Text>
  </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("KakaoLogin")}
        >
          <Ionicons name="chatbubble" size={20} color="black" style={styles.icon} />
          <Text style={styles.buttonText}>카카오 로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.laterLoginContainer}
          onPress={() => navigation.goBack()}
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
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 400,  // 버튼을 아래로 내리기 위해 추가
  },
  optContainer: {
    position: 'absolute',
    top: -220, // 상단에서 50 포인트 떨어진 위치
    alignSelf: 'center',
  },
  optText: {
    fontSize: 64,
    color: 'white',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: '#FEE500',
    paddingVertical: 20,           // 세로 패딩 증가
    paddingHorizontal: 20,         // 가로 패딩 증가
    borderRadius: 12,              // 모서리 라운드 증가
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',                  // 버튼 너비 지정
    justifyContent: 'center',      // 내용 가운데 정렬
  },
  buttonText: {
    fontSize: 22,                  // 폰트 크기 증가
    color: '#000',
    fontWeight: '800',            // 폰트 두께 추가
  },
  icon: {
    marginRight: 24,              // 아이콘과 텍스트 사이 간격 증가
    fontSize: 30,                 // 아이콘 크기 증가
  },
  laterLoginContainer: {
    marginTop: 20,               // 카카오 로그인 버튼 아래 여백
  },
  laterLoginText: {
    color: '#888888',            // 회색 글자
    fontSize: 16,                // 적당한 폰트 크기
    textDecorationLine: 'underline', // 밑줄 추가 (선택사항)
  },
});

export default LoginNeedScreen;