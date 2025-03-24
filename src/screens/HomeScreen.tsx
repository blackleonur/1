import React, { useState, useMemo, useEffect } from "react";
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
  id: number;
  name: string;
  icon: string;
  parentId?: number;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    number | "all"
  >("all");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<Category[]>([]);

  // Yenileme durumu için yeni state
  const [refreshing, setRefreshing] = useState(false);

  const [allAdverts, setAllAdverts] = useState<Advert[]>([]);

  // İlanları getiren fonksiyon
  const fetchAdverts = async () => {
    try {
      const response = await fetch(`${apiurl}/api/adverts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllAdverts(data);
    } catch (error) {
      console.error("İlanlar yüklenirken hata oluştu:", error);
      setAllAdverts([]);
    }
  };

  // Yenileme fonksiyonu
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    Promise.all([
      fetchCategories(),
      fetchAdverts(),
      selectedMainCategory === 1 ? fetchVehicleCategories() : Promise.resolve(),
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [selectedMainCategory]);

  useEffect(() => {
    fetchCategories();
    fetchAdverts();
    if (selectedMainCategory === 1) {
      fetchVehicleCategories();
    }
  }, [selectedMainCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiurl}/api/categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.$values) {
        console.error("API'den geçersiz veri formatı:", data);
        return;
      }

      // Ana kategorileri işle
      const processedCategories = data.$values.map((category: any) => {
        let icon = "view-grid";

        // Ana kategoriler için (id 1-8 arası) özel ikonlar
        if (category.id >= 1 && category.id <= 8) {
          switch (category.id) {
            case 1:
              icon = "car"; // Vasıta
              break;
            case 2:
              icon = "home"; // Emlak
              break;
            case 3:
              icon = "cellphone"; // Telefon
              break;
            case 4:
              icon = "laptop"; // Elektronik
              break;
            case 5:
              icon = "sofa"; // Ev & Yaşam
              break;
            case 6:
              icon = "tshirt-crew"; // Giyim & Aksesuar
              break;
            case 7:
              icon = "flower"; // Kişisel Bakım
              break;
            case 8:
              icon = "view-grid"; // Diğer
              break;
          }
        }

        // Ana kategoriyi ekle
        const mainCategory = {
          id: category.id,
          name: category.name,
          icon,
        };

        // Alt kategorileri işle (eğer varsa)
        const subCategories = category.children?.$values
          ? category.children.$values.map((child: any) => ({
              id: child.id,
              name: child.name,
              parentId: category.id,
              icon: "view-grid", // Alt kategoriler için varsayılan icon
            }))
          : [];

        // Ana kategori ve alt kategorileri birleştir
        return [mainCategory, ...subCategories];
      });

      // Tüm kategorileri düzleştir ve tekrar eden kategorileri filtrele
      const flattenedCategories = processedCategories.flat();
      const uniqueCategories = flattenedCategories.filter(
        (category: Category, index: number, self: Category[]) =>
          index === self.findIndex((c: Category) => c.id === category.id)
      );

      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Kategoriler yüklenirken hata oluştu:", error);
      setCategories([
        { id: 1, name: "Vasıta", icon: "car" },
        { id: 2, name: "Emlak", icon: "home" },
        { id: 3, name: "Telefon", icon: "cellphone" },
        { id: 4, name: "Elektronik", icon: "laptop" },
        { id: 5, name: "Ev & Yaşam", icon: "sofa" },
        { id: 6, name: "Giyim & Aksesuar", icon: "tshirt-crew" },
        { id: 7, name: "Kişisel Bakım", icon: "flower" },
        { id: 8, name: "Diğer", icon: "view-grid" },
      ]);
    }
  };

  const fetchVehicleCategories = async () => {
    try {
      const response = await fetch(`${apiurl}/api/vehicle-categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Tüm alt kategorileri düz bir diziye çeviren yardımcı fonksiyon
      const flattenCategories = (
        category: any,
        parentId?: number
      ): Category[] => {
        if (!category || !category.id) return [];

        const current: Category = {
          id: category.id,
          name: category.name,
          icon: category.children?.$values?.length ? "car" : "view-grid",
          parentId: parentId,
        };

        if (!category.children?.$values?.length) {
          return [current];
        }

        const children = category.children.$values
          .map((child: any) => flattenCategories(child, category.id))
          .flat();

        return [current, ...children];
      };

      const allCategories = flattenCategories(data);
      setVehicleCategories(allCategories);
    } catch (error) {
      console.error("Araç kategorileri yüklenirken hata oluştu:", error);
    }
  };

  // Görüntülenecek kategorileri belirle
  const displayedCategories = useMemo(() => {
    const validCategories = (cats: Category[]) =>
      cats.filter(
        (cat): cat is Category => typeof cat?.id === "number" && !isNaN(cat.id)
      );

    if (selectedMainCategory === "all") {
      return validCategories(categories.filter((cat) => !cat.parentId));
    } else if (selectedMainCategory === 1) {
      // Seçili kategori varsa
      if (selectedCategory !== "all" && selectedCategory !== 1) {
        const hasChildren = vehicleCategories.some(
          (cat) => cat.parentId === selectedCategory
        );

        if (hasChildren) {
          // Alt kategorileri varsa onları göster
          return validCategories(
            vehicleCategories.filter((cat) => cat.parentId === selectedCategory)
          );
        } else {
          // Alt kategorisi yoksa sadece seçili kategoriyi göster
          return validCategories(
            vehicleCategories.filter((cat) => cat.id === selectedCategory)
          );
        }
      }
      // Ana vasıta kategorisindeyse, ilk seviye alt kategorileri göster
      return validCategories(
        vehicleCategories.filter((cat) => cat.parentId === 1)
      );
    } else {
      // Diğer kategoriler için
      const hasChildren = categories.some(
        (cat) => cat.parentId === selectedMainCategory
      );

      if (hasChildren) {
        return validCategories(
          categories.filter((cat) => cat.parentId === selectedMainCategory)
        );
      } else {
        return validCategories(
          categories.filter((cat) => cat.id === selectedMainCategory)
        );
      }
    }
  }, [selectedMainCategory, selectedCategory, categories, vehicleCategories]);

  // Geri butonu için yeni fonksiyon
  const handleBackButton = () => {
    if (selectedCategory !== "all") {
      // Alt kategoriden bir üst kategoriye dön
      const parentCategory = vehicleCategories.find(
        (cat) => cat.id === selectedCategory
      )?.parentId;
      if (parentCategory) {
        setSelectedCategory(parentCategory);
      } else {
        setSelectedCategory("all");
      }
    } else {
      // Ana kategorilere dön
      setSelectedMainCategory("all");
      setSelectedCategory("all");
    }
  };

  // handleCategorySelect fonksiyonunu güncelle
  const handleCategorySelect = (categoryId: number) => {
    const category =
      selectedMainCategory === 1
        ? vehicleCategories.find((cat) => cat.id === categoryId)
        : categories.find((cat) => cat.id === categoryId);

    if (selectedMainCategory === 1) {
      // Vasıta kategorisi içindeyiz
      const hasChildren = vehicleCategories.some(
        (cat) => cat.parentId === categoryId
      );
      setSelectedCategory(categoryId); // Her durumda kategoriyi seç
    } else {
      // Diğer ana kategoriler
      if (category?.parentId) {
        setSelectedCategory(categoryId);
      } else {
        setSelectedMainCategory(categoryId);
        setSelectedCategory("all");
      }
    }
  };

  // Filtrelenmiş ilanları hesapla
  const filteredAdverts = useMemo(() => {
    let filtered = allAdverts;

    // Kategori filtresi
    if (selectedCategory !== "all") {
      // Alt kategori seçilmişse sadece o kategorinin ilanlarını göster
      filtered = filtered.filter(
        (advert) => Number(advert.category) === selectedCategory
      );
    } else if (selectedMainCategory !== "all") {
      // Ana kategori seçilmişse, o kategoriye ait tüm alt kategorilerin ilanlarını göster
      const subCategories = categories
        .filter((cat) => cat.parentId === selectedMainCategory)
        .map((cat) => cat.id);

      filtered = filtered.filter((advert) =>
        subCategories.includes(Number(advert.category))
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
        {(selectedMainCategory !== "all" || selectedCategory !== "all") && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackButton}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={16} color="#8adbd2" />
            <Text style={styles.backButtonText}>
              {selectedCategory !== "all" ? "Geri" : "Ana Kategoriler"}
            </Text>
          </TouchableOpacity>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollView}
        >
          {displayedCategories.map((category) => (
            <TouchableOpacity
              key={`category-${category.id}`}
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

      <FlatList
        data={filteredAdverts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
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
