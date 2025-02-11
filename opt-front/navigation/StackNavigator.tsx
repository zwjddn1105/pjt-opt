import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomTabNavigator } from "./BottomTabNavigator";
import KakaoLogin from "../screens/LoginScreen";
import DMScreen from "../screens/DMScreen";
import LoginNeedScreen from "../screens/LoginNeedScreen";
import FoodScreen from "../screens/FoodScreen";
import ManagerChatScreen from "../screens/ManagerChatScreen";
import TrainerChatScreen from "../screens/TrainerChatScreen";

export type RootStackParamList = {
  Main: undefined;
  KakaoLogin: undefined;
  DMScreen: undefined;
  LoginNeedScreen: undefined;
  Food: { date: string };
  ManagerChat: undefined;
  TrainerChat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="KakaoLogin" component={KakaoLogin} />
      <Stack.Screen name="DMScreen" component={DMScreen} />
      <Stack.Screen name="LoginNeedScreen" component={LoginNeedScreen} />
      <Stack.Screen name="Food" component={FoodScreen} />
      <Stack.Screen name="ManagerChat" component={ManagerChatScreen} />
      <Stack.Screen name="TrainerChat" component={TrainerChatScreen} />
    </Stack.Navigator>
  );
};
