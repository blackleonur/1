export type RootStackParamList = {
  Home: undefined;
  Advert: { advertId: string };
  SplashScreen: undefined;
  GuestHomeScreen: undefined;
  Register: undefined;
  Verification: undefined;
  Profile: undefined;
  MessagesArea: undefined;
  Messages: { userId: string; userName: string };
  AddAdvert: undefined;
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
