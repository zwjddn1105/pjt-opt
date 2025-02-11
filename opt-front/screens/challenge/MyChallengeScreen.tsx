import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopHeader } from "../../components/TopHeader";

type RootStackParamList = {
  LoginNeedScreen: { returnScreen: string } | undefined;
  OngoingChallenges: undefined;
  AppliedChallenges: undefined;
  PastChallenges: undefined;
  ManageChallenge: undefined;
  MyChallengeScreen: undefined;
};

const MyChallengeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        setIsLoggedIn(refreshToken !== null);
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn === false) {
      navigation.replace("LoginNeedScreen", {
        returnScreen: "MyChallenge",
      });
    }
  }, [isLoggedIn, navigation]);

  if (isLoggedIn === null) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderSectionHeader = (
    title: string,
    navigateTo: keyof RootStackParamList
  ) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate(navigateTo)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopHeader />
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => navigation.navigate("ManageChallenge")}
            activeOpacity={0.8}
          >
            <Text style={styles.manageButtonText}>챌린지 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={toggleSwitch}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.toggleTrack,
                isEnabled && styles.toggleTrackActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  isEnabled && styles.toggleTextActive,
                ]}
              >
                MY
              </Text>
              <View
                style={[
                  styles.toggleThumb,
                  isEnabled && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          {renderSectionHeader("내가 진행중인 챌린지", "OngoingChallenges")}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          ></ScrollView>
        </View>
        <View style={styles.section}>
          {renderSectionHeader("내가 신청한 챌린지", "AppliedChallenges")}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          ></ScrollView>
        </View>
        <View style={styles.section}>
          {renderSectionHeader("내가 참여했던 챌린지", "PastChallenges")}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          ></ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    marginBottom: 10,
    flex: 1,
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 30,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  addButtonText: {
    fontSize: 18,
    color: "#666",
    lineHeight: 24,
  },
  challengeCard: {
    width: 180,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    width: 70,
    fontSize: 12,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
  },
  toggleContainer: {
    width: 75,
    height: 30,
    alignSelf: "flex-end",
    marginRight: 20,
  },
  toggleTrack: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
    backgroundColor: "#767577",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  toggleTrackActive: {
    backgroundColor: "#0C508B",
  },
  toggleTextActive: {
    color: "#fff",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f4f3f4",
    position: "absolute",
    left: 4,
  },
  toggleText: {
    color: "#f4f3f4",
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 8,
  },
  toggleThumbActive: {
    left: "auto",
    right: 4,
    backgroundColor: "#fff",
  },
  customToggle: {
    width: 70,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#767577",
    justifyContent: "center",
    alignItems: "center",
  },
  customToggleActive: {
    backgroundColor: "#0C508B",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 20,
    marginBottom: 10,
  },
  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#0C508B",
    borderRadius: 15,
    marginRight: 12,
  },
  manageButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
});

export default MyChallengeScreen;
