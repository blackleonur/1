import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Advert } from "../Types";
import apiurl from "../Apiurl";

// FontAwesome ikonları için importlar
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faMobileAlt,
  faCar,
  faHome,
  faLeaf,
  faBasketballBall,
  faBook,
  faTshirt,
  faCouch,
  faUser,
  faPlus,
  faEnvelope,
  faThLarge, // faViewGrid yerine faThLarge kullanıyoruz
  faLaptop,
  faTablet,
  faTv,
  faCarSide,
  faMotorcycle,
  faTruck,
  faMap,
  faBuilding,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

type Props = {
  navigation: HomeScreenNavigationProp;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  parentId?: string; // Alt kategori için üst kategori ID'si
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAd, setShowAd] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([
    // Ana kategoriler
    { id: "all", name: "Tümü", icon: "view-grid" },
    { id: "electronics", name: "Elektronik", icon: "cellphone" },
    { id: "cars", name: "Araçlar", icon: "car" },
    { id: "home", name: "Ev", icon: "home" },
    { id: "garden", name: "Bahçe", icon: "flower" },
    { id: "sports", name: "Spor", icon: "basketball" },
    { id: "books", name: "Kitap", icon: "book-open-variant" },
    { id: "clothing", name: "Giyim", icon: "tshirt-crew" },
    { id: "furniture", name: "Mobilya", icon: "sofa" },

    // Elektronik alt kategorileri
    {
      id: "phones",
      name: "Telefonlar",
      icon: "cellphone",
      parentId: "electronics",
    },
    {
      id: "computers",
      name: "Bilgisayarlar",
      icon: "laptop",
      parentId: "electronics",
    },
    {
      id: "tablets",
      name: "Tabletler",
      icon: "tablet",
      parentId: "electronics",
    },
    {
      id: "tv",
      name: "Televizyonlar",
      icon: "television",
      parentId: "electronics",
    },

    // Araçlar alt kategorileri
    { id: "cars_new", name: "Sıfır Araçlar", icon: "car", parentId: "cars" },
    { id: "cars_used", name: "İkinci El", icon: "car-side", parentId: "cars" },
    {
      id: "motorcycles",
      name: "Motosikletler",
      icon: "motorcycle",
      parentId: "cars",
    },
    {
      id: "commercial",
      name: "Ticari Araçlar",
      icon: "truck",
      parentId: "cars",
    },

    // Ev alt kategorileri
    { id: "apartment", name: "Daire", icon: "home", parentId: "home" },
    { id: "villa", name: "Villa", icon: "home", parentId: "home" },
    { id: "land", name: "Arsa", icon: "map", parentId: "home" },
    {
      id: "workplace",
      name: "İş Yeri",
      icon: "office-building",
      parentId: "home",
    },
  ]);

  const [selectedMainCategory, setSelectedMainCategory] =
    useState<string>("all");

  // Görüntülenecek kategorileri belirle
  const displayedCategories = useMemo(() => {
    if (selectedMainCategory === "all") {
      return categories.filter((cat) => !cat.parentId); // Sadece ana kategorileri göster
    } else {
      // Seçili ana kategoriye ait alt kategorileri göster
      return categories.filter((cat) => cat.parentId === selectedMainCategory);
    }
  }, [selectedMainCategory, categories]);

  // Kategori seçim işleyicisini güncelle
  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);

    if (category?.parentId) {
      // Alt kategori seçildi
      setSelectedCategory(categoryId);
    } else {
      // Ana kategori seçildi
      if (selectedMainCategory === categoryId) {
        // Aynı ana kategori tekrar seçilirse ana kategorilere dön
        setSelectedMainCategory("all");
      } else {
        setSelectedMainCategory(categoryId);
      }
    }
  };

  const [allAdverts, setAllAdverts] = useState<Advert[]>([
    // Elektronik - Telefon ilanları
    {
      id: "1",
      title: "iPhone 13 Pro",
      description:
        "Mükemmel durumda, kutulu iPhone 13 Pro. Hiç çizik yok, batarya sağlığı %95.",
      price: 25000,
      image: "data",
      location: "İstanbul",
      date: "2023-05-15",
      sellerName: "Ahmet Yılmaz",
      distance: "7 km",
      category: "phones", // "electronics" yerine "phones"
    },
    // Elektronik - Bilgisayar ilanları
    {
      id: "2",
      title: "MacBook Pro M1",
      description:
        "Az kullanılmış MacBook Pro M1. Kutusunda, tüm aksesuarları tam.",
      price: 35000,
      image: "dfgdfg",
      location: "Ankara",
      date: "2023-05-26",
      sellerName: "Kemal Demir",
      distance: "15 km",
      category: "computers", // "cars" yerine "computers"
    },
    // Araçlar - Sıfır Araç ilanları
    {
      id: "8",
      title: "2023 Toyota Corolla",
      description:
        "2023 model Toyota Corolla 1.6 Vision, otomatik vites. Sıfır araç.",
      price: 750000,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFzIBhdowkGzgMRCwZDFbObLqpDf17tyNTzQ&s",
      location: "İzmir",
      date: "2023-05-24",
      sellerName: "Selin Kaya",
      distance: "8 km",
      category: "cars_new", // "cars" yerine "cars_new"
    },
    // Araçlar - İkinci El ilanları
    {
      id: "9",
      title: "2018 Honda Civic",
      description:
        "2018 model Honda Civic 1.6 Executive, otomatik vites. Tek sahibinden, garaj arabası.",
      price: 820000,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFzIBhdowkGzgMRCwZDFbObLqpDf17tyNTzQ&s",
      location: "İzmir",
      date: "2023-05-24",
      sellerName: "Selin Kaya",
      distance: "8 km",
      category: "cars_used", // "cars" yerine "cars_used"
    },
  ]);

  // Filtrelenmiş ilanları hesapla
  const filteredAdverts = useMemo(() => {
    let filtered = allAdverts;

    // Kategori filtresi
    if (selectedCategory !== "all") {
      // Alt kategori seçilmişse sadece o kategorinin ilanlarını göster
      filtered = filtered.filter(
        (advert) => advert.category === selectedCategory
      );
    } else if (selectedMainCategory !== "all") {
      // Ana kategori seçilmişse, o kategoriye ait tüm alt kategorilerin ilanlarını göster
      const subCategories = categories
        .filter((cat) => cat.parentId === selectedMainCategory)
        .map((cat) => cat.id);

      filtered = filtered.filter((advert) =>
        subCategories.includes(advert.category)
      );
    }

    // Arama filtresi
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (advert) =>
          advert.title.toLowerCase().includes(query) ||
          advert.description.toLowerCase().includes(query) ||
          advert.location.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [
    allAdverts,
    selectedCategory,
    selectedMainCategory,
    searchQuery,
    categories,
  ]);

  // Filtreleri uygula
  const applyFilters = () => {
    // Burada fiyat aralığı ve konum filtrelerini uygulayabilirsiniz
    setShowFilterModal(false);
  };

  // Filtreleri sıfırla
  const resetFilters = () => {
    setPriceRange({ min: "", max: "" });
    setSelectedLocation("");
    setShowFilterModal(false);
  };

  const renderItem = ({ item }: { item: Advert }) => (
    <TouchableOpacity
      style={styles.advertItem}
      onPress={() => navigation.navigate("Advert", { advertId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.advertImage} />
      <View style={styles.advertInfo}>
        <Text style={styles.advertTitle}>{item.title}</Text>
        <Text style={styles.advertPrice}>{item.price} TL</Text>
        <Text style={styles.advertDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.advertFooter}>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{item.sellerName}</Text>
            <Text style={styles.advertDistance}>{item.distance}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIconContainer}>
        <IconView name={item.icon} size={24} color="#8adbd2" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Arama ve Filtreleme Alanı */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Ne aramıştınız?"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Kategoriler */}
      <View style={styles.categoriesContainer}>
        {selectedMainCategory !== "all" && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedMainCategory("all")}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={16} color="#8adbd2" />
            <Text style={styles.backButtonText}>Ana Kategoriler</Text>
          </TouchableOpacity>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollView}
        >
          {displayedCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.selectedCategoryItem,
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <View
                style={[
                  styles.categoryIconContainer,
                  selectedCategory === category.id &&
                    styles.selectedCategoryIconContainer,
                ]}
              >
                <IconView
                  name={category.icon}
                  size={24}
                  color={selectedCategory === category.id ? "#fff" : "#8adbd2"}
                />
              </View>
              <Text
                style={[
                  styles.categoryName,
                  selectedCategory === category.id &&
                    styles.selectedCategoryName,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Google AdMob Reklam Alanı */}
      {showAd && (
        <View style={styles.adMobContainer}>
          <View style={styles.adMobBadge}>
            <Text style={styles.adMobBadgeText}>Reklam</Text>
          </View>
          <TouchableOpacity
            style={styles.adCloseButton}
            onPress={() => setShowAd(false)}
          >
            <Text style={styles.adCloseIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.adMobContent}>
            <Image
              source={{ uri: "https://picsum.photos/400/100" }}
              style={styles.adMobImage}
              resizeMode="cover"
            />
            <View style={styles.adMobOverlay}>
              <View style={styles.googleAdInfo}>
                <Text style={styles.adMobAppName}>Getir</Text>
                <Text style={styles.adMobAppDesc}>
                  Getirle siparişler hemen kapında
                </Text>
                <View style={styles.adMobRating}>
                  <Text style={styles.adMobRatingText}>4.5 ★</Text>
                  <Text style={styles.adMobInstallText}>İNDİR</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={filteredAdverts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Filtreleme Modalı */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtreleme Seçenekleri</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {/* Fiyat Aralığı */}
              <Text style={styles.filterSectionTitle}>Fiyat Aralığı</Text>
              <View style={styles.priceRangeContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min TL"
                  keyboardType="numeric"
                  value={priceRange.min}
                  onChangeText={(text) =>
                    setPriceRange({ ...priceRange, min: text })
                  }
                />
                <Text style={styles.priceRangeSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max TL"
                  keyboardType="numeric"
                  value={priceRange.max}
                  onChangeText={(text) =>
                    setPriceRange({ ...priceRange, max: text })
                  }
                />
              </View>

              {/* Konum */}
              <Text style={styles.filterSectionTitle}>Konum</Text>
              <View style={styles.locationContainer}>
                {["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"].map(
                  (location) => (
                    <TouchableOpacity
                      key={location}
                      style={[
                        styles.locationButton,
                        selectedLocation === location &&
                          styles.selectedLocationButton,
                      ]}
                      onPress={() =>
                        setSelectedLocation(
                          location === selectedLocation ? "" : location
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.locationButtonText,
                          selectedLocation === location &&
                            styles.selectedLocationButtonText,
                        ]}
                      >
                        {location}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Butonlar */}
              <View style={styles.filterButtonsContainer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetFilters}
                >
                  <Text style={styles.resetButtonText}>Sıfırla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={applyFilters}
                >
                  <Text style={styles.applyButtonText}>Uygula</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <IconView name="account" size={24} color="#8adbd2" />
          <Text style={styles.footerButtonText}>Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddAdvert")}
        >
          <IconView name="plus" size={28} color="white" />
          <Text style={styles.addButtonText}>İlan Ver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("MessagesArea")}
        >
          <IconView name="message-text" size={24} color="#8adbd2" />
          <Text style={styles.footerButtonText}>Mesajlar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    marginLeft: 15,
    color: "#333",
  },
  categoriesContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    marginTop: 0,
    borderRadius: 15,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoriesScrollView: {
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  categoryItem: {
    alignItems: "center",
    marginHorizontal: 10,
    width: 70,
  },
  categoryIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#8adbd2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryName: {
    fontSize: 10,
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 80,
    paddingTop: 10,
  },
  advertItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  advertImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  advertInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  advertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  advertPrice: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "bold",
    marginBottom: 5,
  },
  advertDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    lineHeight: 18,
  },
  advertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  sellerInfo: {
    flexDirection: "column",
  },
  sellerName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
  },
  advertDistance: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingBottom: 10,
  },
  footerButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#8adbd2",
    justifyContent: "center",
    alignItems: "center",
    bottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 10,
    color: "white",
    marginTop: 2,
  },
  adMobContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
    height: 100,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  adMobBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#FFCC66",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    zIndex: 10,
  },
  adMobBadgeText: {
    color: "#333",
    fontSize: 10,
    fontWeight: "bold",
  },
  adMobContent: {
    flex: 1,
    flexDirection: "row",
  },
  adMobImage: {
    width: "100%",
    height: "100%",
  },
  adMobOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 8,
    height: 50,
  },
  googleAdInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adMobAppName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
    flex: 2,
  },
  adMobAppDesc: {
    fontSize: 12,
    color: "#666",
    flex: 3,
    marginHorizontal: 5,
  },
  adMobRating: {
    flexDirection: "column",
    alignItems: "center",
    flex: 2,
  },
  adMobRatingText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 3,
  },
  adMobInstallText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4285F4",
    backgroundColor: "#E8F0FE",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  adCloseButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  adCloseIcon: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    lineHeight: 14,
  },
  selectedCategoryItem: {
    // Seçili kategori için stil
  },
  selectedCategoryIconContainer: {
    backgroundColor: "#8adbd2",
  },
  selectedCategoryName: {
    color: "#8adbd2",
    fontWeight: "bold",
  },
  // Arama ve Filtreleme Stilleri
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  filterButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    fontSize: 18,
  },

  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    fontSize: 20,
    color: "#999",
  },
  modalContent: {
    padding: 15,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  priceRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  priceRangeSeparator: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#666",
  },
  locationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  locationButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedLocationButton: {
    backgroundColor: "#8adbd2",
  },
  locationButtonText: {
    fontSize: 14,
    color: "#666",
  },
  selectedLocationButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  filterButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#8adbd2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 5,
  },
  backButtonText: {
    marginLeft: 8,
    color: "#8adbd2",
    fontSize: 14,
    fontWeight: "500",
  },
});

// İlan Ver butonu için özel + ikonu bileşeni
const PlusIcon = ({ size, color }: { size: number; color: string }) => (
  <View style={{ alignItems: "center", justifyContent: "center" }}>
    <View
      style={{
        width: size * 0.6,
        height: 2,
        backgroundColor: color,
        position: "absolute",
      }}
    />
    <View
      style={{
        width: 2,
        height: size * 0.6,
        backgroundColor: color,
        position: "absolute",
      }}
    />
  </View>
);

// IconView bileşenini güncelle
const IconView = ({
  name,
  size,
  color,
}: {
  name: string;
  size: number;
  color: string;
}) => {
  // FontAwesome ikonlarını kullan
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "cellphone":
        return faMobileAlt;
      case "car":
        return faCar;
      case "home":
        return faHome;
      case "flower":
        return faLeaf;
      case "basketball":
        return faBasketballBall;
      case "book-open-variant":
        return faBook;
      case "tshirt-crew":
        return faTshirt;
      case "sofa":
        return faCouch;
      case "account":
        return faUser;
      case "message-text":
        return faEnvelope;
      case "view-grid":
        return faThLarge;
      case "plus":
        return faPlus;
      case "laptop":
        return faLaptop;
      case "tablet":
        return faTablet;
      case "television":
        return faTv;
      case "car-side":
        return faCarSide;
      case "motorcycle":
        return faMotorcycle;
      case "truck":
        return faTruck;
      case "map":
        return faMap;
      case "office-building":
        return faBuilding;
      default:
        return faThLarge;
    }
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FontAwesomeIcon icon={getIcon(name)} size={size * 0.6} color={color} />
    </View>
  );
};

export default HomeScreen;
