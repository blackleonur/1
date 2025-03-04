import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Animated,
  Easing,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Types";

type VerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Verification"
>;

type Props = {
  navigation: VerificationScreenNavigationProp;
};

const VerificationScreen: React.FC<Props> = ({ navigation }) => {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // Kod girişi değiştiğinde
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Otomatik olarak bir sonraki input'a geç
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace tuşuna basıldığında önceki input'a geç
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Doğrulama kodunu kontrol et
  const verifyCode = () => {
    const enteredCode = code.join("");

    // Şimdilik herhangi bir 6 haneli kodu kabul et
    if (enteredCode.length === 6) {
      // Hoş geldiniz modalını göster
      setShowWelcomeModal(true);

      // İlerleme çubuğu animasyonunu başlat
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      // 3 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        setShowWelcomeModal(false);
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }, 3000);
    } else {
      Alert.alert("Hata", "Lütfen 6 haneli doğrulama kodunu giriniz.");
    }
  };

  // Yeni kod gönder
  const resendCode = () => {
    Alert.alert("Bilgi", "Yeni doğrulama kodu gönderildi.");
  };

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Doğrulama Kodu</Text>
            <Text style={styles.subtitle}>
              Telefonunuza gönderilen 6 haneli doğrulama kodunu giriniz.
            </Text>
          </View>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.codeInput}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={verifyCode}>
            <Text style={styles.buttonText}>Doğrula</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Kod almadınız mı?</Text>
            <TouchableOpacity onPress={resendCode}>
              <Text style={styles.resendButton}>Yeniden Gönder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Hoş Geldiniz Modalı */}
      <Modal visible={showWelcomeModal} transparent={true} animationType="fade">
        <View style={styles.welcomeModalOverlay}>
          <View style={styles.welcomeModalContainer}>
            <View style={styles.welcomeIconContainer}>
              <Text style={styles.welcomeIcon}>🎉</Text>
            </View>
            <Text style={styles.welcomeTitle}>Hoş Geldiniz!</Text>
            <Text style={styles.welcomeMessage}>
              Kıbrısİlana hoş geldiniz. Artık alım satım yapabilir,
              mesajlaşabilir ve daha fazlasını yapabilirsiniz.
            </Text>
            <View style={styles.welcomeProgressBar}>
              <Animated.View
                style={[styles.welcomeProgressFill, { width: progressWidth }]}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
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
    lineHeight: 22,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
  },
  button: {
    backgroundColor: "#8adbd2",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendButton: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8adbd2",
    marginLeft: 5,
  },
  // Hoş Geldiniz Modal Stilleri
  welcomeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeIcon: {
    fontSize: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  welcomeMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  welcomeProgressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  welcomeProgressFill: {
    height: "100%",
    backgroundColor: "#8adbd2",
    borderRadius: 3,
  },
});

export default VerificationScreen;
