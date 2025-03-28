import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../Types";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faArrowLeft,
  faCamera,
  faChevronDown,
  faChevronRight,
  faMapMarkerAlt,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import apiurl from "../Apiurl";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import TokenService from "../services/TokenService";

type Props = StackScreenProps<RootStackParamList, "AddAdvert">;

// Kategori tipleri
type Category = {
  id: number;
  name: string;
  parentId?: number;
  icon?: string;
};

const AddAdvertScreen: React.FC<Props> = ({ navigation }): JSX.Element => {
  // State'ler
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [currentPickerLevel, setCurrentPickerLevel] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [addressDetails, setAddressDetails] = useState({
    city: "",
    district: "",
    neighborhood: "",
    street: "",
    latitude: 0,
    longitude: 0,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Araç kategorilerini getiren fonksiyon
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

      // Tekrar eden kategorileri filtrele
      const uniqueCategories = allCategories.filter(
        (category, index, self) =>
          index === self.findIndex((c) => c.id === category.id)
      );

      setVehicleCategories(uniqueCategories);
    } catch (error) {
      console.error("Araç kategorileri yüklenirken hata oluştu:", error);
    }
  };

  // Kategorileri getiren fonksiyon
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

      const flattenCategories = (
        category: any,
        parentId?: number
      ): Category[] => {
        if (!category || !category.id) return [];

        const current: Category = {
          id: category.id,
          name: category.name,
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

      const allCategories = data.$values
        .map((category: any) => flattenCategories(category))
        .flat();

      // Tekrar eden kategorileri filtrele
      const uniqueCategories = allCategories.filter(
        (category: Category, index: number, self: Category[]) =>
          index === self.findIndex((c: Category) => c.id === category.id)
      );

      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Kategoriler yüklenirken hata oluştu:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Eğer seçili kategori araç kategorisi (id: 1) ise, araç kategorilerini getir
    if (selectedCategories[0] === 1) {
      fetchVehicleCategories();
    }
  }, [selectedCategories]);

  // Kategori seçme fonksiyonu
  const handleCategorySelect = (categoryId: number, level: number) => {
    // Seçilen seviyeden sonraki tüm seçimleri temizle
    const newSelectedCategories = selectedCategories.slice(0, level);

    // Yeni kategoriyi ekle
    newSelectedCategories[level] = categoryId;
    setSelectedCategories(newSelectedCategories);

    // Eğer seçilen kategori araç kategorisi ise, araç kategorilerini getir
    if (categoryId === 1 && level === 0) {
      fetchVehicleCategories();
    }
  };

  // Kategori seviyesini render etme
  const renderCategoryLevel = (level: number) => {
    // Eğer önceki seviye seçilmemişse, bu seviyeyi gösterme
    if (level > 0 && !selectedCategories[level - 1]) {
      return null;
    }

    let categoryList: Category[] = [];
    const parentId = level === 0 ? undefined : selectedCategories[level - 1];

    if (level === 0) {
      // Ana kategoriler
      categoryList = categories.filter((cat) => !cat.parentId);
    } else if (selectedCategories[0] === 1 && level === 1) {
      // Araç alt kategorileri
      categoryList = vehicleCategories.filter((cat) => cat.parentId === 1);
    } else if (selectedCategories[0] === 1 && level > 1) {
      // Araç alt-alt kategorileri
      categoryList = vehicleCategories.filter(
        (cat) => cat.parentId === selectedCategories[level - 1]
      );
    } else {
      // Diğer kategorilerin alt kategorileri
      categoryList = categories.filter((cat) => cat.parentId === parentId);
    }

    if (categoryList.length === 0) return null;

    if (level === 0) {
      // Ana kategoriler için grid görünümü
      return (
        <View key={`level-${level}`} style={styles.categoryLevel}>
          <Text style={styles.inputLabel}>Ana Kategori</Text>
          <View style={styles.categoriesContainer}>
            {categoryList.map((category) => (
              <TouchableOpacity
                key={`cat-${level}-${category.id}`}
                style={[
                  styles.categoryButton,
                  selectedCategories[level] === category.id &&
                    styles.selectedCategoryButton,
                ]}
                onPress={() => handleCategorySelect(category.id, level)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategories[level] === category.id &&
                      styles.selectedCategoryButtonText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } else {
      // Alt kategoriler için picker butonu
      const selectedCategory = categoryList.find(
        (cat) => cat.id === selectedCategories[level]
      );

      return (
        <View key={`level-${level}`} style={styles.categoryLevel}>
          <Text style={[styles.inputLabel, { marginTop: 20 }]}>
            {`${level}. Alt Kategori`}
          </Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              setCurrentPickerLevel(level);
              setShowPicker(true);
            }}
          >
            <Text style={styles.pickerButtonText}>
              {selectedCategory ? selectedCategory.name : "Alt kategori seçin"}
            </Text>
            <FontAwesomeIcon icon={faChevronDown} size={16} color="#666" />
          </TouchableOpacity>
        </View>
      );
    }
  };

  // Picker modalını render etme
  const renderPickerModal = () => {
    let categoryList: Category[] = [];
    const parentId =
      currentPickerLevel === 0
        ? undefined
        : selectedCategories[currentPickerLevel - 1];

    if (selectedCategories[0] === 1 && currentPickerLevel === 1) {
      categoryList = vehicleCategories.filter((cat) => cat.parentId === 1);
    } else if (selectedCategories[0] === 1 && currentPickerLevel > 1) {
      categoryList = vehicleCategories.filter(
        (cat) => cat.parentId === selectedCategories[currentPickerLevel - 1]
      );
    } else {
      categoryList = categories.filter((cat) => cat.parentId === parentId);
    }

    return (
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text
                style={styles.modalTitle}
              >{`${currentPickerLevel}. Alt Kategori Seçin`}</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {categoryList.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.modalItem,
                    selectedCategories[currentPickerLevel] === category.id &&
                      styles.selectedModalItem,
                  ]}
                  onPress={() => {
                    handleCategorySelect(category.id, currentPickerLevel);
                    setShowPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedCategories[currentPickerLevel] === category.id &&
                        styles.selectedModalItemText,
                    ]}
                  >
                    {category.name}
                  </Text>
                  {(selectedCategories[0] === 1
                    ? vehicleCategories.some(
                        (cat) => cat.parentId === category.id
                      )
                    : categories.some(
                        (cat) => cat.parentId === category.id
                      )) && (
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      size={16}
                      color={
                        selectedCategories[currentPickerLevel] === category.id
                          ? "#8adbd2"
                          : "#ccc"
                      }
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Sonraki seviyede kategori olup olmadığını kontrol eden fonksiyon
  const hasNextLevelCategories = (currentLevel: number): boolean => {
    if (currentLevel < 0) return false;

    const currentCategoryId = selectedCategories[currentLevel];
    if (!currentCategoryId) return false;

    if (selectedCategories[0] === 1) {
      // Araç kategorileri için kontrol
      return vehicleCategories.some(
        (cat) => cat.parentId === currentCategoryId
      );
    } else {
      // Diğer kategoriler için kontrol
      return categories.some((cat) => cat.parentId === currentCategoryId);
    }
  };

  // Kategori seçiminin tamamlanıp tamamlanmadığını kontrol eden fonksiyon
  const isCategorySelectionComplete = (): boolean => {
    let lastSelectedLevel = -1;

    // Son seçili seviyeyi bul
    for (let i = selectedCategories.length - 1; i >= 0; i--) {
      if (selectedCategories[i]) {
        lastSelectedLevel = i;
        break;
      }
    }

    // Son seçili seviyeden sonra alt kategori var mı kontrol et
    return !hasNextLevelCategories(lastSelectedLevel);
  };

  // Fotoğraf ekleme fonksiyonu
  const addPhoto = async () => {
    if (photos.length >= 10) {
      Alert.alert("Uyarı", "En fazla 10 fotoğraf ekleyebilirsiniz.");
      return;
    }

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Hata", "Galeri izni gerekli");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri) {
          setPhotos([...photos, asset.uri]); // URI'yi kaydet
        }
      }
    } catch (error) {
      console.error("Fotoğraf seçilirken hata oluştu:", error);
      Alert.alert("Hata", "Fotoğraf seçilemedi");
    }
  };

  // Fotoğraf silme fonksiyonu
  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  // Konum izni ve konum alma fonksiyonu
  const getLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Hata", "Konum izni gerekli");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setLocation(newLocation);
      setAddressDetails((prev) => ({
        ...prev,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      }));
      setShowMap(true);
    } catch (error) {
      Alert.alert("Hata", "Konum alınamadı");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Seçilen konumdan adres bilgilerini alma
  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (response && response[0]) {
        const addressData = response[0];
        console.log("Alınan adres bilgileri:", addressData);

        const newAddressDetails = {
          city:
            addressData.city ||
            addressData.region ||
            addressData.subregion ||
            "",
          district: addressData.subregion || addressData.district || "",
          neighborhood: addressData.district || addressData.name || "",
          street: addressData.street || addressData.name || "",
          latitude,
          longitude,
        };

        setAddressDetails(newAddressDetails);

        const fullAddress = [
          newAddressDetails.street,
          newAddressDetails.neighborhood,
          newAddressDetails.district,
          newAddressDetails.city,
        ]
          .filter(Boolean)
          .join(", ");

        setAddress(fullAddress);

        console.log("Oluşturulan adres detayları:", newAddressDetails);
        console.log("Oluşturulan tam adres:", fullAddress);

        const missingFields = Object.entries(newAddressDetails)
          .filter(
            ([key, value]) =>
              !value && key !== "latitude" && key !== "longitude"
          )
          .map(([key]) => key);

        if (missingFields.length > 0) {
          Alert.alert(
            "Bilgi",
            "Bazı adres bilgileri eksik. Lütfen eksik bilgileri manuel olarak tamamlayın:\n" +
              missingFields.join(", ")
          );
        }
      } else {
        console.log("Adres bilgisi bulunamadı");
        Alert.alert(
          "Uyarı",
          "Bu konum için adres bilgileri bulunamadı. Lütfen adres bilgilerini manuel olarak giriniz."
        );
      }
    } catch (error) {
      console.error("Adres bilgileri alınırken hata oluştu:", error);
      Alert.alert(
        "Hata",
        "Adres bilgileri alınamadı. Lütfen adres bilgilerini manuel olarak giriniz."
      );
    }
  };

  // Harita üzerinde konum seçildiğinde
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
    setAddressDetails((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
    getAddressFromCoordinates(latitude, longitude);
  };

  // Harita modalı
  const renderMapModal = () => {
    return (
      <Modal
        visible={showMap}
        animationType="slide"
        onRequestClose={() => setShowMap(false)}
      >
        <SafeAreaView style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity
              style={styles.mapCloseButton}
              onPress={() => setShowMap(false)}
            >
              <Text style={styles.mapCloseButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.mapTitle}>Konum Seç</Text>
            <TouchableOpacity
              style={styles.mapConfirmButton}
              onPress={() => setShowMap(false)}
            >
              <Text style={styles.mapConfirmButtonText}>Onayla</Text>
            </TouchableOpacity>
          </View>
          {location && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              onPress={handleMapPress}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
              />
            </MapView>
          )}
        </SafeAreaView>
      </Modal>
    );
  };

  // Adres detayları formu
  const renderAddressDetails = () => {
    return (
      <View style={styles.addressDetails}>
        <View style={styles.addressRow}>
          <View style={styles.addressField}>
            <Text style={styles.addressLabel}>Şehir</Text>
            <TextInput
              style={styles.addressInput}
              value={addressDetails.city}
              onChangeText={(text) => {
                setAddressDetails({ ...addressDetails, city: text });
                updateFullAddress({ ...addressDetails, city: text });
              }}
              placeholder="Şehir"
            />
          </View>
          <View style={styles.addressField}>
            <Text style={styles.addressLabel}>İlçe</Text>
            <TextInput
              style={styles.addressInput}
              value={addressDetails.district}
              onChangeText={(text) => {
                setAddressDetails({ ...addressDetails, district: text });
                updateFullAddress({ ...addressDetails, district: text });
              }}
              placeholder="İlçe"
            />
          </View>
        </View>
        <View style={styles.addressRow}>
          <View style={styles.addressField}>
            <Text style={styles.addressLabel}>Mahalle</Text>
            <TextInput
              style={styles.addressInput}
              value={addressDetails.neighborhood}
              onChangeText={(text) => {
                setAddressDetails({ ...addressDetails, neighborhood: text });
                updateFullAddress({ ...addressDetails, neighborhood: text });
              }}
              placeholder="Mahalle"
            />
          </View>
          <View style={styles.addressField}>
            <Text style={styles.addressLabel}>Sokak</Text>
            <TextInput
              style={styles.addressInput}
              value={addressDetails.street}
              onChangeText={(text) => {
                setAddressDetails({ ...addressDetails, street: text });
                updateFullAddress({ ...addressDetails, street: text });
              }}
              placeholder="Sokak"
            />
          </View>
        </View>
      </View>
    );
  };

  // Tam adresi güncelleme
  const updateFullAddress = (details: typeof addressDetails) => {
    const fullAddress = [
      details.street,
      details.neighborhood,
      details.district,
      details.city,
    ]
      .filter(Boolean)
      .join(", ");
    setAddress(fullAddress);
  };

  // Adres adımını güncelleme
  const renderAddressStep = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.inputLabel}>Adres</Text>
        <View style={styles.addressInputContainer}>
          <TextInput
            style={styles.addressInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Adresinizi girin"
            multiline
          />
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getLocation}
            disabled={isLoadingLocation}
          >
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              size={20}
              color={isLoadingLocation ? "#ccc" : "#8adbd2"}
            />
          </TouchableOpacity>
        </View>
        {renderAddressDetails()}
      </View>
    );
  };

  // Base64'e çevirme fonksiyonu
  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (base64.length === 0) {
        throw new Error("Base64 dönüşümü başarısız - boş string");
      }

      return base64;
    } catch (error) {
      console.error("Resim base64'e çevrilirken hata:", error);
      throw error;
    }
  };

  // İlan ekleme fonksiyonu
  const addAdvert = async () => {
    if (isLoading) return; // Eğer yükleme devam ediyorsa fonksiyonu çalıştırma

    // Validasyon kontrolleri
    if (selectedCategories.length === 0) {
      Alert.alert("Hata", "Lütfen bir kategori seçin.");
      return;
    }

    if (photos.length === 0) {
      Alert.alert("Hata", "Lütfen en az bir fotoğraf ekleyin.");
      return;
    }

    if (title.length === 0) {
      Alert.alert("Hata", "Lütfen bir başlık girin.");
      return;
    }

    if (title.length > 20) {
      Alert.alert("Hata", "Başlık en fazla 20 karakter olabilir.");
      return;
    }

    if (description.length < 30) {
      Alert.alert("Hata", "Açıklama en az 30 karakter olmalıdır.");
      return;
    }

    if (address.length === 0) {
      Alert.alert("Hata", "Lütfen bir adres girin.");
      return;
    }

    if (addressDetails.latitude === 0 || addressDetails.longitude === 0) {
      Alert.alert("Hata", "Lütfen haritadan konum seçin.");
      return;
    }

    if (price.length === 0) {
      Alert.alert("Hata", "Lütfen bir fiyat girin.");
      return;
    }

    try {
      setIsLoading(true); // Loading başlat

      const [isValid, token] = await Promise.all([
        TokenService.isTokenValid(),
        TokenService.getToken(),
      ]);

      if (!isValid || !token) {
        Alert.alert(
          "Uyarı",
          "Oturumunuz sonlanmış. Lütfen tekrar giriş yapın."
        );
        return;
      }

      // Tüm fotoğrafları base64'e çevir
      const base64Images: string[] = [];
      for (const photoUri of photos) {
        try {
          const base64 = await convertImageToBase64(photoUri);
          base64Images.push(base64);
        } catch (error) {
          console.error("Resim base64'e çevrilirken hata:", error);
          Alert.alert(
            "Uyarı",
            "Bazı resimler yüklenemedi. Lütfen tekrar deneyin."
          );
          return;
        }
      }

      // Son seçili kategori ID'sini al
      const lastSelectedCategoryId =
        selectedCategories[selectedCategories.length - 1];

      // İlan verilerini hazırla
      const advertData = {
        title: title.trim(),
        description: description.trim(),
        price: parseInt(price),
        categoryId: lastSelectedCategoryId,
        status: "Beklemede",
        address: address.trim(),
        latitude: addressDetails.latitude,
        longitude: addressDetails.longitude,
        base64Images: base64Images,
      };

      // İstek verilerini kontrol et
      console.log("Gönderilecek ilan verileri:", {
        ...advertData,
        base64Images: `${base64Images.length} adet resim`,
      });

      // İlanı ekle
      const response = await fetch(`${apiurl}/api/ad-listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(advertData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("İlan ekleme yanıtı:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `İlan ekleme başarısız: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      console.log("İlan başarıyla eklendi:", result);

      Alert.alert("Başarılı", "İlanınız başarıyla eklendi!", [
        {
          text: "Tamam",
          onPress: () => navigation.navigate("Home"),
        },
      ]);
    } catch (error) {
      console.error("İlan eklenirken hata oluştu:", error);
      Alert.alert(
        "Hata",
        "İlan eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsLoading(false); // Loading bitir
    }
  };

  // Sonraki adıma geçme fonksiyonu
  const nextStep = () => {
    if (currentStep === 1) {
      if (!isCategorySelectionComplete()) {
        Alert.alert("Hata", "Lütfen kategori seçimlerini eksiksiz tamamlayın.");
        return;
      }
    } else if (currentStep === 2) {
      if (photos.length === 0) {
        Alert.alert("Hata", "Lütfen en az bir fotoğraf ekleyin.");
        return;
      }
    } else if (currentStep === 3) {
      if (title.length === 0 || title.length > 20) {
        Alert.alert("Hata", "Başlık 1-20 karakter arasında olmalıdır.");
        return;
      }
      if (description.length < 30) {
        Alert.alert("Hata", "Açıklama en az 30 karakter olmalıdır.");
        return;
      }
    } else if (currentStep === 4) {
      if (address.length === 0) {
        Alert.alert("Hata", "Lütfen bir adres girin.");
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  // Önceki adıma dönme fonksiyonu
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      navigation.goBack();
    }
  };

  // Adım başlıklarını render etme
  const renderStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Kategori Seçimi";
      case 2:
        return "Fotoğraf Ekle";
      case 3:
        return "Başlık ve Açıklama";
      case 4:
        return "Adres";
      case 5:
        return "Fiyat";
      default:
        return "";
    }
  };

  // Adım içeriğini render etme
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            {[0, 1, 2, 3, 4].map((level) => renderCategoryLevel(level))}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.inputLabel}>
              Fotoğraflar ({photos.length}/10)
            </Text>
            <Text style={styles.inputDescription}>
              En az 1, en fazla 10 fotoğraf ekleyebilirsiniz.
            </Text>

            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {photos.length < 10 && (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={addPhoto}
                >
                  <FontAwesomeIcon icon={faCamera} size={24} color="#8adbd2" />
                  <Text style={styles.addPhotoText}>Fotoğraf Ekle</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.inputLabel}>Başlık</Text>
            <Text style={styles.inputDescription}>
              En fazla 20 karakter (Şu an: {title.length})
            </Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ürün başlığı girin"
              maxLength={20}
            />

            <Text style={styles.inputLabel}>Açıklama</Text>
            <Text style={styles.inputDescription}>
              En az 30 karakter (Şu an: {description.length})
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Ürün açıklaması girin"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        );
      case 4:
        return renderAddressStep();
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.inputLabel}>Fiyat (TL)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) {
                  setPrice(text);
                }
              }}
              placeholder="Fiyat girin"
              keyboardType="numeric"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[
                styles.completeButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={addAdvert}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={[styles.completeButtonText, styles.loadingText]}>
                    İlan Yükleniyor...
                  </Text>
                </View>
              ) : (
                <Text style={styles.completeButtonText}>İlanı Yayınla</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{renderStepTitle()}</Text>
        <Text style={styles.stepIndicator}>{currentStep}/5</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      {currentStep < 5 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>Devam Et</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderPickerModal()}
      {renderMapModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  stepIndicator: {
    fontSize: 14,
    color: "#8adbd2",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  inputDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 120,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  selectButtonText: {
    fontSize: 16,
    color: "#333",
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  photoItem: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  removePhotoButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  addPhotoText: {
    fontSize: 12,
    color: "#8adbd2",
    marginTop: 5,
    textAlign: "center",
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  addressInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  locationButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginLeft: 10,
  },
  footer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  nextButton: {
    backgroundColor: "#8adbd2",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  completeButton: {
    backgroundColor: "#8adbd2",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
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
    maxHeight: "70%",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  selectedModalItem: {
    backgroundColor: "#f0f7ff",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedModalItemText: {
    color: "#8adbd2",
    fontWeight: "bold",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
    marginTop: 10,
  },
  categoryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 5,
    minWidth: "30%",
  },
  selectedCategoryButton: {
    backgroundColor: "#8adbd2",
    borderColor: "#8adbd2",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  selectedCategoryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  categoryLevel: {
    marginBottom: 20,
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  pickerButtonText: {
    fontSize: 14,
    color: "#333",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mapCloseButton: {
    padding: 5,
  },
  mapCloseButtonText: {
    fontSize: 20,
    color: "#333",
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  mapConfirmButton: {
    padding: 5,
  },
  mapConfirmButtonText: {
    fontSize: 16,
    color: "#8adbd2",
    fontWeight: "bold",
  },
  map: {
    flex: 1,
  },
  addressDetails: {
    marginTop: 20,
  },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  addressField: {
    flex: 1,
    marginHorizontal: 5,
  },
  addressLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 10,
  },
});

export default AddAdvertScreen;
