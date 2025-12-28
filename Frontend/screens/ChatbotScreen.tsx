import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

// 메인 콘텐츠
import Chatbot from "@/components/maincontents/chatbot";

// 상단 탭바
import Header from "@/components/topmenu/header";

// 하단 탭바
import BottomBar from "@/components/bottombar/bottombar";

type ChatbotScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chatbot'>;

export default function ChatbotScreen() {
  const navigation = useNavigation<ChatbotScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<number>(2); // AI 챗봇 탭 활성화

  const handleTabPress = (index: number) => {
    setActiveTab(index);

    switch (index) {
      case 0: // 공지사항
        navigation.navigate('Home');
        break;
      case 1: // 관심공지
        navigation.navigate('Scrap');
        break;
      case 2: // AI 챗봇
        // 이미 Chatbot 화면이므로 아무것도 하지 않음
        break;
      case 3: // 검색
        navigation.navigate('Search');
        break;
      case 4: // 메뉴
        navigation.navigate('Setting');
        break;
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true} onBackPress={handleBackPress} />
      <Chatbot />
      <BottomBar onTabPress={handleTabPress} activeTab={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
