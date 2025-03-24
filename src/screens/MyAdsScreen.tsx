import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiurl from "../Apiurl";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faTrash,
  faEdit,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

type MyAdsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MyAds"
>;

type Props = {
  navigation: MyAdsScreenNavigationProp;
};

type Ad = {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  status: string;
  categoryName: string;
};

const MyAdsScreen: React.FC<Props> = ({ navigation }) => {
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAds();
  }, []);

  const fetchMyAds = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "GuestHomeScreen" }],
        });
        return;
      }

      const response = await fetch(`${apiurl}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("İlanlar alınamadı");
      }

      const data = await response.json();
      setMyAds(data.myAds.$values || []);
    } catch (error) {
      Alert.alert("Hata", "İlanlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const deleteAd = async (adId: number) => {
    Alert.alert("İlanı Sil", "Bu ilanı silmek istediğinizden emin misiniz?", [
      {
        text: "İptal",
        style: "cancel",
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;

            const response = await fetch(`${apiurl}/api/adverts/${adId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              throw new Error("İlan silinemedi");
            }

            setMyAds(myAds.filter((ad) => ad.id !== adId));
            Alert.alert("Başarılı", "İlan başarıyla silindi");
          } catch (error) {
            Alert.alert("Hata", "İlan silinirken bir hata oluştu");
          }
        },
      },
    ]);
  };

  const markAsSold = async (adId: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(`${apiurl}/api/adverts/${adId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Satıldı" }),
      });

      if (!response.ok) {
        throw new Error("İlan durumu güncellenemedi");
      }

      setMyAds(
        myAds.map((ad) => (ad.id === adId ? { ...ad, status: "Satıldı" } : ad))
      );
      Alert.alert("Başarılı", "İlan durumu 'Satıldı' olarak güncellendi");
    } catch (error) {
      Alert.alert("Hata", "İlan durumu güncellenirken bir hata oluştu");
    }
  };

  const renderItem = ({ item }: { item: Ad }) => (
    <View style={styles.adCard}>
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
        style={styles.adImage}
      />
      <View style={styles.adInfo}>
        <Text style={styles.adTitle}>{item.title}</Text>
        <Text style={styles.adPrice}>{item.price} ₺</Text>
        <Text
          style={[
            styles.adStatus,
            { color: item.status === "Satıldı" ? "#4CAF50" : "#8adbd2" },
          ]}
        >
          {item.status}
        </Text>
        <Text style={styles.adCategory}>{item.categoryName}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("AddAdvert", { adId: item.id })}
        >
          <FontAwesomeIcon icon={faEdit} size={20} color="#8adbd2" />
        </TouchableOpacity>
        {item.status !== "Satıldı" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => markAsSold(item.id)}
          >
            <FontAwesomeIcon icon={faCheckCircle} size={20} color="#4CAF50" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteAd(item.id)}
        >
          <FontAwesomeIcon icon={faTrash} size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8adbd2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {myAds.length > 0 ? (
        <FlatList
          data={myAds}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Henüz ilanınız bulunmuyor</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddAdvert")}
          >
            <Text style={styles.addButtonText}>Yeni İlan Ekle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 15,
  },
  adCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  adImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  adInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  adTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  adPrice: {
    fontSize: 15,
    color: "#8adbd2",
    fontWeight: "bold",
    marginBottom: 3,
  },
  adStatus: {
    fontSize: 14,
    marginBottom: 3,
  },
  adCategory: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    justifyContent: "space-around",
    padding: 5,
  },
  actionButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#8adbd2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyAdsScreen;
