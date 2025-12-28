// @ts-ignore

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { getNotices, Notice } from "../../services/crawlerAPI";

export default function MainContents() {
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
  });

  const navi = useNavigation();
  const [readTitles, setReadTitles] = useState<string[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  const swipeRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [interestCategories, setInterestCategories] = useState<string[]>([]); // 관심 카테고리 목록

  // 공지사항 데이터 가져오기
  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      // 관심 카테고리가 설정되어 있으면 필터링해서 가져오기
      // TODO: 실제로는 여러 카테고리를 지원하도록 API 수정 필요
      const result = await getNotices(1, 50);
      if (result.success) {
        // 관심 카테고리로 필터링
        const filtered =
          interestCategories.length > 0
            ? result.data.filter((notice: Notice) =>
                interestCategories.includes(notice.categoryCode || notice.category || "")
              )
            : result.data;
        setNotices(filtered);
      } else {
        console.error("공지사항 조회 실패:", result.message);
      }
    } catch (error) {
      console.error("공지사항 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotices();
    setRefreshing(false);
  };

  // 앱 시작 시 읽은 목록과 북마크 목록 불러오기 + 공지사항 불러오기
  useEffect(() => {
    const loadData = async () => {
      const storedRead = await AsyncStorage.getItem("readTitles");
      if (storedRead) {
        setReadTitles(JSON.parse(storedRead));
      }

      const storedBookmarks = await AsyncStorage.getItem("bookmarkedItems");
      if (storedBookmarks) {
        setBookmarkedItems(JSON.parse(storedBookmarks));
      }

      // 관심 카테고리 불러오기 (예: ["전공", "학사"])
      const storedInterests = await AsyncStorage.getItem("interestCategories");
      if (storedInterests) {
        setInterestCategories(JSON.parse(storedInterests));
      }

      // 공지사항 불러오기
      await fetchNotices();
    };
    loadData();
  }, []);

  // 관심 카테고리가 변경되면 다시 불러오기
  useEffect(() => {
    if (interestCategories.length >= 0) {
      fetchNotices();
    }
  }, [interestCategories]);

  // 읽은 제목 추가 + 저장
  const handleTitlePress = async (notice: Notice) => {
    try {
      if (!readTitles.includes(notice.id)) {
        const updated = [...readTitles, notice.id];
        setReadTitles(updated);
        await AsyncStorage.setItem("readTitles", JSON.stringify(updated));
      }
      (navi as any).navigate("notice/detail", { notice });
    } catch (error) {
      console.error("제목 클릭 처리 중 오류:", error);
    }
  };

  const handleBookmark = async (uniqueKey: string) => {
    try {
      let updatedBookmarks;

      if (bookmarkedItems.includes(uniqueKey)) {
        // 북마크 제거
        updatedBookmarks = bookmarkedItems.filter((key) => key !== uniqueKey);
        alert("북마크에서 제거되었습니다.");
      } else {
        // 북마크 추가
        updatedBookmarks = [...bookmarkedItems, uniqueKey];
        alert("북마크에 추가되었습니다.");
      }

      setBookmarkedItems(updatedBookmarks);
      await AsyncStorage.setItem(
        "bookmarkedItems",
        JSON.stringify(updatedBookmarks)
      );
    } catch (error) {
      console.error("북마크 처리 중 오류:", error);
    }
  };

  // 공유 탭 띄우기 함수
  const handleShare = async (title: string) => {
    try {
      await Share.share({
        message: `${title}\n\n띠링인캠퍼스에서 확인하세요!`,
        title: title,
      });
    } catch (error) {
      console.error("공유 오류:", error);
    }
  };

  const swipe = (title: string, uniqueKey: string) => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
          width: 80,
          borderRadius: 12,
          marginRight: 0,
        }}
        onPress={() => handleShare(title)}
      >
        {/* 북마크 아이콘 */}
        <TouchableOpacity
          style={{
            zIndex: 10,
            elevation: 10,
            position: "relative",
          }}
          onPress={(e) => {
            e.stopPropagation();
            handleBookmark(uniqueKey);
          }}
        >
          <Image
            source={
              bookmarkedItems.includes(uniqueKey)
                ? require("../../assets/images/bookmark2.png")
                : require("../../assets/images/bookmark.png")
            }
            style={{
              width: 20,
              height: 20,
              tintColor: "white",
              resizeMode: "contain",
            }}
          />
        </TouchableOpacity>
        {/* 공유하기 버튼 */}
        <Image
          source={require("../../assets/images/export.png")}
          style={{
            width: 27,
            height: 27,
            resizeMode: "contain",
            marginBottom: 25,
          }}
        />
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) return null;

  // 날짜별로 그룹화
  const groupedNotices: { [key: string]: Notice[] } = {};
  notices.forEach((notice) => {
    const dateStr = notice.publishedAt || notice.date || new Date().toString();
    const date = new Date(dateStr).toISOString().split("T")[0]; // YYYY-MM-DD
    if (!groupedNotices[date]) {
      groupedNotices[date] = [];
    }
    groupedNotices[date].push(notice);
  });

  const dates = Object.keys(groupedNotices).sort((a, b) => b.localeCompare(a)); // 최신 날짜순

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {isLoading && notices.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#3366FF" />
          <Text style={{ fontFamily: "Pretendard-Regular", fontSize: 14, marginTop: 10 }}>
            공지사항을 불러오는 중...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 0 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {dates.map((date) => {
            return (
              <View key={date}>
                <Text
                  style={{
                    fontFamily: "Pretendard-Light",
                    fontSize: 12,
                    marginTop: 10,
                    marginBottom: 0,
                    marginLeft: 15,
                  }}
                >
                  {date}
                </Text>

                <View
                  style={{
                    gap: 10,
                    marginTop: 10,
                    paddingHorizontal: 15,
                    overflow: "visible",
                  }}
                >
                  {groupedNotices[date].map((notice, i) => {
                    const swipeKey = `${notice.id}`;
                    return (
                      <Swipeable
                        key={swipeKey}
                        renderRightActions={() => swipe(notice.title, swipeKey)}
                        containerStyle={{ overflow: "visible" }}
                        friction={0.7}
                        rightThreshold={40}
                        onSwipeableWillOpen={() => {
                          // 다른 모든 열린 스와이프를 닫기
                          Object.keys(swipeRefs.current).forEach((key) => {
                            if (key !== swipeKey && swipeRefs.current[key]) {
                              swipeRefs.current[key]?.close();
                            }
                          });
                        }}
                        ref={(ref) => {
                          swipeRefs.current[swipeKey] = ref;
                        }}
                      >
                        <TouchableOpacity onPress={() => handleTitlePress(notice)}>
                          <View
                            style={{
                              width: "100%",
                              height: 80,
                              backgroundColor: "#ffffff",
                              borderRadius: 12,
                              paddingHorizontal: 20,
                              paddingVertical: 12,
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              elevation: 4,
                              marginHorizontal: 2,
                              marginVertical: 2,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {notice.isImportant && (
                                  <Text
                                    style={{
                                      fontFamily: "Pretendard-Bold",
                                      fontSize: 12,
                                      color: "#FF3B30",
                                      marginRight: 4,
                                    }}
                                  >
                                    [중요]
                                  </Text>
                                )}
                                <Text
                                  style={{
                                    color: readTitles.includes(notice.id)
                                      ? "#909090"
                                      : "#000000",
                                    fontFamily: "Pretendard-Light",
                                    fontSize: 15,
                                    flex: 1,
                                  }}
                                  numberOfLines={1}
                                >
                                  {notice.title}
                                </Text>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginTop: 6,
                                }}
                              >
                                <Text
                                  style={{
                                    fontFamily: "Pretendard-Light",
                                    fontSize: 10,
                                  }}
                                >
                                  {new Date(notice.publishedAt || notice.date || new Date()).toLocaleDateString("ko-KR")}
                                </Text>
                                {(notice.categoryCode || notice.category) && (
                                  <Text
                                    style={{
                                      fontFamily: "Pretendard-Light",
                                      fontSize: 12,
                                      color: "#ffffff",
                                      marginLeft: 8,
                                      paddingHorizontal: 4,
                                      paddingTop: 1,
                                      paddingBottom: 1,
                                      lineHeight: 14,
                                      borderRadius: 5,
                                      backgroundColor: "#8e8e8e",
                                    }}
                                  >
                                    {notice.categoryCode || notice.category}
                                  </Text>
                                )}
                              </View>
                            </View>

                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                handleBookmark(swipeKey);
                              }}
                              style={{
                                padding: 10,
                              }}
                            >
                              <Image
                                source={
                                  bookmarkedItems.includes(swipeKey)
                                    ? require("../../assets/images/bookmark2.png")
                                    : require("../../assets/images/bookmark.png")
                                }
                                style={{
                                  width: 24,
                                  height: 24,
                                  resizeMode: "contain",
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      </Swipeable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {notices.length === 0 && !isLoading && (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 }}>
              <Text style={{ fontFamily: "Pretendard-Light", fontSize: 16, color: "#999" }}>
                관심 카테고리 공지사항이 없습니다
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
