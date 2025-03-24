import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiurl from "../Apiurl";
import { RouteProp } from "@react-navigation/native";

type PersonalInfoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PersonalInfo"
>;

type Props = {
  navigation: PersonalInfoScreenNavigationProp;
  route: RouteProp<RootStackParamList, "PersonalInfo">;
};

const PersonalInfoScreen: React.FC<Props> = ({ navigation, route }) => {
  const [email, setEmail] = useState(route.params.email);
  const [phoneNumber, setPhoneNumber] = useState(route.params.phoneNumber);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const handleUpdateEmail = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "GuestHomeScreen" }],
        });
        return;
      }

      const response = await fetch(`${apiurl}/api/users/update-email`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("E-posta güncellenemedi");
      }

      Alert.alert("Başarılı", "E-posta adresiniz güncellendi");
      setIsEditingEmail(false);
    } catch (error) {
      Alert.alert("Hata", "E-posta güncellenirken bir hata oluştu");
    }
  };

  const handleUpdatePhone = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "GuestHomeScreen" }],
        });
        return;
      }

      const response = await fetch(`${apiurl}/api/users/update-phone`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error("Telefon numarası güncellenemedi");
      }

      Alert.alert("Başarılı", "Telefon numaranız güncellendi");
      setIsEditingPhone(false);
    } catch (error) {
      Alert.alert("Hata", "Telefon numarası güncellenirken bir hata oluştu");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>E-posta Adresi</Text>
          <View style={styles.inputContainer}>
            {isEditingEmail ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.value}>{email}</Text>
            )}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (isEditingEmail) {
                  handleUpdateEmail();
                } else {
                  setIsEditingEmail(true);
                }
              }}
            >
              <Text style={styles.editButtonText}>
                {isEditingEmail ? "Kaydet" : "Düzenle"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Telefon Numarası</Text>
          <View style={styles.inputContainer}>
            {isEditingPhone ? (
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{phoneNumber}</Text>
            )}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (isEditingPhone) {
                  handleUpdatePhone();
                } else {
                  setIsEditingPhone(true);
                }
              }}
            >
              <Text style={styles.editButtonText}>
                {isEditingPhone ? "Kaydet" : "Düzenle"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: "#666",
  },
  editButton: {
    backgroundColor: "#8adbd2",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PersonalInfoScreen;
