import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const REST_API_KEY = 'e1d2f1a9d248dd8bedb52de9fdeee661';
const REDIRECT_URI = 'http://70.12.246.173:8081';

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
  const handleMessage = (event: any) => {
    const data: string = event.nativeEvent.data;
    const codeMatch = data.match(/[?&]code=([^&]+)/);
    if (codeMatch && codeMatch[1]) {
      const authorizeCode = codeMatch[1];
      console.log('인가 코드:', authorizeCode);
      // 여기서 백엔드 API에 인가 코드를 전달해 토큰을 요청하거나,
      // 상태 관리를 통해 로그인 처리를 진행할 수 있습니다.
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={['*']}
        scalesPageToFit={false}
        source={{
          uri: `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`,
        }}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        javaScriptEnabled
        // postMessage로 전달된 데이터는 nativeEvent.data에 담입니다.
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
    backgroundColor: '#fff'
  }
});
