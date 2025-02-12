import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const REST_API_KEY = "b74e72417a62d1b6d0fc3b1e25087c3d";
const REDIRECT_URI = "https://i12a309.p.ssafy.io/auth/kakao";

// injectedJavaScript는 웹뷰 로드 후 현재 URL에 code가 포함되어 있으면 postMessage로 전달합니다.
const INJECTED_JAVASCRIPT = `
  (function() {
    if (window.location.href.indexOf("code=") > -1) {
      window.ReactNativeWebView.postMessage(window.location.href);
    }
  })();
  true;
`;

const KakaoLogin = () => {
  // 함수: 전달된 URL 문자열에서 'code=' 이후의 인가 코드를 추출합니다.
  const handleMessage = async (event: any) => {
    const data: string = event.nativeEvent.data;
    const codeMatch = data.match(/[?&]code=([^&]+)/);
    console.log(codeMatch);
    console.log("-----------------------");

    if (codeMatch && codeMatch[1]) {
      const authorizeCode = codeMatch[1];
      console.log(authorizeCode);
      try {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaa");
        const response = await axios.post(
          `https://i12a309.p.ssafy.io/auth/kakao-front?code=${authorizeCode}`
          // {
          //   headers: {
          //     "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          //   },
          // }
        );
        // body: JSON.stringify({ code: authorizeCode }), console.log(response);
        console.log("a");
        if (response.status === 200) {
          const { refreshToken } = await response.data();
          console.log("받은 refreshToken:", refreshToken);

          await AsyncStorage.setItem("refreshToken", refreshToken);
          console.log("refreshToken 저장 완료");

          // 여기에 로그인 성공 후 처리 로직 추가 (예: 화면 전환)
        } else {
          console.error("토큰 요청 실패:", response.status);
        }
      } catch (error) {
        console.error("토큰 요청 중 에러 발생:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        scalesPageToFit={false}
        source={{
          uri: `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`,
        }}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        javaScriptEnabled
        onMessage={handleMessage}
      />
    </View>
  );
};

export default KakaoLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 24,
    backgroundColor: "#fff",
  },
});
