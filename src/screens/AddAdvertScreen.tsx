import React, { useState, useRef } from "react";
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
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
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

type AddAdvertScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddAdvert"
>;

type Props = {
  navigation: AddAdvertScreenNavigationProp;
};

// Kategori tipleri
type Category = {
  id: string;
  name: string;
  subCategories: SubCategory[];
};

type SubCategory = {
  id: string;
  name: string;
};

const AddAdvertScreen: React.FC<Props> = ({ navigation }) => {
  // Kategoriler
  const categories: Category[] = [
    {
      id: "1",
      name: "Ev Eşyaları",
      subCategories: [
        { id: "1-1", name: "Mutfak Eşyaları" },
        { id: "1-2", name: "Temizlik Eşyaları" },
        { id: "1-3", name: "Mobilya" },
      ],
    },
    {
      id: "2",
      name: "Elektronik",
      subCategories: [
        { id: "2-1", name: "Bilgisayar" },
        { id: "2-2", name: "Telefon" },
        { id: "2-3", name: "Tablet" },
      ],
    },
  ];

  // State'ler
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  // Fotoğraf ekleme fonksiyonu (simüle edilmiş)
  const addPhoto = () => {
    if (photos.length >= 10) {
      Alert.alert("Uyarı", "En fazla 10 fotoğraf ekleyebilirsiniz.");
      return;
    }

    // Gerçek uygulamada burada kamera veya galeri açılacak
    // Şimdilik rastgele bir fotoğraf ekleyelim
    const randomId = Math.floor(Math.random() * 100);
    const newPhoto = `https://picsum.photos/500/500?random=${randomId}`;
    setPhotos([...photos, newPhoto]);
  };

  // Fotoğraf silme fonksiyonu
  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  // İlan ekleme fonksiyonu
  const addAdvert = () => {
    // Validasyon kontrolleri
    if (!selectedCategory) {
      Alert.alert("Hata", "Lütfen bir kategori seçin.");
      return;
    }

    if (!selectedSubCategory) {
      Alert.alert("Hata", "Lütfen bir alt kategori seçin.");
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

    if (price.length === 0) {
      Alert.alert("Hata", "Lütfen bir fiyat girin.");
      return;
    }

    // İlan ekleme işlemi burada yapılacak
    Alert.alert("Başarılı", "İlanınız başarıyla eklendi!", [
      {
        text: "Tamam",
        onPress: () => navigation.navigate("Home"),
      },
    ]);
  };

  // Sonraki adıma geçme fonksiyonu
  const nextStep = () => {
    if (currentStep === 1) {
      if (!selectedCategory || !selectedSubCategory) {
        Alert.alert("Hata", "Lütfen kategori ve alt kategori seçin.");
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
            <Text style={styles.inputLabel}>Kategori</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.selectButtonText}>
                {selectedCategory ? selectedCategory.name : "Kategori Seçin"}
              </Text>
              <FontAwesomeIcon icon={faChevronDown} size={16} color="#666" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Alt Kategori</Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                !selectedCategory && styles.disabledButton,
              ]}
              onPress={() => {
                if (selectedCategory) {
                  setShowSubCategoryModal(true);
                } else {
                  Alert.alert("Uyarı", "Önce bir kategori seçmelisiniz.");
                }
              }}
              disabled={!selectedCategory}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !selectedCategory && styles.disabledText,
                ]}
              >
                {selectedSubCategory
                  ? selectedSubCategory.name
                  : "Alt Kategori Seçin"}
              </Text>
              <FontAwesomeIcon
                icon={faChevronDown}
                size={16}
                color={selectedCategory ? "#666" : "#ccc"}
              />
            </TouchableOpacity>
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
        return (
          <View style={styles.stepContent}>
            <Text style={styles.inputLabel}>Adres</Text>
            <View style={styles.addressInputContainer}>
              <TextInput
                style={styles.addressInput}
                value={address}
                onChangeText={setAddress}
                placeholder="Adresinizi girin"
              />
              <TouchableOpacity style={styles.locationButton}>
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  size={20}
                  color="#8adbd2"
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.inputLabel}>Fiyat (TL)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={(text) => {
                // Sadece sayısal değer girilmesini sağla
                if (/^\d*$/.test(text)) {
                  setPrice(text);
                }
              }}
              placeholder="Fiyat girin"
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.completeButton} onPress={addAdvert}>
              <Text style={styles.completeButtonText}>İlanı Yayınla</Text>
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

      {/* Kategori Seçim Modalı */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Seçin</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(item);
                    setSelectedSubCategory(null);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    size={16}
                    color="#ccc"
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Alt Kategori Seçim Modalı */}
      <Modal
        visible={showSubCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSubCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alt Kategori Seçin</Text>
              <TouchableOpacity onPress={() => setShowSubCategoryModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedCategory?.subCategories || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSubCategory(item);
                    setShowSubCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    size={16}
                    color="#ccc"
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  disabledButton: {
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  disabledText: {
    color: "#ccc",
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
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default AddAdvertScreen;
