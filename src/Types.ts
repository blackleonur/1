export type RootStackParamList = {
  Home: undefined;
  Advert: { advertId: string };
  // ... diğer route'lar
};

export type Advert = {
  id: string | number;
  title: string;
  description: string;
  price: number;
  sellerName: string;
  distance: string;
  location: string;
  category: string;
  imageUrls: {
    $values: string[];
  };
  latitude: number;
  longitude: number;
  status: string;
  address: string;
  categoryName: string;
}; 