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
import { RootStackParamList } from "../Types";
import apiurl from "../Apiurl";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  faShoppingBag,
  faHeart,
  faImage,
  faChevronUp,
  faChevronDown,
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

// Advert tipini güncelleyelim
type Advert = {
  id: string;
  title: string;
  price: number;
  description: string;
  sellerName: string;
  distance: string;
  location: string;
  imageUrl: string;
  images: { 
    $values: Array<{ url: string }> // imageUrl yerine url
  };
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

  // Kategori seçimi için state'leri ekleyelim
  const [selectedFilterCategories, setSelectedFilterCategories] = useState<number[]>([]);
  const [currentFilterLevel, setCurrentFilterLevel] = useState(0);

  // Yeni state'leri ekleyelim
  const [kmRange, setKmRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });

  const [modelRange, setModelRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });

  // Yeni state'leri ekleyelim
  const [enginePower, setEnginePower] = useState<string[]>([]);
  const [engineSize, setEngineSize] = useState<string[]>([]);
  const [bodyType, setBodyType] = useState<string>("");
  const [transmission, setTransmission] = useState<string>("");
  const [fuelType, setFuelType] = useState<string>("");

  // İki ayrı state ekleyelim
  const [isEngineSizeExpanded, setIsEngineSizeExpanded] = useState(false);
  const [isEnginePowerExpanded, setIsEnginePowerExpanded] = useState(false);

  // Sabit seçenekleri tanımlayalım
  const BODY_TYPES = [
    "Sedan",
    "Hatchback",
    "Station Wagon",
    "SUV",
    "Crossover",
    "Pickup",
    "Van",
  ];

  const TRANSMISSION_TYPES = [
    "Manuel",
    "Otomatik",
    "Yarı Otomatik",
    "CVT",
  ];

  const FUEL_TYPES = [
    "Benzin",
    "Dizel",
    "LPG",
    "Hibrit",
    "Elektrik",
    "Benzin & LPG",
  ];

  // Sabit motor hacmi seçeneklerini ekleyelim
  const ENGINE_SIZES = [
    "0 - 49 cm³",
    "50 - 125 cm³",
    "126 - 250 cm³",
    "251 - 400 cm³",
    "401 - 600 cm³",
    "601 - 750 cm³",
    "751 - 900 cm³",
    "901 - 1000 cm³",
    "1001 - 1200 cm³",
    "1301 - 1600 cm³",
    "1601 - 1800 cm³",
    "1801 - 2000 cm³",
    "2001 - 2500 cm³",
    "2501 - 3000 cm³",
    "3001 - 3500 cm³",
    "3501 - 4000 cm³",
    "4001 - 4500 cm³",
    "4501 - 5000 cm³",
    "5001 - 5500 cm³",
    "5501 - 6000 cm³",
    "6001 cm³ ve üzeri",
  ];

  // Motor gücü seçeneklerini ekle
  const ENGINE_POWERS = [
    "25 hp'ye kadar",
    "26 - 50 hp",
    "51 - 75 hp",
    "76 - 100 hp",
    "101 - 125 hp",
    "126 - 150 hp",
    "151 - 175 hp",
    "176 - 200 hp",
    "201 - 225 hp",
    "226 - 250 hp",
    "251 - 275 hp",
    "276 - 300 hp",
    "301 - 325 hp",
    "326 - 350 hp",
    "351 - 375 hp",
    "376 - 400 hp",
    "401 - 425 hp",
    "426 - 450 hp",
    "451 - 475 hp",
    "476 - 500 hp",
    "501 - 525 hp",
    "526 - 550 hp",
    "551 - 575 hp",
    "576 - 600 hp",
    "601 hp ve üzeri"
  ];

  // İlanları getiren fonksiyon
  const fetchAdverts = async (filters?: {
    keyword?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    minKm?: number;
    maxKm?: number;
    minModelYear?: number;
    maxModelYear?: number;
    enginePowers?: string[];
    engineSizes?: string[];
    bodyType?: string;
    transmission?: string;
    fuelType?: string;
  }) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("Token bulunamadı");
        return;
      }

      // Query parametrelerini oluştur
      const queryParams = new URLSearchParams();
      if (filters?.keyword) queryParams.append('keyword', filters.keyword);
      if (filters?.categoryId) queryParams.append('categoryId', filters.categoryId.toString());
      if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters?.minKm) queryParams.append('minKm', filters.minKm.toString());
      if (filters?.maxKm) queryParams.append('maxKm', filters.maxKm.toString());
      if (filters?.minModelYear) queryParams.append('minModelYear', filters.minModelYear.toString());
      if (filters?.maxModelYear) queryParams.append('maxModelYear', filters.maxModelYear.toString());
      if (filters?.enginePowers?.length) queryParams.append('enginePowers', filters.enginePowers.join(','));
      if (filters?.engineSizes?.length) queryParams.append('engineSizes', filters.engineSizes.join(','));
      if (filters?.bodyType) queryParams.append('bodyType', filters.bodyType);
      if (filters?.transmission) queryParams.append('transmission', filters.transmission);
      if (filters?.fuelType) queryParams.append('fuelType', filters.fuelType);

      const queryString = queryParams.toString();
      const url = `${apiurl}/api/ad-listings/search${queryString ? `?${queryString}` : ''}`;

      console.log('API Request URL:', url); // Debug için URL'i logla

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug için response'u logla

      if (data && Array.isArray(data.$values)) {
        const processedAdverts = data.$values.map((advert: any) => ({
          ...advert,
          images: advert.images || { $values: [] }
        }));
        setAllAdverts(processedAdverts);
        console.log('Processed Adverts:', processedAdverts); // Debug için işlenmiş ilanları logla
      } else {
        console.error("API'den geçersiz veri formatı:", data);
        setAllAdverts([]);
      }
    } catch (error) {
      console.error("İlanlar yüklenirken hata oluştu:", error);
      setAllAdverts([]);
    }
  };

  // Kategoriye göre ilanları getiren fonksiyon
  const fetchAdvertsByCategory = async (categoryId: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("Token bulunamadı");
        return;
      }

      const response = await fetch(
        `${apiurl}/api/ad-listings/category/${categoryId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && Array.isArray(data.$values)) {
        setAllAdverts(data.$values);
      } else {
        console.error("API'den geçersiz veri formatı:", data);
        setAllAdverts([]);
      }
    } catch (error) {
      console.error("Kategori ilanları yüklenirken hata oluştu:", error);
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

  useEffect(() => {
    // Eğer seçili kategori araç kategorisi (id: 1) ise, araç kategorilerini getir
    if (selectedFilterCategories[0] === 1) {
      fetchVehicleCategories();
    }
  }, [selectedFilterCategories]);

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

  // Geri butonu için fonksiyonu güncelle
  const handleBackButton = async () => {
    try {
      if (selectedCategory !== "all") {
        // Alt kategoriden bir üst kategoriye dön
        const parentCategory = vehicleCategories.find(
          (cat) => cat.id === selectedCategory
        )?.parentId;
        
        if (parentCategory) {
          setSelectedCategory(parentCategory);
          // Üst kategorinin ilanlarını getir
          await fetchCategoryAdverts(parentCategory);
        } else {
          setSelectedCategory("all");
          // Ana kategorinin ilanlarını getir
          if (selectedMainCategory !== "all") {
            await fetchCategoryAdverts(selectedMainCategory);
          }
        }
      } else {
        // Ana kategorilere dön
        setSelectedMainCategory("all");
        setSelectedCategory("all");
        // Tüm ilanları getir
        await fetchAdverts();
      }
    } catch (error) {
      console.error("Geri dönüşte hata oluştu:", error);
    }
  };

  // handleCategorySelect fonksiyonunu da düzenleyelim
  const handleCategorySelect = async (categoryId: number) => {
    try {
      if (selectedMainCategory === 1) {
        // Vasıta kategorisi içindeyiz
        const hasChildren = vehicleCategories.some(
          (cat) => cat.parentId === categoryId
        );
        setSelectedCategory(categoryId);
        // Her durumda API'ye istek at
        await fetchCategoryAdverts(categoryId);
      } else {
        const category = categories.find((cat) => cat.id === categoryId);
        if (category?.parentId) {
          // Alt kategori seçildi
          setSelectedCategory(categoryId);
        } else {
          // Ana kategori seçildi
          setSelectedMainCategory(categoryId);
          setSelectedCategory("all");
        }
        // Her durumda API'ye istek at
        await fetchCategoryAdverts(categoryId);
      }
    } catch (error) {
      console.error("Kategori ilanları yüklenirken hata oluştu:", error);
      setAllAdverts([]);
    }
  };

  // API'den kategori ilanlarını getiren yardımcı fonksiyon
  const fetchCategoryAdverts = async (categoryId: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("Token bulunamadı");
        return;
      }

      // Önce kategorinin alt kategorilerini al
      const subCategoriesResponse = await fetch(`${apiurl}/api/categories/${categoryId}/subcategories`);
      const subCategoriesData = await subCategoriesResponse.json();
      
      // Ana kategori ve alt kategorilerin ID'lerini birleştir
      const categoryIds = [categoryId];
      if (subCategoriesData && Array.isArray(subCategoriesData.$values)) {
        categoryIds.push(...subCategoriesData.$values.map((cat: any) => cat.id));
      }

      // Tüm kategorilerin ilanlarını al
      const advertPromises = categoryIds.map(id => 
        fetch(`${apiurl}/api/ad-listings/category/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).then(res => res.json())
      );

      const advertsResponses = await Promise.all(advertPromises);
      
      // Gelen veriyi kontrol et
      console.log('Category Adverts Response:', JSON.stringify(advertsResponses[0], null, 2));
      
      // Tüm ilanları birleştir ve işle
      const allAdverts = advertsResponses.flatMap(response => {
        if (response && Array.isArray(response.$values)) {
          return response.$values.map((advert: any) => ({
            ...advert,
            id: advert.id,
            title: advert.title,
            price: advert.price,
            description: advert.description,
            images: {
              $values: advert.images?.$values || [{ url: advert.imageUrl }]
            }
          }));
        }
        return [];
      });

      setAllAdverts(allAdverts);
    } catch (error) {
      console.error("Kategori ilanları yüklenirken hata oluştu:", error);
      setAllAdverts([]);
    }
  };

  // filteredAdverts fonksiyonunu güncelleyelim
  const filteredAdverts = useMemo(() => {
    let filtered = allAdverts;

    // Sadece arama filtresi uygula, kategori filtresi API'den geliyor
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((advert) => {
        // Null check ekleyelim
        const title = advert.title?.toLowerCase() || '';
        const description = advert.description?.toLowerCase() || '';
        const location = advert.location?.toLowerCase() || '';

        return (
          title.includes(query) ||
          description.includes(query) ||
          location.includes(query)
        );
      });
    }

    return filtered;
  }, [allAdverts, searchQuery]);

  // Filtreleri uygula
  const applyFilters = async () => {
    try {
      const filters = {
        keyword: searchQuery,
        categoryId: selectedFilterCategories.length > 0 ? 
          selectedFilterCategories[selectedFilterCategories.length - 1] : undefined,
        minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
        maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
        minKm: kmRange.min ? parseInt(kmRange.min) : undefined,
        maxKm: kmRange.max ? parseInt(kmRange.max) : undefined,
        minModelYear: modelRange.min ? parseInt(modelRange.min) : undefined,
        maxModelYear: modelRange.max ? parseInt(modelRange.max) : undefined,
        enginePowers: enginePower.length > 0 ? enginePower : undefined,
        engineSizes: engineSize.length > 0 ? engineSize : undefined,
        bodyType: bodyType || undefined,
        transmission: transmission || undefined,
        fuelType: fuelType || undefined,
      };

      console.log('Applying filters:', filters); // Debug için filtreleri logla
      await fetchAdverts(filters);
      setShowFilterModal(false);
    } catch (error) {
      console.error("Filtreler uygulanırken hata oluştu:", error);
    }
  };

  // searchQuery değiştiğinde filtrelemeyi uygula
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdverts({ keyword: searchQuery });
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // resetFilters fonksiyonunu güncelleyelim
  const resetFilters = async () => {
    setPriceRange({ min: "", max: "" });
    setSelectedLocation("");
    setSearchQuery("");
    setSelectedFilterCategories([]);
    setCurrentFilterLevel(0);
    setKmRange({ min: "", max: "" });
    setModelRange({ min: "", max: "" });
    setEnginePower([]);
    setEngineSize([]);
    setBodyType("");
    setTransmission("");
    setFuelType("");
    await fetchAdverts();
    setShowFilterModal(false);
  };

  const renderItem = ({ item }: { item: Advert }) => {
    // url'i kullan
    const imageUrl = item.images?.$values?.[0]?.url;

    return (
      <TouchableOpacity
        style={styles.advertItem}
        onPress={() => navigation.navigate("Advert", { advertId: item.id })}
      >
        <View style={styles.advertImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.advertImage}
              resizeMode="cover"
              onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
          ) : (
            <View style={styles.defaultImageContainer}>
              <FontAwesomeIcon 
                icon={faImage} 
                size={40} 
                color="#cccccc"
              />
            </View>
          )}
        </View>
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
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIconContainer}>
        <IconView name={item.icon} size={24} color="#8adbd2" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Boş durum bileşenini ekleyelim
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <FontAwesomeIcon icon={faImage} size={50} color="#cccccc" />
      <Text style={styles.emptyText}>
        Henüz bu kategoride çevrenizde gösterilecek bir ilan bulunmamaktadır
      </Text>
    </View>
  );

  // Filtreleme modalının içeriğini güncelleyelim
  const renderFilterModal = () => {
    // Seçili kategorilerin isimlerini getiren yardımcı fonksiyon
    const getSelectedCategoryPath = () => {
      if (selectedFilterCategories.length === 0) return "";

      return selectedFilterCategories.map((categoryId, index) => {
        const categoryList = categoryId === 1 || selectedFilterCategories[0] === 1 
          ? vehicleCategories 
          : categories;
        const category = categoryList.find(cat => cat.id === categoryId);
        return category?.name || "";
      }).filter(Boolean).join(" > ");
    };

    // Alt kategorileri getiren yardımcı fonksiyon
    const getSubCategories = () => {
      const currentParentId = selectedFilterCategories[selectedFilterCategories.length - 1];
      const isVehicleCategory = selectedFilterCategories[0] === 1;
      const categoryList = isVehicleCategory ? vehicleCategories : categories;

      // Seçili kategorinin alt kategorilerini filtrele
      const subCategories = categoryList.filter(cat => cat.parentId === currentParentId);
      
      // Debug için log ekleyelim
      console.log('Current Parent ID:', currentParentId);
      console.log('Is Vehicle Category:', isVehicleCategory);
      console.log('Category List:', categoryList);
      console.log('Sub Categories:', subCategories);
      
      return subCategories;
    };

    // Alt kategori kontrolü için yardımcı fonksiyon
    const hasSubCategories = (categoryId: number) => {
      const isVehicleCategory = selectedFilterCategories[0] === 1;
      const categoryList = isVehicleCategory ? vehicleCategories : categories;
      return categoryList.some(cat => cat.parentId === categoryId);
    };

    // Vasıta kategorisi seçili mi kontrolü
    const isVehicleSelected = selectedFilterCategories[0] === 1;

    return (
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={[
          styles.modalOverlay,
          isVehicleSelected && styles.modalOverlayVehicle
        ]}>
          <View style={[
            styles.modalContainer,
            isVehicleSelected && styles.modalContainerVehicle
          ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtreleme Seçenekleri</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Kategori Seçimi */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Kategori</Text>
                {selectedFilterCategories.length > 0 && (
                  <View style={styles.selectedCategoryPath}>
                    <Text style={styles.selectedCategoryPathText}>
                      {getSelectedCategoryPath()}
                    </Text>
                  </View>
                )}
                <View style={styles.categoriesFilterContainer}>
                  {currentFilterLevel === 0 ? (
                    // Ana kategoriler
                    <View style={styles.categoriesGrid}>
                      {categories
                        .filter(cat => !cat.parentId)
                        .map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={[
                              styles.categoryFilterButton,
                              selectedFilterCategories[0] === category.id && 
                              styles.selectedCategoryFilterButton,
                            ]}
                            onPress={() => {
                              setSelectedFilterCategories([category.id]);
                              if (category.id === 1) {
                                // Vasıta kategorisi seçildiğinde hemen fetchVehicleCategories'i çağır
                                fetchVehicleCategories().then(() => {
                                  if (hasSubCategories(category.id)) {
                                    setCurrentFilterLevel(1);
                                  }
                                });
                              } else if (hasSubCategories(category.id)) {
                                setCurrentFilterLevel(1);
                              }
                            }}
                          >
                            <Text
                              style={[
                                styles.categoryFilterText,
                                selectedFilterCategories[0] === category.id && 
                                styles.selectedCategoryFilterText,
                              ]}
                            >
                              {category.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  ) : (
                    // Alt kategoriler
                    <>
                      <TouchableOpacity
                        style={styles.backFilterButton}
                        onPress={() => {
                          setCurrentFilterLevel(currentFilterLevel - 1);
                          setSelectedFilterCategories(prev => prev.slice(0, -1));
                        }}
                      >
                        <FontAwesomeIcon icon={faArrowLeft} size={16} color="#8adbd2" />
                        <Text style={styles.backFilterText}>Geri</Text>
                      </TouchableOpacity>
                      <View style={styles.categoriesGrid}>
                        {getSubCategories().map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={[
                              styles.categoryFilterButton,
                              selectedFilterCategories.includes(category.id) && 
                              styles.selectedCategoryFilterButton,
                            ]}
                            onPress={() => {
                              const newSelectedCategories = [...selectedFilterCategories, category.id];
                              setSelectedFilterCategories(newSelectedCategories);
                              
                              // Alt kategorisi varsa bir sonraki seviyeye geç
                              if (hasSubCategories(category.id)) {
                                setCurrentFilterLevel(currentFilterLevel + 1);
                              }
                            }}
                          >
                            <Text
                              style={[
                                styles.categoryFilterText,
                                selectedFilterCategories.includes(category.id) && 
                                styles.selectedCategoryFilterText,
                              ]}
                            >
                              {category.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Fiyat Aralığı */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Fiyat Aralığı</Text>
                <View style={styles.priceRangeContainer}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min TL"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={priceRange.min}
                    onChangeText={(text) => setPriceRange({ ...priceRange, min: text })}
                  />
                  <Text style={styles.priceRangeSeparator}>-</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max TL"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={priceRange.max}
                    onChangeText={(text) => setPriceRange({ ...priceRange, max: text })}
                  />
                </View>
              </View>

              {/* Vasıta kategorisi seçiliyse ek filtreler */}
              {isVehicleSelected && (
                <>
                  {/* Kilometre Aralığı */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Kilometre</Text>
                    <View style={styles.priceRangeContainer}>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="Min KM"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={kmRange.min}
                        onChangeText={(text) => setKmRange({ ...kmRange, min: text })}
                      />
                      <Text style={styles.priceRangeSeparator}>-</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="Max KM"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={kmRange.max}
                        onChangeText={(text) => setKmRange({ ...kmRange, max: text })}
                      />
                    </View>
                  </View>

                  {/* Model Yılı Aralığı */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Model Yılı</Text>
                    <View style={styles.priceRangeContainer}>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="Min Yıl"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={modelRange.min}
                        onChangeText={(text) => setModelRange({ ...modelRange, min: text })}
                      />
                      <Text style={styles.priceRangeSeparator}>-</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="Max Yıl"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={modelRange.max}
                        onChangeText={(text) => setModelRange({ ...modelRange, max: text })}
                      />
                    </View>
                  </View>

                  {/* Motor Gücü */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Motor Gücü</Text>
                    <TouchableOpacity
                      style={[
                        styles.engineSizeCollapsed,
                        enginePower.length > 0 && styles.engineSizeCollapsedSelected
                      ]}
                      onPress={() => setIsEnginePowerExpanded(!isEnginePowerExpanded)}
                    >
                      <Text style={[
                        styles.engineSizeCollapsedText,
                        enginePower.length > 0 && styles.engineSizeCollapsedTextSelected
                      ]}>
                        {enginePower.length > 0 
                          ? `${enginePower.length} Motor Gücü Seçildi`
                          : "Motor Gücü Seçin"}
                      </Text>
                      <FontAwesomeIcon 
                        icon={isEnginePowerExpanded ? faChevronUp : faChevronDown} 
                        size={18}
                        color={enginePower.length > 0 ? "#fff" : "#666"}
                      />
                    </TouchableOpacity>

                    {isEnginePowerExpanded && (
                      <ScrollView 
                        style={styles.engineSizeContainer}
                        showsVerticalScrollIndicator={true}
                      >
                        {ENGINE_POWERS.map((power) => (
                          <TouchableOpacity
                            key={power}
                            style={[
                              styles.engineSizeButton,
                              enginePower.includes(power) && styles.selectedOptionButton,
                            ]}
                            onPress={() => {
                              setEnginePower(prev => {
                                if (prev.includes(power)) {
                                  return prev.filter(item => item !== power);
                                } else {
                                  return [...prev, power];
                                }
                              });
                            }}
                          >
                            <Text
                              style={[
                                styles.engineSizeText,
                                enginePower.includes(power) && styles.selectedOptionText,
                              ]}
                            >
                              {power}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>

                  {/* Motor Hacmi */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Motor Hacmi</Text>
                    <TouchableOpacity
                      style={[
                        styles.engineSizeCollapsed,
                        engineSize.length > 0 && styles.engineSizeCollapsedSelected
                      ]}
                      onPress={() => setIsEngineSizeExpanded(!isEngineSizeExpanded)}
                    >
                      <Text style={[
                        styles.engineSizeCollapsedText,
                        engineSize.length > 0 && styles.engineSizeCollapsedTextSelected
                      ]}>
                        {engineSize.length > 0 
                          ? `${engineSize.length} Motor Hacmi Seçildi`
                          : "Motor Hacmi Seçin"}
                      </Text>
                      <FontAwesomeIcon 
                        icon={isEngineSizeExpanded ? faChevronUp : faChevronDown} 
                        size={18}
                        color={engineSize.length > 0 ? "#fff" : "#666"}
                      />
                    </TouchableOpacity>

                    {isEngineSizeExpanded && (
                      <ScrollView 
                        style={styles.engineSizeContainer}
                        showsVerticalScrollIndicator={true}
                      >
                        {ENGINE_SIZES.map((size) => (
                          <TouchableOpacity
                            key={size}
                            style={[
                              styles.engineSizeButton,
                              engineSize.includes(size) && styles.selectedOptionButton,
                            ]}
                            onPress={() => {
                              setEngineSize(prev => {
                                if (prev.includes(size)) {
                                  return prev.filter(item => item !== size);
                                } else {
                                  return [...prev, size];
                                }
                              });
                            }}
                          >
                            <Text
                              style={[
                                styles.engineSizeText,
                                engineSize.includes(size) && styles.selectedOptionText,
                              ]}
                            >
                              {size}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>

                  {/* Kasa Tipi */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Kasa Tipi</Text>
                    <View style={styles.optionsContainer}>
                      {BODY_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.optionButton,
                            bodyType === type && styles.selectedOptionButton,
                          ]}
                          onPress={() => setBodyType(bodyType === type ? "" : type)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              bodyType === type && styles.selectedOptionText,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Vites */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Vites</Text>
                    <View style={styles.optionsContainer}>
                      {TRANSMISSION_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.optionButton,
                            transmission === type && styles.selectedOptionButton,
                          ]}
                          onPress={() => setTransmission(transmission === type ? "" : type)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              transmission === type && styles.selectedOptionText,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Yakıt */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Yakıt</Text>
                    <View style={styles.optionsContainer}>
                      {FUEL_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.optionButton,
                            fuelType === type && styles.selectedOptionButton,
                          ]}
                          onPress={() => setFuelType(fuelType === type ? "" : type)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              fuelType === type && styles.selectedOptionText,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {/* Butonlar */}
              <View style={styles.filterButtonsContainer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    resetFilters();
                    setSelectedFilterCategories([]);
                    setCurrentFilterLevel(0);
                    setKmRange({ min: "", max: "" });
                    setModelRange({ min: "", max: "" });
                    setEnginePower([]);
                    setEngineSize([]);
                    setBodyType("");
                    setTransmission("");
                    setFuelType("");
                  }}
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
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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

      {/* Ana içerik alanı */}
      <View style={styles.mainContent}>
        <FlatList
          data={filteredAdverts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={EmptyListComponent}
        />
      </View>

      {/* Filtreleme Modalı */}
      {renderFilterModal()}

      {/* Alt Navigasyon Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <FontAwesomeIcon icon={faUser} size={24} color="#8adbd2" />
          <Text style={styles.bottomNavText}>Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("MyAds")}
        >
          <FontAwesomeIcon icon={faShoppingBag} size={24} color="#8adbd2" />
          <Text style={styles.bottomNavText}>İlanlarım</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddAdvert", { adId: undefined })}
        >
          <FontAwesomeIcon icon={faPlus} size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Favs")}
        >
          <FontAwesomeIcon icon={faHeart} size={24} color="#8adbd2" />
          <Text style={styles.bottomNavText}>Favoriler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("MessagesArea")}
        >
          <FontAwesomeIcon icon={faEnvelope} size={24} color="#8adbd2" />
          <Text style={styles.bottomNavText}>Mesajlarım</Text>
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
    marginBottom: 10,
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
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  advertItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden', // Taşan içeriği gizle
  },
  advertImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  advertImage: {
    width: '100%',
    height: '100%',
  },
  defaultImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
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
    backgroundColor: "#8adbd2",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    justifyContent: "flex-start",
  },
  modalOverlayVehicle: {
    justifyContent: "center", // Vasıta seçildiğinde modalı ortala
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "90%",
    marginTop: 50,
  },
  modalContainerVehicle: {
    marginTop: 0,
    borderRadius: 20,
    maxHeight: "85%",
    marginHorizontal: 15,
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
  modalScrollContent: {
    paddingBottom: 10,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  priceRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  priceRangeSeparator: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#666",
  },
  locationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    paddingHorizontal: 5,
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
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },
  mainContent: {
    flex: 1,
    marginBottom: 60,
  },
  categoriesFilterContainer: {
    marginTop: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryFilterButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 5,
    minWidth: '30%',
  },
  selectedCategoryFilterButton: {
    backgroundColor: '#8adbd2',
    borderColor: '#8adbd2',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedCategoryFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  backFilterText: {
    marginLeft: 8,
    color: '#8adbd2',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryPath: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
  },
  selectedCategoryPathText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  fullWidthInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginHorizontal: -5,
  },
  
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 5,
  },
  
  selectedOptionButton: {
    backgroundColor: '#8adbd2',
  },
  
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },

  engineSizeCollapsed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    height: 56,
  },

  engineSizeCollapsedSelected: {
    backgroundColor: '#8adbd2',
  },

  engineSizeCollapsedText: {
    fontSize: 15,
    color: '#333',
  },

  engineSizeCollapsedTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },

  engineSizeContainer: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 8,
  },

  engineSizeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },

  engineSizeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },

  placeholderText: {
    color: '#999',
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
