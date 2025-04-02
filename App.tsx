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
import PersonalInfoScreen from "./src/screens/PersonalInfoScreen";
import FavsScreen from "./src/screens/FavsScreen";
import MyAdsScreen from "./src/screens/MyAdsScreen";
import PrivacyScreen from "./src/screens/PrivacyScreen";
import HelpScreen from "./src/screens/HelpScreen";
import EditAdScreen from "./src/screens/EditAdScreen";

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
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen
          name="VerificationScreen"
          component={VerificationScreen}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="MessagesArea" component={MessagesAreaScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="AddAdvert" component={AddAdvertScreen} />
        <Stack.Screen
          name="PersonalInfo"
          component={PersonalInfoScreen}
          options={{
            title: "Kişisel Bilgilerim",
            headerStyle: {
              backgroundColor: "#8adbd2",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Favs"
          component={FavsScreen}
          options={{
            title: "Favorilerim",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#8adbd2",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="MyAds"
          component={MyAdsScreen}
          options={{
            title: "İlanlarım",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#8adbd2",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{
            title: "Gizlilik ve Güvenlik",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#8adbd2",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Help"
          component={HelpScreen}
          options={{
            title: "Yardım ve Destek",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#8adbd2",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen name="EditAd" component={EditAdScreen} />
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
