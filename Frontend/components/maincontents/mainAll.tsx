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
import { useBookmark } from "../../context/BookmarkContext";
import { useToast } from "../../context/ToastContext";

// 목데이터 (API 실패 시 사용)
const MOCK_NOTICES: Notice[] = [
  {
    id: "mock-1",
    title: "[졸업논문] 2025-2학기 졸업논문(실기발표) 심사 대상자 심사일정 안내",
    content: "이 공지는 졸업논문 심사를 앞둔 학생들을 대상으로 안내드립니다.\n\n본인의 심사일정을 잘 확인하시어 심사일정에 차질이 없도록 준비하시기 바랍니다.\n\n추후 일정 변경 시 문자로 안내 예정입니다.\n\n학과사무실 연락처: 032-835-8962",
    categoryCode: "학사",
    publishedAt: "2025-11-10T00:00:00.000Z",
    viewCount: 965,
    isImportant: false,
    author: "정보통신공학과",
    url: "https://www.inu.ac.kr/ite/3472/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGaXRlJTJGMzczJTJGNDE0OTAxJTJGYXJ0Y2xWaWV3LmRvJTNG",
  },
  {
    id: "mock-2",
    title: "2025-1학기 교내장학금 신청 안내",
    content: "2025학년도 1학기 교내장학금 신청 안내입니다.\n\n신청기간: 2025.02.17(월) ~ 02.21(금)\n신청방법: 포털시스템 > 장학금 신청",
    categoryCode: "장학금",
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // 하루 전
    viewCount: 856,
    isImportant: false,
    author: "장학팀",
    url: "https://www.inu.ac.kr/ite/3472/subview.do",
  },
  {
    id: "mock-3",
    title: "2025년 캠퍼스 축제 자원봉사자 모집",
    content: "2025년 봄 캠퍼스 축제 자원봉사자를 모집합니다.\n\n모집기간: 2025.03.01 ~ 03.15\n활동기간: 2025.05.15 ~ 05.17",
    categoryCode: "일반/행사/모집",
    publishedAt: new Date(Date.now() - 172800000).toISOString(), // 이틀 전
    viewCount: 423,
    isImportant: false,
    author: "학생처",
  },
  {
    id: "mock-4",
    title: "[사회봉사센터] 2025 사랑의 김장나눔 봉사자 모집(~11/4)",
    content: "인천대학교 사회봉사센터에서 신체적·경제적 어려움으로 겨울철 준비가 어려운 지역사회 소외계층을 돕기 위해 김장 나눔 봉사활동을 모집합니다.\n\n■ 활동일: 2025년 11월 21일 (9:50~14:00)\n■ 장소: 제1기숙사식당\n■ 모집인원: 약 40명\n■ 활동내용: 인천광역시 노인보호전문기관 및 학대피해노인쉼터를 위한 김장 지원\n\n■ 일정\n- 장갑/앞치마 배부: 9:50~10:00\n- 김장: 10:00~13:00\n- 중식 제공: 13:00~14:00\n\n참가 신청은 Google Forms 링크를 통해 가능합니다.",
    categoryCode: "봉사",
    publishedAt: "2025-11-03T00:00:00.000Z",
    viewCount: 1401,
    isImportant: false,
    author: "대학생활지원과",
    url: "https://www.inu.ac.kr/bbs/inu/253/414577/artclView.do",
  },
];

interface MainContentsProps {
  category?: string;
  onCategoriesExtracted?: (categories: string[]) => void;
  sortType?: "latest" | "popular";
}

// 날짜 문자열을 파싱하는 헬퍼 함수 (YYYY.MM.DD, YYYY-MM-DD, ISO 형식 지원)
const parseDate = (dateStr: string | undefined | null): Date => {
  if (!dateStr) return new Date();

  // YYYY.MM.DD 형식 처리
  if (dateStr.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
    const [year, month, day] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  // 기타 형식은 Date 생성자로 파싱
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function MainContents({ category, onCategoriesExtracted, sortType = "latest" }: MainContentsProps) {
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
  });

  const navi = useNavigation();
  const [readTitles, setReadTitles] = useState<string[]>([]);
  const { isBookmarked, toggleBookmark } = useBookmark();
  const { showToast } = useToast();
  const swipeRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [allNotices, setAllNotices] = useState<Notice[]>([]); // 전체 공지사항
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [localSortType, setLocalSortType] = useState<"latest" | "popular">("latest");

  // 전체 공지사항 데이터 가져오기
  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const result = await getNotices(0, 500); // 페이지 0부터 시작, 최대 500개 조회
      // 디버깅용: 첫 번째 공지사항의 모든 필드 확인
      if (result.data && result.data[0]) {
        console.log("API 응답 첫 번째 공지사항 전체:", JSON.stringify(result.data[0], null, 2));
        console.log("조회수 관련 필드:", {
          hits: result.data[0].hits,
          viewCount: result.data[0].viewCount,
          views: result.data[0].views,
        });
      }
      if (result.success && result.data.length > 0) {
        setAllNotices(result.data);

        // 실제 존재하는 카테고리 추출
        const uniqueCategories = Array.from(
          new Set(
            result.data
              .map((notice: Notice) => notice.categoryCode || notice.category)
              .filter(Boolean) // null/undefined 제거
          )
        ) as string[];

        // 카테고리 목록을 상위 컴포넌트로 전달
        onCategoriesExtracted?.(uniqueCategories);
      } else {
        // API 실패 또는 데이터 없음 - 목데이터 사용
        console.warn("공지사항 조회 실패, 목데이터 사용:", result.message);
        setAllNotices(MOCK_NOTICES);

        // 목데이터에서 카테고리 추출
        const mockCategories = Array.from(
          new Set(MOCK_NOTICES.map((n) => n.categoryCode).filter(Boolean))
        ) as string[];
        onCategoriesExtracted?.(mockCategories);
      }
    } catch (error) {
      // 오류 발생 시 목데이터 사용
      console.error("공지사항 조회 오류, 목데이터 사용:", error);
      setAllNotices(MOCK_NOTICES);

      const mockCategories = Array.from(
        new Set(MOCK_NOTICES.map((n) => n.categoryCode).filter(Boolean))
      ) as string[];
      onCategoriesExtracted?.(mockCategories);
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리별로 필터링 후 정렬
  const notices = (category
    ? allNotices.filter(notice =>
        notice.source === category
      )
    : allNotices
  ).sort((a, b) => {
    if (localSortType === "popular") {
      const viewA = a.hits ?? a.viewCount ?? 0;
      const viewB = b.hits ?? b.viewCount ?? 0;
      return viewB - viewA; // 인기순 (조회수 높은 순)
    } else {
      const dateA = parseDate(a.date || a.publishedAt);
      const dateB = parseDate(b.date || b.publishedAt);
      return dateB.getTime() - dateA.getTime(); // 최신순
    }
  });

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotices();
    setRefreshing(false);
  };

  // 앱 시작 시 읽은 목록 불러오기 + 공지사항 불러오기
  useEffect(() => {
    const loadData = async () => {
      const storedRead = await AsyncStorage.getItem("readTitles");
      if (storedRead) {
        setReadTitles(JSON.parse(storedRead));
      }

      // 전체 공지사항 불러오기 (1회만)
      await fetchNotices();
    };
    loadData();
  }, []);

  // 읽은 제목 추가 + 저장
  const handleTitlePress = async (notice: Notice) => {
    try {
      if (!readTitles.includes(notice.id)) {
        const updated = [...readTitles, notice.id];
        setReadTitles(updated);
        await AsyncStorage.setItem("readTitles", JSON.stringify(updated));
      }
      (navi as any).navigate("Detail", { notice });
    } catch (error) {
      console.error("제목 클릭 처리 중 오류:", error);
    }
  };

  const handleBookmark = async (notice: Notice) => {
    try {
      const wasBookmarked = isBookmarked(notice.id);
      await toggleBookmark(notice);
      showToast(wasBookmarked ? "북마크에서 제거되었습니다." : "북마크에 추가되었습니다.");
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

  const swipe = (notice: Notice) => {
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
        onPress={() => handleShare(notice.title)}
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
            handleBookmark(notice);
          }}
        >
          <Image
            source={
              isBookmarked(notice.id)
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

  // 월별로 그룹화
  const groupedNotices: { [key: string]: Notice[] } = {};
  notices.forEach((notice) => {
    const dateStr = notice.date || notice.publishedAt;
    const parsedDate = parseDate(dateStr);
    const yearMonth = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    if (!groupedNotices[yearMonth]) {
      groupedNotices[yearMonth] = [];
    }
    groupedNotices[yearMonth].push(notice);
  });

  const months = Object.keys(groupedNotices).sort((a, b) => b.localeCompare(a)); // 최신 월순

  // 첫 로딩 중일 때만 로딩 화면 표시
  if (isLoading && allNotices.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3366FF" />
        <Text style={{ fontFamily: "Pretendard-Regular", fontSize: 14, marginTop: 10 }}>
          공지사항을 불러오는 중...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
          {months.map((month, monthIndex) => {
            return (
              <View key={month} style={{ zIndex: monthIndex === 0 ? 1000 : 1, overflow: "visible" }}>
                {/* 월 헤더와 필터 (첫 번째 월에만 필터 표시) */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 15,
                    marginTop: 10,
                    marginBottom: 0,
                    zIndex: 1000,
                    overflow: "visible",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Pretendard-Light",
                      fontSize: 12,
                    }}
                  >
                    {month}
                  </Text>

                  {/* 첫 번째 월에만 정렬 필터 표시 */}
                  {monthIndex === 0 && (
                    <View style={{ position: "relative", zIndex: 1001 }}>
                      <TouchableOpacity
                        onPress={() => setShowSortMenu(!showSortMenu)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 6,
                          backgroundColor: "#FFFFFF",
                          borderWidth: 1,
                          borderColor: "#E0E0E0",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Pretendard-Regular",
                            fontSize: 12,
                            color: "#333333",
                          }}
                        >
                          {localSortType === "latest" ? "최신순" : "인기순"}
                        </Text>
                        <Text style={{ fontSize: 10, color: "#666666" }}>
                          {showSortMenu ? "▲" : "▼"}
                        </Text>
                      </TouchableOpacity>

                      {/* 정렬 메뉴 드롭다운 */}
                      {showSortMenu && (
                        <View
                          style={{
                            position: "absolute",
                            top: 28,
                            right: 0,
                            backgroundColor: "#FFFFFF",
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: "#E0E0E0",
                            overflow: "hidden",
                            elevation: 10,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            zIndex: 1002,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setLocalSortType("latest");
                              setShowSortMenu(false);
                            }}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 8,
                              backgroundColor: localSortType === "latest" ? "#F5F5F5" : "#FFFFFF",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Pretendard-Regular",
                                fontSize: 12,
                                color: localSortType === "latest" ? "#3366FF" : "#333333",
                              }}
                            >
                              최신순
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setLocalSortType("popular");
                              setShowSortMenu(false);
                            }}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 8,
                              backgroundColor: localSortType === "popular" ? "#F5F5F5" : "#FFFFFF",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Pretendard-Regular",
                                fontSize: 12,
                                color: localSortType === "popular" ? "#3366FF" : "#333333",
                              }}
                            >
                              인기순
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                <View
                  style={{
                    gap: 10,
                    marginTop: 10,
                    paddingHorizontal: 15,
                    overflow: "visible",
                    zIndex: 1,
                  }}
                >
                  {groupedNotices[month].map((notice, i) => {
                    const swipeKey = `${notice.id}`;
                    return (
                      <Swipeable
                        key={swipeKey}
                        renderRightActions={() => swipe(notice)}
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
                                  {parseDate(notice.date || notice.publishedAt).toLocaleDateString("ko-KR")}
                                </Text>
                                {notice.detailCategory && (
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
                                    {notice.detailCategory}
                                  </Text>
                                )}
                                {(notice.hits !== undefined || notice.viewCount !== undefined) && (
                                  <Text
                                    style={{
                                      fontFamily: "Pretendard-Light",
                                      fontSize: 10,
                                      color: "#999",
                                      marginLeft: 8,
                                    }}
                                  >
                                    조회 {notice.hits ?? notice.viewCount}
                                  </Text>
                                )}
                              </View>
                            </View>

                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                handleBookmark(notice);
                              }}
                              style={{
                                padding: 10,
                              }}
                            >
                              <Image
                                source={
                                  isBookmarked(notice.id)
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
              공지사항이 없습니다
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
