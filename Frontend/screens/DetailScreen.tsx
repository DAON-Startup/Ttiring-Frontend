import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

// 메인 콘텐츠
import Detail from "@/components/maincontents/detail";

// 상단 탭바
import Header from "@/components/topmenu/header";

// 하단 탭바
import BottomBar from "@/components/bottombar/bottombar";

type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

export default function DetailScreen() {
  const navigation = useNavigation<DetailScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<number>(0);

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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAlertToggle = () => {
    navigation.navigate('Alert');
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true} onAlertToggle={handleAlertToggle} onBackPress={handleBackPress} />
      <Detail />
      <BottomBar onTabPress={handleTabPress} activeTab={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
