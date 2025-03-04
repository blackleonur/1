import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Types";

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register"
>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = () => {
    // Kayıt işlemi burada yapılacak
    console.log("Kayıt ol:", { name, email, password, phone });
    // Doğrulama ekranına yönlendir
    navigation.navigate("Verification");
  };

  const handleLogin = () => {
    // Giriş işlemi burada yapılacak
    console.log("Giriş yap:", { email, password });
    // Başarılı giriş sonrası ana sayfaya yönlendir
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {activeTab === "register" ? "Hesap Oluştur" : "Giriş Yap"}
            </Text>
            <Text style={styles.subtitle}>
              {activeTab === "register"
                ? "İkinci el alışverişin en güvenli adresi"
                : "Hesabınıza giriş yapın"}
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "register" && styles.activeTab]}
              onPress={() => setActiveTab("register")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "register" && styles.activeTabText,
                ]}
              >
                Kayıt Ol
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "login" && styles.activeTab]}
              onPress={() => setActiveTab("login")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "login" && styles.activeTabText,
                ]}
              >
                Giriş Yap
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {activeTab === "register" && (
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="E-posta"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {activeTab === "register" && (
              <TextInput
                style={styles.input}
                placeholder="Telefon"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {activeTab === "register" && (
              <TextInput
                style={styles.input}
                placeholder="Şifre Tekrar"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={activeTab === "register" ? handleRegister : handleLogin}
            >
              <Text style={styles.buttonText}>
                {activeTab === "register" ? "Kayıt Ol" : "Giriş Yap"}
              </Text>
            </TouchableOpacity>

            {activeTab === "login" && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#8adbd2",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#8adbd2",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 15,
  },
  forgotPasswordText: {
    color: "#8adbd2",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default RegisterScreen;
