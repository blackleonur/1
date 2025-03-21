import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Advert } from "../Types";
import apiurl from "../Apiurl";

type AdvertScreenRouteProp = RouteProp<RootStackParamList, "Advert">;
type AdvertScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Advert"
>;

type Props = {
  route: AdvertScreenRouteProp;
  navigation: AdvertScreenNavigationProp;
};

const AdvertScreen: React.FC<Props> = ({ route, navigation }) => {
  const { advertId } = route.params;
  const [advert, setAdvert] = useState<Advert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gerçek bir uygulamada burada API'den veri çekilir
    // Şimdilik örnek veri kullanıyoruz
    const mockAdvert: Advert = {
      id: advertId,
      title: "iPhone 13 Pro",
      description:
        "Mükemmel durumda, kutulu iPhone 13 Pro. 256GB depolama, gece mavisi renk. Garanti süresi devam ediyor. Hiçbir çizik veya hasar yok. Orijinal şarj aleti ve kulaklık dahil.",
      price: 25000,
      image: "https://picsum.photos/400/300",
      location: "İstanbul, Kadıköy",
      date: "15 Mayıs 2023",
      sellerName: "Ahmet Yılmaz",
      distance: "2.5 km",
      category: "Elektronik",
    };

    setTimeout(() => {
      setAdvert(mockAdvert);
      setLoading(false);
    }, 500);
  }, [advertId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (!advert) {
    return (
      <View style={styles.errorContainer}>
        <Text>İlan bulunamadı!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: advert.image }} style={styles.image} />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{advert.title}</Text>
        <Text style={styles.price}>{advert.price} TL</Text>
        <Text style={styles.location}>{advert.location}</Text>
        <Text style={styles.date}>İlan Tarihi: {advert.date}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Açıklama</Text>
        <Text style={styles.description}>{advert.description}</Text>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Satıcı ile İletişime Geç</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 250,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#888",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  contactButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  contactButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AdvertScreen;
