import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

// 메인 콘텐츠
import Setting from "@/components/maincontents/setting";

// 상단 탭바
import Header from "@/components/topmenu/header";

// 하단 탭바
import BottomBar from "@/components/bottombar/bottombar";

type SettingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Setting"
>;

export default function SettingScreen() {
  const navigation = useNavigation<SettingScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<number>(4); // 더보기 탭 활성화

  const handleBackPress = () => {
    navigation.goBack();
  };

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
        navigation.navigate('Chatbot');
        break;
      case 3: // 검색
        navigation.navigate('Search');
        break;
      case 4: // 더보기
        // 이미 Setting 화면이므로 아무것도 하지 않음
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <Setting />
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
