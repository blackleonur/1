import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../Types";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faArrowLeft,
  faPaperPlane,
  faImage,
  faSmile,
} from "@fortawesome/free-solid-svg-icons";

type MessagesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Messages"
>;

type MessagesScreenRouteProp = RouteProp<RootStackParamList, "Messages">;

type Props = {
  navigation: MessagesScreenNavigationProp;
  route: MessagesScreenRouteProp;
};

type ChatMessage = {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
};

const MessagesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId, userName } = route.params;
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Örnek mesaj verileri
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Merhaba, iPhone 13 Pro ilanınızla ilgileniyorum.",
      time: "10:30",
      isMe: false,
    },
    {
      id: "2",
      text: "Merhaba, evet ürün hala satılık.",
      time: "10:32",
      isMe: true,
    },
    {
      id: "3",
      text: "Fiyatta biraz indirim yapabilir misiniz?",
      time: "10:33",
      isMe: false,
    },
    {
      id: "4",
      text: "Ne kadar düşünüyorsunuz?",
      time: "10:35",
      isMe: true,
    },
    {
      id: "5",
      text: "22.000 TL olabilir mi?",
      time: "10:36",
      isMe: false,
    },
    {
      id: "6",
      text: "Maalesef o fiyata veremem, en düşük 23.500 TL olabilir.",
      time: "10:40",
      isMe: true,
    },
    {
      id: "7",
      text: "Anladım, düşüneceğim. Teşekkürler.",
      time: "10:42",
      isMe: false,
    },
    {
      id: "8",
      text: "Rica ederim, sorularınız olursa yazabilirsiniz.",
      time: "10:45",
      isMe: true,
    },
  ]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Otomatik olarak en son mesaja kaydır
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.isMe ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.isMe ? styles.myMessageBubble : styles.theirMessageBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isMe ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            item.isMe ? styles.myMessageTime : styles.theirMessageTime,
          ]}
        >
          {item.time}
        </Text>
      </View>
    </View>
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
        <View style={styles.headerUserInfo}>
          <Image
            source={{
              uri: `https://randomuser.me/api/portraits/${
                userId.startsWith("1") ? "women" : "men"
              }/${userId.slice(-2)}.jpg`,
            }}
            style={styles.headerAvatar}
          />
          <Text style={styles.headerUserName}>{userName}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <FontAwesomeIcon icon={faImage} size={20} color="#8adbd2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.emojiButton}>
            <FontAwesomeIcon icon={faSmile} size={20} color="#8adbd2" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Mesaj yazın..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() === "" && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={message.trim() === ""}
          >
            <FontAwesomeIcon
              icon={faPaperPlane}
              size={20}
              color={message.trim() === "" ? "#ccc" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerUserName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
    flexDirection: "row",
  },
  myMessage: {
    justifyContent: "flex-end",
  },
  theirMessage: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: "#8adbd2",
    borderBottomRightRadius: 5,
  },
  theirMessageBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#eee",
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 12,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  theirMessageTime: {
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  attachButton: {
    padding: 8,
    marginRight: 5,
  },
  emojiButton: {
    padding: 8,
    marginRight: 5,
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#8adbd2",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#f0f0f0",
  },
});

export default MessagesScreen;
