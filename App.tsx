import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import AdvertScreen from "./src/screens/AdvertScreen";
import SplashScreen from "./src/screens/SplashScreen";
import { RootStackParamList } from "./src/Types";
import GuestHomeScreen from "./src/screens/GuestHomeScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import VerificationScreen from "./src/screens/VerificationScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import MessagesAreaScreen from "./src/screens/MessagesAreaScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import AddAdvertScreen from "./src/screens/AddAdvertScreen";

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Advert"
          component={AdvertScreen}
          options={{ title: "İlan Detayları" }}
        />
        <Stack.Screen name="GuestHomeScreen" component={GuestHomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="MessagesArea" component={MessagesAreaScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="AddAdvert" component={AddAdvertScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
