export type RootStackParamList = {
  SplashScreen: undefined;
  Home: undefined;
  Advert: { id: string };
  GuestHomeScreen: undefined;
  RegisterScreen: undefined;
  VerificationScreen: { phoneNumber: string };
  Profile: undefined;
  MessagesArea: undefined;
  Messages: { chatId: string };
  AddAdvert: undefined;
  PersonalInfo: undefined;
  Favs: undefined;
  MyAds: undefined;
  Privacy: undefined;
  Help: undefined;
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
