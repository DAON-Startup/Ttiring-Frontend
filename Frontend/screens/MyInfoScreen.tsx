import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import Header from "@/components/topmenu/header";
import MyInfo from "@/components/maincontents/myinfo";
import BottomBar from "@/components/bottombar/bottombar";

type MyInfoScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "MyInfo">;

export default function MyInfoScreen() {
  const navigation = useNavigation<MyInfoScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<number>(4);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    switch (index) {
      case 0:
        navigation.navigate('Home');
        break;
      case 1:
        navigation.navigate('Scrap');
        break;
      case 2:
        navigation.navigate('Chatbot');
        break;
      case 3:
        navigation.navigate('Search');
        break;
      case 4:
        navigation.navigate('Setting');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true} onBackPress={handleBackPress} />
      <MyInfo />
      <BottomBar onTabPress={handleTabPress} activeTab={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
