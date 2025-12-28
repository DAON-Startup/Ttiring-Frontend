import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { useBookmark } from "../context/BookmarkContext";
import { useNotification } from "../context/NotificationContext";

// 메인 콘텐츠
import EmptyScrap from "@/components/maincontents/emptyScrap";
import ScrapList from "@/components/maincontents/scrapList";
import InterestList from "@/components/maincontents/interestList";

// 상단 탭바
import Header from "@/components/topmenu/header";
import Scrap from "@/components/topmenu/scrap";

// 하단 탭바
import BottomBar from "@/components/bottombar/bottombar";

type ScrapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Scrap'>;
type ScrapTab = "관심 공지" | "스크랩 공지";

export default function ScrapScreen() {
  const navigation = useNavigation<ScrapScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<number>(1); // 관심공지 탭 활성화
  const [selectedScrapTab, setSelectedScrapTab] = useState<ScrapTab>("관심 공지");
  const { bookmarkedNotices } = useBookmark();
  const { notificationNotices } = useNotification();

  const handleTabPress = (index: number) => {
    setActiveTab(index);

    switch (index) {
      case 0: // 공지사항
        navigation.navigate('Home');
        break;
      case 1: // 관심공지
        // 이미 Scrap 화면이므로 아무것도 하지 않음
        break;
      case 2: // AI 챗봇
        navigation.navigate('Chatbot');
        break;
      case 3: // 검색
        navigation.navigate('Search');
        break;
      case 4: // 메뉴
        navigation.navigate('Setting');
        break;
    }
  };

  const renderContent = () => {
    if (selectedScrapTab === "관심 공지") {
      return notificationNotices.length > 0 ? (
        <InterestList />
      ) : (
        <EmptyScrap type="관심 공지" />
      );
    } else {
      return bookmarkedNotices.length > 0 ? (
        <ScrapList />
      ) : (
        <EmptyScrap type="스크랩 공지" />
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <Scrap selectedTab={selectedScrapTab} onTabChange={setSelectedScrapTab} />
      {renderContent()}
      <BottomBar onTabPress={handleTabPress} activeTab={1} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
