import {
  View,
  Text,
  Button,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import io from "socket.io-client";
//   import socketServices from "../server/socketServices";
import { useNavigation, useRoute } from "@react-navigation/native";
const socket = io.connect("https://markazback2.onrender.com");
const Stack = createStackNavigator();
import { Feather, Ionicons } from "@expo/vector-icons";

const ChatScreen2 = (props) => {
  const [email, setEmail] = useState("");
  const [rooms, setRooms] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    const getEmail = async () => {
      const tokenUser = await AsyncStorage.getItem("token")
      // console.log(token);
      axios
        .get("https://markazback2.onrender.com/auth/oneuser", {
          headers: { Authorization: "Bearer " + tokenUser },
        })
        .then((res1) => {
          // console.log(res1.data,"ssssssssssssss");
          // Swal.fire(res1.data[0].email)
          let email = res1.data[0].email;
          socket.emit("authenticate", { email });
          setEmail(email);
          // Swal.fire("ishladi")
          //     socket.emit("authenticate", { email });
          //         const getRooms = async () => {
          socket.emit("get_rooms", { email });
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getEmail();
    socket.on("load_rooms", (data) => {
      setRooms(data);
      // console.log(data);
    });
  }, []);
  return (
    <ScrollView>
      {rooms.map((item, key) => {
        let a = item;
        if (a !== null) {
          const [email1, email2] = a.split("_");

          const displayName = email1 === email ? email2 : email1;
          return (
            <TouchableOpacity
              onPress={() => {
                // const email =email
                navigation.navigate("User", {
                  name: displayName,
                  room: item,
                  email: email,
                });
                const room = item;

                socket.emit("join_room", { email, room });
                // const helo = async() => {
                // await AsyncStorage.setItem('userName', displayName)
                // }
                // helo()
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 10,
                }}
              >
                <Image
                  source={{
                    uri: "https://icon-library.com/images/no-user-image-icon/no-user-image-icon-27.jpg",
                  }}
                  style={{ width: 70, height: 70, borderRadius: 50 }}
                />
                <View style={{ width: "70%" }}>
                  <Text style={{ fontSize: 16 }} numberOfLines={1}>
                    {displayName}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }
      })}
      <TouchableOpacity
        onPress={() => {
          console.log(email);
        }}
      >
      </TouchableOpacity>
    </ScrollView>
  );
};

const UserScreen = () => {
  const [namePage, setNamePage] = useState("User");
  const [currentMessage, setCurrentMessage] = useState("sms");
  const [messageList, setMessageList] = useState([]);
  const [styles, setStyles] = useState(true);
  const height = Dimensions.get("window");
  const route = useRoute();
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  navigation.setOptions({ title: route.params.name });
  console.log(route);
  useEffect(() => {
    navigation.getParent().setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.getParent().setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, []);

  useEffect(() => {
    // const email=route.params.email
    // socket.emit("get_rooms", { email });
    // console.log(1);
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
      // let uniqueChars = [...new Set(data)];
      // setMessageList(uniqueChars);
      socket.on("load_messages", (data) => {
        let uniqueChars = [...new Set(data)];
        setMessageList(uniqueChars);
        // console.log(data,"load messages");
      });
      // socket.emit("join_room", { email, room });
      // console.log(data," receive_message");
      // console.log(messageList,"usestate");
    });
  }, [socket]);

  useEffect(() => {
    const get = async () => {
      await socket.on("load_messages", (data) => {
        let uniqueChars = [...new Set(data)];
        setMessageList(uniqueChars);
        // console.log(data,"load messages");
      });
    };
    get();
    scrollViewRef.current.scrollToEnd({ animated: true });
  }, [socket]);

  const handle = (value) => {
    setCurrentMessage(value);
  };
  const sendMessage = async () => {
    if (currentMessage !== "") {
      const room = route.params.room;
      const email = route.params.email;
      const messageData = {
        room: room,
        author: email,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");

      console.log(messageData);
      console.log(currentMessage);
    }
  };
  // const scrollBottomEnd = async () => {
  //   scrollViewRef.current.scrollToEnd({animated: true})
  // };
  // useEffect(() => {

  //     scrollBottomEnd

  // }, []);
  // useEffect(() => {
  //   scrollViewRef.current.scrollToEnd({animated: true});
  // }, [messageList.length]);
  // const InputBox = () => {
  //   return (

  //   );
  // };

  return (
    <View style={{ paddingBottom: styles == true ? 100 : 50, }}>
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/736x/d2/bf/d3/d2bfd3ea45910c01255ae022181148c4.jpg",
        }}
        resizeMode="cover"
      >
        {/* <Button           onPress={() => scrollBottomEnd()} title="Scroll to bottom"/> */}
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({ animated: true })
          }
          style={{ flexGrow: 1, height: "100%" }}
        >
          {messageList.map((item) => {
            return (
              <View style={{ marginBottom: 10, marginTop: 20 }}>
                {(() => {
                  if (item.author === route.params.email) {
                    return (
                      <View
                        style={{
                          backgroundColor: "cornflowerblue",
                          width: "50%",
                          // height: 50,
                          flex: 1,
                          justifyContent: "center",
                          padding: 10,
                          borderRadius: 15,
                          marginLeft: "50%",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: "white",
                            height: "auto",
                            paddingBottom: 10,
                          }}
                        >
                          {item.message}
                        </Text>
                        <Text
                          style={{
                            position: "absolute",
                            color: "white",
                            fontSize: 12,
                            bottom: 0,
                            right: 10,
                          }}
                        >
                          {item.time}
                        </Text>
                      </View>
                    );
                  } else {
                    return (
                      <View
                        style={{
                          backgroundColor: "blue",
                          width: "50%",
                          // height: 50,
                          flex: 1,
                          justifyContent: "center",
                          padding: 10,
                          borderRadius: 15,
                          // marginLeft: "50%",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: "white",
                            height: "auto",
                            paddingBottom: 10,
                          }}
                        >
                          {item.message}
                        </Text>
                        <Text
                          style={{
                            position: "absolute",
                            color: "white",
                            fontSize: 12,
                            bottom: 0,
                            right: 10,
                          }}
                        >
                          {item.time}
                        </Text>
                      </View>
                    );
                  }
                })()}
              </View>
            );
          })}
          {/* <View style={{ marginLeft: "50%", marginBottom: 10, marginTop: 20 }}>
            <View
              style={{
                backgroundColor: "cornflowerblue",
                width: "100%",
                // height: 50,
                flex: 1,
                justifyContent: "center",
                padding: 10,
                borderRadius: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "white",
                  height: "auto",
                  paddingBottom: 15,
                }}
              >
                halilov abdurahim halilov abdurahim
              </Text>
              <Text
                style={{
                  position: "absolute",
                  color: "white",
                  fontSize: 12,
                  bottom: 5,
                  right: 10,
                }}
              >
                2022-02-20
              </Text>
            </View>
          </View>
          <View>
            <View
              style={{
                backgroundColor: "darkseagreen",
                minWidth: "30%",
                maxWidth: "60%",
                height: "auto",
                flex: 1,
                justifyContent: "center",
                padding: 10,
                borderRadius: 15,
                width: "100%",
                marginTop: 20,
              }}
            >
              <Text style={{ fontSize: 16, color: "white", height: "auto" }}>
                asdasasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd
              </Text>
              <Text
                style={{
                  position: "absolute",
                  color: "white",
                  fontSize: 12,
                  bottom: 5,
                  right: 10,
                }}
              >
                2022-02-20
              </Text>
            </View>
          </View> */}
        </ScrollView>
      </ImageBackground>
      <View
        style={{
          flexDirection: "row",
          height: styles == true ? 90 : 50,
          position: "absolute",
          bottom: 0,
          backgroundColor: "white",
          flexDirection: 'column',
          width: '100%',
        }}
      >
        {styles == true ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              height: 40,
              backgroundColor: "white",
              alignItems: 'center',
              paddingLeft: 10,
              paddingRight: 10
            }}
          >
            <Text>ertyu</Text>
            <Feather name="x" onPress={() => setStyles(false)} size={24} color="black" />
          </View>
        ) : (
          <Text style={{height: 1,}}>asd</Text>
        )}
        <View style={{flexDirection: 'row',}}>
        <TextInput
        style={{ borderWidth: 2, width: "80%", height: 50, paddingLeft: 10 }}
        placeholder="send message"
        onChangeText={(text) => setCurrentMessage(text)}
        />
        <View
          style={{
            width: "20%",
            height: 50,
            borderWidth: 2,
            backgroundColor: "dodgerblue",
            justifyContent: "center",
            alignItems: "center",
          }}
          >
          <Ionicons
          name="send"
          onPress={() => sendMessage()}
            size={30}
            color="white"
          />
          </View>
        </View>
      </View>
      </View>
  );
};

const ChatScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Chat" component={ChatScreen2} />
      <Stack.Screen
        name="User"
        options={{
          headerStyle: {
            backgroundColor: "silver",
          },
        }}
        component={UserScreen}
      />
    </Stack.Navigator>
  );
};

export default ChatScreen;
