export type RootStackParamList = {
  Home: undefined;
  Advert: { advertId: string };
  SplashScreen: undefined;
  GuestHomeScreen: undefined;
  RegisterScreen: undefined;
  VerificationScreen: {
    userData: {
      fullName: string;
      email: string;
      phoneNumber: string;
      password: string;
    };
  };
  Profile: undefined;
  MessagesArea: undefined;
  Messages: { userId: string; userName: string };
  AddAdvert: { adId?: number };
  PersonalInfo: {
    email: string;
    phoneNumber: string;
  };
  Favs: undefined;
  MyAds: undefined;
  Privacy: undefined;
  Help: undefined;
};

export type Advert = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  location: string;
  date: string;
  sellerName: string;
  distance: string;
  category: string;
};
