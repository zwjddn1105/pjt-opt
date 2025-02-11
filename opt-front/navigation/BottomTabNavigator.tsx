// navigation/BottomTabNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import ManageScreen from '../screens/ManageScreen';
import SearchScreen from '../screens/SearchScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "홈") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "기록") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "챌린지") {
            iconName = focused ? "trophy" : "trophy-outline";
          } else if (route.name === "관리") {
            iconName = focused ? "build" : "build-outline";
          } else if (route.name === "검색") {
            iconName = focused ? "search" : "search-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 80 },
        tabBarLabelStyle: { fontSize: 14, paddingBottom: 10 }, // 라벨을 아래로 정렬
        tabBarIconStyle: { marginTop: 10 }, // 아이콘을 아래로 정렬
      })}
    >
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="기록" component={CalendarScreen} />
      <Tab.Screen name="챌린지" component={ChallengeScreen} />
      <Tab.Screen name="관리" component={ManageScreen} />
      <Tab.Screen name="검색" component={SearchScreen} />
    </Tab.Navigator>
  );
};
