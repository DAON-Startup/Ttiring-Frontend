import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Notice, searchNotices } from "../../services/crawlerAPI";
import {
  getRecentSearches as fetchRecentSearches,
  saveRecentSearch as saveRecentSearchAPI,
  deleteRecentSearch as deleteRecentSearchAPI,
  RecentSearch as ServerRecentSearch,
} from "../../services/searchAPI";

// 최근 검색어 타입 (로컬용)
interface RecentSearch {
  id?: number; // 서버 ID
  keyword: string;
  date: string; // YYYY-MM-DD
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

const RECENT_SEARCH_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 5;

export default function Search() {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
  });

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Notice[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 새로고침 (검색 결과 초기화하여 다시 검색 가능하게)
  const onRefresh = () => {
    setRefreshing(true);
    setHasSearched(false);
    setSearchResults([]);
    setSearchText("");
    setRefreshing(false);
  };

  // 앱 시작 시 최근 검색어 불러오기
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // 최근 검색어 불러오기
  const loadRecentSearches = async () => {
    try {
      // 로컬 캐시 먼저 불러오기
      const stored = await AsyncStorage.getItem(RECENT_SEARCH_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }

      // 서버에서 동기화
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const response = await fetchRecentSearches(token);
        if (response.success && response.data) {
          const serverSearches: RecentSearch[] = response.data.map((item: ServerRecentSearch) => ({
            id: item.id,
            keyword: item.keyword,
            date: new Date(item.searchedAt).toISOString().split('T')[0], // YYYY-MM-DD 형식
          }));
          setRecentSearches(serverSearches);
          await AsyncStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(serverSearches));
        }
      }
    } catch (error) {
      console.error("최근 검색어 불러오기 오류:", error);
    }
  };

  // 최근 검색어 저장하기
  const saveRecentSearch = async (keyword: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      // 로컬 시간 기준으로 YYYY-MM-DD 형식 생성
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      let newSearch: RecentSearch = { keyword, date: today };

      // 서버에 저장
      if (token) {
        try {
          const response = await saveRecentSearchAPI(keyword, token);
          if (response.success && response.data) {
            newSearch = {
              id: response.data.id,
              keyword: response.data.keyword,
              date: new Date(response.data.searchedAt).toISOString().split('T')[0],
            };
          }
        } catch (error) {
          console.error("서버 검색어 저장 오류:", error);
        }
      }

      // 기존 검색어 중 같은 키워드 제거 후 맨 앞에 추가
      const filtered = recentSearches.filter((item) => item.keyword !== keyword);
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("최근 검색어 저장 오류:", error);
    }
  };

  // 최근 검색어 삭제
  const deleteRecentSearch = async (keyword: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const searchItem = recentSearches.find((item) => item.keyword === keyword);

      // 서버에서 삭제
      if (token && searchItem?.id) {
        try {
          await deleteRecentSearchAPI(searchItem.id, token);
        } catch (error) {
          console.error("서버 검색어 삭제 오류:", error);
        }
      }

      // 로컬에서 삭제
      const updated = recentSearches.filter((item) => item.keyword !== keyword);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("최근 검색어 삭제 오류:", error);
    }
  };

  // 최근 검색어 클릭 시 검색 실행
  const handleRecentSearchPress = (keyword: string) => {
    setSearchText(keyword);
    performSearch(keyword);
  };

  // 검색 실행
  const performSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // 최근 검색어 저장
    await saveRecentSearch(keyword.trim());

    try {
      const result = await searchNotices(keyword.trim());
      if (result.success) {
        setSearchResults(result.data);
      } else {
        console.error("검색 실패:", result.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("검색 오류:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    performSearch(searchText);
  };

  const handleNoticePress = (notice: Notice) => {
    (navigation as any).navigate("Detail", { notice });
  };

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 15 }}>
      {/* 검색 인풋 박스 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#ffffff",
          borderRadius: 5,
          borderWidth: 1,
          borderColor: "#BDBDBD",
          paddingHorizontal: 15,
          paddingVertical: 10,
          marginBottom: 15,
        }}
      >
        <Image
          source={require("../../assets/images/search.png")} // 검색 아이콘
          style={{
            width: 20,
            height: 20,
            marginRight: 10,
            tintColor: "#999",
          }}
        />
        <TextInput
          style={{
            flex: 1,
            fontFamily: "Pretendard-Regular",
            fontSize: 16,
            color: "#000",
          }}
          placeholder="공지사항, 대학교 정보 검색"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Image
              source={require("../../assets/images/close.png")} // X 아이콘
              style={{
                width: 15,
                height: 15,
              }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 최근 검색어 영역 (검색 전에만 표시) */}
      {!hasSearched && recentSearches.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: "Pretendard-Bold",
              fontSize: 14,
              color: "#333",
              marginBottom: 10,
            }}
          >
            최근 검색어
          </Text>
          {recentSearches.map((item, index) => (
            <View
              key={`${item.keyword}-${index}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#f0f0f0",
              }}
            >
              <TouchableOpacity
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                onPress={() => handleRecentSearchPress(item.keyword)}
              >
                <Image
                  source={require("../../assets/images/search.png")}
                  style={{
                    width: 16,
                    height: 16,
                    marginRight: 10,
                    tintColor: "#999",
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Pretendard-Regular",
                    fontSize: 14,
                    color: "#333",
                    flex: 1,
                  }}
                >
                  {item.keyword}
                </Text>
                <Text
                  style={{
                    fontFamily: "Pretendard-Light",
                    fontSize: 12,
                    color: "#999",
                    marginRight: 10,
                  }}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteRecentSearch(item.keyword)}
                style={{ padding: 5 }}
              >
                <Image
                  source={require("../../assets/images/close.png")}
                  style={{
                    width: 12,
                    height: 12,
                    tintColor: "#999",
                  }}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* 검색 결과 영역 */}
      {isSearching ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3366FF" />
          <Text
            style={{
              fontFamily: "Pretendard-Regular",
              fontSize: 14,
              marginTop: 10,
              color: "#666",
            }}
          >
            검색 중...
          </Text>
        </View>
      ) : !hasSearched ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 100,
          }}
        >
          {recentSearches.length === 0 && (
            <Text
              style={{
                fontFamily: "Pretendard-Light",
                fontSize: 16,
                color: "#999",
              }}
            >
              검색어를 입력해주세요
            </Text>
          )}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {searchResults.length > 0 ? (
            <>
              <Text
                style={{
                  fontFamily: "Pretendard-Regular",
                  fontSize: 14,
                  color: "#666",
                  marginBottom: 15,
                }}
              >
                검색 결과 {searchResults.length}개
              </Text>

              {searchResults.map((notice) => (
                <TouchableOpacity
                  key={notice.id}
                  onPress={() => handleNoticePress(notice)}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 12,
                    paddingHorizontal: 20,
                    paddingVertical: 15,
                    marginBottom: 10,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Pretendard-Regular",
                      fontSize: 15,
                      color: "#000000",
                      marginBottom: 8,
                    }}
                    numberOfLines={2}
                  >
                    {notice.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Pretendard-Light",
                        fontSize: 12,
                        color: "#666",
                      }}
                    >
                      {parseDate(notice.date || notice.publishedAt).toLocaleDateString("ko-KR")}
                    </Text>
                    {notice.detailCategory && (
                      <Text
                        style={{
                          fontFamily: "Pretendard-Light",
                          fontSize: 11,
                          color: "#ffffff",
                          marginLeft: 8,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
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
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 100,
              }}
            >
              <Text
                style={{
                  fontFamily: "Pretendard-Light",
                  fontSize: 16,
                  color: "#999",
                }}
              >
                "{searchText}"에 대한 검색 결과가 없습니다
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
