import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Switch,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Types";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faUser,
  faHeart,
  faShoppingBag,
  faCog,
  faQuestionCircle,
  faSignOutAlt,
  faChevronRight,
  faBell,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import apiurl from "../Apiurl";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

type Ad = {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  status: string;
  categoryName: string;
};

type User = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
};

type UserData = {
  user: User;
  myAds: {
    $values: Ad[];
  };
  favorites?: {
    $values: Ad[];
  };
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Ad[]>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log("Token:", token); // Token'ı kontrol et

      if (!token) {
        console.log("Token bulunamadı");
        navigation.reset({
          index: 0,
          routes: [{ name: "GuestHomeScreen" }],
        });
        return;
      }

      console.log("API isteği yapılıyor:", `${apiurl}/api/users/me`);
      const response = await fetch(`${apiurl}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("API Yanıt Status:", response.status);
      const responseText = await response.text();
      console.log("API Yanıt Body:", responseText);

      if (!response.ok) {
        throw new Error(
          `Kullanıcı bilgileri alınamadı. Status: ${response.status}, Body: ${responseText}`
        );
      }

      const data = JSON.parse(responseText);
      console.log("Parsed Data:", data);
      setUserData(data);
    } catch (error: any) {
      console.error("Hata detayı:", error);
      Alert.alert(
        "Hata",
        `Kullanıcı bilgileri yüklenirken bir hata oluştu: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    navigation.reset({
      index: 0,
      routes: [{ name: "GuestHomeScreen" }],
    });
  };

  const handleFavorites = () => {
    navigation.navigate("Favs");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profil Başlığı */}
        <View style={styles.header}>
          <Text style={styles.userName}>
            {userData?.user.fullName || "İsimsiz Kullanıcı"}
          </Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userData?.myAds.$values.length || "0"}
            </Text>
            <Text style={styles.statLabel}>İlanlarım</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Favoriler</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userData?.myAds.$values.filter((ad) => ad.status === "Satıldı")
                .length || "0"}
            </Text>
            <Text style={styles.statLabel}>Satışlar</Text>
          </View>
        </View>

        {/* Menü Bölümü */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Hesabım</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("PersonalInfo", {
                email: userData?.user.email || "",
                phoneNumber: userData?.user.phoneNumber || "",
              });
            }}
          >
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon icon={faUser} size={20} color="#8adbd2" />
              <Text style={styles.menuItemText}>Kişisel Bilgilerim</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Ayarlar</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon icon={faBell} size={20} color="#8adbd2" />
              <Text style={styles.menuItemText}>Bildirimler</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#e0e0e0", true: "#c4ede9" }}
              thumbColor={notificationsEnabled ? "#8adbd2" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon icon={faCog} size={20} color="#8adbd2" />
              <Text style={styles.menuItemText}>Uygulama Ayarları</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Privacy")}
          >
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon icon={faShieldAlt} size={20} color="#8adbd2" />
              <Text style={styles.menuItemText}>Gizlilik ve Güvenlik</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Help")}
          >
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon
                icon={faQuestionCircle}
                size={20}
                color="#8adbd2"
              />
              <Text style={styles.menuItemText}>Yardım ve Destek</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} size={20} color="#ff6b6b" />
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#8adbd2",
  },
  editProfileButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 15,
    marginBottom: 15,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "#eee",
  },
  menuSection: {
    backgroundColor: "#fff",
    marginBottom: 15,
    paddingTop: 10,
    paddingBottom: 5,
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 30,
    marginTop: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
});

export default ProfileScreen;
