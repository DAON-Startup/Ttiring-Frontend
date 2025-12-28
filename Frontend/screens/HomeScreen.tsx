import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

// 메인 콘텐츠
import MainContents from "@/components/maincontents/mainAll";

// 상단 탭바
import All from "@/components/topmenu/all";
import Header from "@/components/topmenu/header";

// 하단 탭바
import BottomBar from "@/components/bottombar/bottombar";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<number>(0); // 0: 공지사항, 1: 관심공지
  const [selectedCategory, setSelectedCategory] = useState<string>("degree"); // 선택된 카테고리
  const [availableCategories, setAvailableCategories] = useState<string[]>([]); // 실제 존재하는 카테고리

  const handleTabPress = (index: number) => {
    setActiveTab(index);

    // 탭 인덱스에 따라 다른 화면으로 네비게이션
    switch (index) {
      case 0: // 공지사항
        // 이미 Home 화면이므로 아무것도 하지 않음
        break;
      case 1: // 관심공지
        navigation.navigate("Scrap");
        break;
      case 2: // AI 챗봇
        navigation.navigate("Chatbot");
        break;
      case 3: // 검색
        navigation.navigate("Search");
        break;
      case 4: // 메뉴
        navigation.navigate("Setting");
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <All
        onCategoryChange={setSelectedCategory}
        availableCategories={availableCategories}
      />
      <MainContents
        category={selectedCategory}
        onCategoriesExtracted={setAvailableCategories}
      />
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
