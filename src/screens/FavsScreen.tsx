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
import { faHeart } from "@fortawesome/free-solid-svg-icons";

type FavsScreenNavigationProp = StackNavigationProp<RootStackParamList, "Favs">;

type Props = {
  navigation: FavsScreenNavigationProp;
};

type Ad = {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  status: string;
  categoryName: string;
};

const FavsScreen: React.FC<Props> = ({ navigation }) => {
  const [favorites, setFavorites] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "GuestHomeScreen" }],
        });
        return;
      }

      const response = await fetch(`${apiurl}/api/users/me/favorites`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Favoriler alınamadı");
      }

      const data = await response.json();
      setFavorites(data.$values || []);
    } catch (error) {
      Alert.alert("Hata", "Favoriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (adId: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(`${apiurl}/api/users/me/favorites/${adId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Favori kaldırılamadı");
      }

      setFavorites(favorites.filter((fav) => fav.id !== adId));
      Alert.alert("Başarılı", "İlan favorilerden kaldırıldı");
    } catch (error) {
      Alert.alert("Hata", "Favori kaldırılırken bir hata oluştu");
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
        <Text style={styles.adCategory}>{item.categoryName}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(item.id)}
      >
        <FontAwesomeIcon icon={faHeart} size={24} color="#ff6b6b" />
      </TouchableOpacity>
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
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Henüz favoriniz bulunmuyor</Text>
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
  adCategory: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    padding: 10,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});

export default FavsScreen;
