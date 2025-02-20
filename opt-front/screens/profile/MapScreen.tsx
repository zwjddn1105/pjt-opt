import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Alert, Text } from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import { EXPO_PUBLIC_BASE_URL } from "@env";

const BASE_URL = EXPO_PUBLIC_BASE_URL;
const KAKAO_API_KEY =
  process.env.EXPO_PUBLIC_KAKAO_API_KEY || "YOUR_JAVASCRIPT_KEY";
const KAKAO_REST_API_KEY =
  process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || "YOUR_REST_KEY";

const MapScreen = () => {
  const webViewRef = useRef(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAddressFromAPI = async (lat: number, lng: number) => {
    try {
      console.log("🛠️ [DEBUG] REST API 호출 시작:", lat, lng);

      const response = await axios.get(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}&input_coord=WGS84`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );

      if (response.data.documents.length > 0) {
        const { region_1depth_name, region_2depth_name } =
          response.data.documents[0].address;
        console.log(
          "📌 변환된 주소 데이터:",
          region_1depth_name,
          region_2depth_name
        );

        await AsyncStorage.setItem("city", region_1depth_name);
        await AsyncStorage.setItem("district", region_2depth_name);

        console.log(
          "✅ 시/구 정보 저장 완료:",
          region_1depth_name,
          region_2depth_name
        );
      } else {
        console.warn("⚠️ REST API 응답: 주소 데이터 없음");
      }
    } catch (error) {
      console.error("❌ REST API 주소 변환 실패:", error);
    }
  };

  useEffect(() => {
    const fetchGymLocation = async () => {
      try {
        const tempGymId = await AsyncStorage.getItem("gymId");
        const gymId = tempGymId ? parseInt(tempGymId, 10) : null;

        if (!gymId) {
          setErrorMessage("저장된 체육관 정보가 없습니다.");
          setIsLoading(false);
          return;
        }
        console.log(gymId);
        const response = await axios.get(`${BASE_URL}/gyms/${gymId}`);
        if (response.data.latitude && response.data.longitude) {
          const lat = Number(response.data.latitude);
          const lng = Number(response.data.longitude);

          console.log("📍 변환된 위도:", lat);
          console.log("📍 변환된 경도:", lng);

          setLatitude(lat);
          setLongitude(lng);

          console.log(
            "🛠️ [DEBUG] fetchAddressFromAPI() 호출 직전 | 위도:",
            lat,
            "경도:",
            lng
          );
          await AsyncStorage.removeItem("city");
          await AsyncStorage.removeItem("district");
          fetchAddressFromAPI(lat, lng);
          console.log("✅ [DEBUG] Kakao API 응답 데이터:", response.data);
        } else {
          setErrorMessage("체육관의 위치 정보가 없습니다.");
          Alert.alert("오류", "체육관의 위치 정보가 없습니다.");
        }
      } catch (error) {
        setErrorMessage("체육관 위치 정보를 불러오지 못했습니다.");
        Alert.alert("오류", "체육관 위치 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGymLocation();
  }, []);

  if (isLoading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (!latitude || !longitude) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>위치 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const html = `
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services,clusterer,drawing"></script> 
        </head>
        <body>
            <div id="map" style="width:500px;height:400px;"></div>
            <script type="text/javascript">
                (function () {
                    function sendLogToReactNative(log) {
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "LOG", message: log }));
                        }
                    }

                    sendLogToReactNative("✅ WebView 내부 JS 실행 시작");

                    const container = document.getElementById('map');
                    const options = {
                        center: new kakao.maps.LatLng(${latitude}, ${longitude}),
                        level: 3
                    };

                    const map = new kakao.maps.Map(container, options);
                    sendLogToReactNative("✅ 지도 생성 완료");

                    const markerPosition = new kakao.maps.LatLng(${latitude}, ${longitude});
                    const marker = new kakao.maps.Marker({ position: markerPosition });
                    marker.setMap(map);
                    sendLogToReactNative("✅ 마커 생성 완료");
                })();
            </script>
        </body>
    </html>    
`;

  return (
    <View style={styles.mapContainer}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: html }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoad={() => console.log("✅ WebView 로드 완료!")}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("❌ WebView 로드 실패:", nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  webView: {
    flex: 1,
  },
});

export default MapScreen;
