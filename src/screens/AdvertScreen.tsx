import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Types";
import apiurl from "../Apiurl";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMapMarkerAlt, faPhone, faMessage, faChevronLeft, faChevronRight, faArrowLeft, faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import Modal from 'react-native-modal';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AdvertScreenRouteProp = RouteProp<RootStackParamList, "Advert">;
type AdvertScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Advert"
>;

type Props = {
  route: AdvertScreenRouteProp;
  navigation: AdvertScreenNavigationProp;
};

type Advert = {
  id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  address: string;
  latitude: number;
  longitude: number;
  categoryId: number;
  categoryName: string;
  userId: string;
  sellerName: string;
  imageUrls: {
    $values: string[];
  };
};

const AdvertScreen: React.FC<Props> = ({ route, navigation }) => {
  const { advertId } = route.params;
  const [advert, setAdvert] = useState<Advert | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchAdvertDetails();
    checkFavoriteStatus();
  }, [advertId]);

  const fetchAdvertDetails = async () => {
    try {
      const response = await fetch(`${apiurl}/api/ad-listings/${advertId}`);
      if (!response.ok) {
        throw new Error('İlan detayları alınamadı');
      }
      const data = await response.json();
      setAdvert(data);
    } catch (error) {
      console.error('İlan detayları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        return;
      }

      const response = await fetch(`${apiurl}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Favoriler API Yanıtı:', data);
        console.log('Aranan ilan ID:', advertId);
        
        // Gelen favori listesinde mevcut ilan var mı kontrol et
        const isFav = data.$values.some((fav: any) => {
          console.log('Kontrol edilen favori:', fav);
          return fav.id === Number(advertId);
        });
        
        console.log('İlan favorilerde mi?:', isFav);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Favori durumu kontrol edilirken hata:', error);
    }
  };

  const handleShowMap = () => {
    if (advert) {
      setIsMapVisible(true);
    }
  };

  const handleImageSwipe = (direction: 'left' | 'right') => {
    if (advert?.imageUrls.$values) {
      const maxIndex = advert.imageUrls.$values.length - 1;
      if (direction === 'left') {
        setCurrentImageIndex(prev => (prev === maxIndex ? 0 : prev + 1));
      } else {
        setCurrentImageIndex(prev => (prev === 0 ? maxIndex : prev - 1));
      }
    }
  };

  const handleMessagePress = () => {
    if (advert) {
      navigation.navigate('Messages', {
        userId: advert.userId,
        userName: advert.sellerName
      });
    }
  };

  const handleFavoritePress = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        navigation.navigate('RegisterScreen');
        return;
      }

      // Favorideyse sil, değilse ekle
      const endpoint = isFavorite 
        ? `${apiurl}/api/favorites/remove/${advertId}`
        : `${apiurl}/api/favorites/add/${advertId}`;

      const response = await fetch(endpoint, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        const errorData = await response.text();
        console.error('API Yanıtı:', response.status, errorData);
        
        if (response.status === 401) {
          navigation.navigate('RegisterScreen');
        } else {
          console.error('Favori işlemi başarısız oldu:', errorData);
        }
      }
    } catch (error) {
      console.error('Favori işlemi sırasında hata:', error);
    }
  };

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="#8adbd2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İlan Detayları</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          {advert?.imageUrls.$values && advert.imageUrls.$values.length > 0 ? (
            <>
              <TouchableOpacity 
                style={styles.favoriteButton} 
                onPress={handleFavoritePress}
              >
                <FontAwesomeIcon 
                  icon={isFavorite ? faHeartSolid : faHeart} 
                  size={24} 
                  color={isFavorite ? "#FF6B6B" : "#8adbd2"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.imageSwipeLeft} 
                onPress={() => handleImageSwipe('left')}
              >
                <FontAwesomeIcon icon={faChevronRight} size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.imageSwipeRight} 
                onPress={() => handleImageSwipe('right')}
              >
                <FontAwesomeIcon icon={faChevronLeft} size={20} color="#fff" />
              </TouchableOpacity>
              <Image 
                source={{ uri: advert.imageUrls.$values[currentImageIndex] }} 
                style={styles.image}
                resizeMode="cover"
              />
              {advert.imageUrls.$values.length > 1 && (
                <View style={styles.imageDots}>
                  {advert.imageUrls.$values.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        currentImageIndex === index && styles.activeDot
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Text>Resim bulunamadı</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{advert?.price} TL</Text>
            <Text style={styles.title}>{advert?.title}</Text>
          </View>
          
          <TouchableOpacity style={styles.locationContainer} onPress={handleShowMap}>
            <FontAwesomeIcon icon={faMapMarkerAlt} size={20} color="#8adbd2" />
            <Text style={styles.location}>{advert?.address}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{advert?.description}</Text>

          <View style={styles.divider} />

          <View style={styles.sellerCard}>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerTitle}>Satıcı</Text>
              <Text style={styles.sellerName}>{advert?.sellerName}</Text>
            </View>
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactIconButton}>
                <FontAwesomeIcon icon={faPhone} size={20} color="#8adbd2" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.contactIconButton}
                onPress={handleMessagePress}
              >
                <FontAwesomeIcon icon={faMessage} size={20} color="#8adbd2" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Harita Modalı */}
      <Modal
        isVisible={isMapVisible}
        onBackdropPress={() => setIsMapVisible(false)}
        onBackButtonPress={() => setIsMapVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{advert?.title}</Text>
            <TouchableOpacity onPress={() => setIsMapVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: advert?.latitude || 0,
              longitude: advert?.longitude || 0,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {advert && (
              <Marker
                coordinate={{
                  latitude: advert.latitude,
                  longitude: advert.longitude,
                }}
                title={advert.title}
                description={advert.address}
              />
            )}
          </MapView>
          <Text style={styles.modalAddress}>{advert?.address}</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 95,
    backgroundColor: '#8adbd2',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor:"white",
    borderRadius:15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  headerTitle: {
    backgroundColor:"white",
    fontSize: 22,
    fontWeight: '600',
    color: '#8adbd2',
    marginTop: 24,
    padding:7,
    paddingLeft:24,
    paddingRight:24,
    borderRadius:15,
  },
  scrollView: {
    flex: 1,
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
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
    backgroundColor: '#f8f8f8',
  },
  noImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    margin: 3,
  },
  activeDot: {
    backgroundColor: '#8adbd2',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageSwipeLeft: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -20 }],
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSwipeRight: {
    position: 'absolute',
    left: 15,
    top: '50%',
    transform: [{ translateY: -20 }],
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  priceContainer: {
    marginBottom: 15,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8adbd2",
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  location: {
    marginLeft: 10,
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#444",
  },
  sellerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  contactIconButton: {
    width: 45,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  map: {
    flex: 1,
  },
  modalAddress: {
    padding: 15,
    fontSize: 14,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  favoriteButton: {
    position: 'absolute',
    right: 15,
    bottom: -20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AdvertScreen;
