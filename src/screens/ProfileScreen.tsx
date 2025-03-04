import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Switch,
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
  faCreditCard,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    // Çıkış işlemleri burada yapılacak
    navigation.reset({
      index: 0,
      routes: [{ name: "GuestHomeScreen" }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profil Başlığı */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://randomuser.me/api/portraits/men/32.jpg",
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.userName}>Ahmet Yılmaz</Text>
          <Text style={styles.userEmail}>ahmet.yilmaz@example.com</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>İlanlarım</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Favoriler</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Satışlar</Text>
          </View>
        </View>

        {/* Menü Bölümü */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Hesabım</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon icon={faUser} size={20} color="#8adbd2" />
              <Text style={styles.menuItemText}>Kişisel Bilgilerim</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon icon={faHeart} size={20} color="#8adbd2" />
              <Text style={styles.menuItemText}>Favorilerim</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon icon={faShoppingBag} size={20} color="#8adbd2" />
              <Text style={styles.menuItemText}>İlanlarım</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                size={20}
                color="#8adbd2"
              />
              <Text style={styles.menuItemText}>Adreslerim</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon icon={faCreditCard} size={20} color="#8adbd2" />
              <Text style={styles.menuItemText}>Ödeme Yöntemlerim</Text>
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
              <FontAwesomeIcon icon={faShieldAlt} size={20} color="#8adbd2" />
              <Text style={styles.menuItemText}>Gizlilik ve Güvenlik</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesomeIcon icon={faCog} size={20} color="#8adbd2" />
              <Text style={styles.menuItemText}>Uygulama Ayarları</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
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
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#8adbd2",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
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
});

export default ProfileScreen;
