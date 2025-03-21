import React, { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Types";
import apiurl from "../Apiurl";

type SplashScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SplashScreen"
>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Büyüyüp küçülme animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2 saniye sonra GuestHomeScreen'e yönlendirme
    const timer = setTimeout(() => {
      navigation.navigate("GuestHomeScreen");
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Image
          source={require("../../assets/kıbrıslogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Text style={styles.appName}>Kıbrıs İlan!??</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dce6fa",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  appName: {
    position: "absolute",
    bottom: 50,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});

export default SplashScreen;
