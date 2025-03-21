import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Types";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faArrowLeft,
  faSearch,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import apiurl from "../Apiurl";

type MessagesAreaScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MessagesArea"
>;

type Props = {
  navigation: MessagesAreaScreenNavigationProp;
};

type Message = {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  lastMessage: string;
  time: string;
  unread: boolean;
};

const MessagesAreaScreen: React.FC<Props> = ({ navigation }) => {
  // Örnek mesaj verileri
  const messages: Message[] = [
    {
      id: "1",
      sender: {
        id: "101",
        name: "Ayşe Demir",
        avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      },
      lastMessage: "Ürün hala satılık mı?",
      time: "10:30",
      unread: true,
    },
    {
      id: "2",
      sender: {
        id: "102",
        name: "Mehmet Yılmaz",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      lastMessage: "Fiyatta pazarlık payı var mı?",
      time: "Dün",
      unread: false,
    },
    {
      id: "3",
      sender: {
        id: "103",
        name: "Zeynep Kaya",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      },
      lastMessage: "Teşekkür ederim, görüşmek üzere!",
      time: "Dün",
      unread: false,
    },
    {
      id: "4",
      sender: {
        id: "104",
        name: "Ali Öztürk",
        avatar: "https://randomuser.me/api/portraits/men/44.jpg",
      },
      lastMessage: "Ürünü yarın teslim alabilir miyim?",
      time: "Pazartesi",
      unread: true,
    },
    {
      id: "5",
      sender: {
        id: "105",
        name: "Selin Aydın",
        avatar: "https://randomuser.me/api/portraits/women/55.jpg",
      },
      lastMessage: "Anlaştık o zaman, yarın görüşürüz.",
      time: "Pazartesi",
      unread: false,
    },
    {
      id: "6",
      sender: {
        id: "106",
        name: "Burak Şahin",
        avatar: "https://randomuser.me/api/portraits/men/66.jpg",
      },
      lastMessage: "Ürünün durumu nasıl?",
      time: "Geçen hafta",
      unread: false,
    },
  ];

  const renderItem = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() =>
        navigation.navigate("Messages", {
          userId: item.sender.id,
          userName: item.sender.name,
        })
      }
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.sender.avatar }} style={styles.avatar} />
        {item.unread && <View style={styles.unreadBadge} />}
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{item.sender.name}</Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
        <Text
          style={[styles.lastMessage, item.unread && styles.unreadMessage]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mesajlar</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <FontAwesomeIcon icon={faSearch} size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <FontAwesomeIcon icon={faEllipsisV} size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
      />
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
  headerRight: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 5,
    marginLeft: 15,
  },
  messagesList: {
    paddingVertical: 10,
  },
  messageItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#8adbd2",
    borderWidth: 2,
    borderColor: "#fff",
  },
  messageContent: {
    flex: 1,
    justifyContent: "center",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  senderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  messageTime: {
    fontSize: 12,
    color: "#999",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  unreadMessage: {
    fontWeight: "bold",
    color: "#333",
  },
});

export default MessagesAreaScreen;
