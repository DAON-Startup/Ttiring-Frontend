import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React from "react";
import {
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNotification } from "../../context/NotificationContext";
import { useBookmark } from "../../context/BookmarkContext";
import { useToast } from "../../context/ToastContext";
import { Notice } from "../../services/crawlerAPI";

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

export default function NotificationList() {
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
  });

  const navi = useNavigation();
  const { notificationNotices, removeNotification } = useNotification();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const { showToast } = useToast();

  const handleTitlePress = (notice: Notice) => {
    (navi as any).navigate("Detail", { notice });
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

  const handleDelete = async (id: string) => {
    try {
      await removeNotification(id);
    } catch (error) {
      console.error("알림 삭제 중 오류:", error);
    }
  };

  if (!fontsLoaded) return null;

  if (notificationNotices.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <Text style={{ fontFamily: "Pretendard-Light", fontSize: 16, color: "#999" }}>
          받은 알림이 없습니다
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text
          style={{
            fontFamily: "Pretendard-Bold",
            fontSize: 16,
            marginTop: 15,
            marginBottom: 10,
            marginLeft: 15,
          }}
        >
          받은 알림 ({notificationNotices.length})
        </Text>

        <View
          style={{
            gap: 10,
            paddingHorizontal: 15,
          }}
        >
          {notificationNotices.map((notice) => (
            <TouchableOpacity
              key={notice.id}
              onPress={() => handleTitlePress(notice)}
            >
              <View
                style={{
                  width: "100%",
                  minHeight: 80,
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
                        color: "#000000",
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

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleBookmark(notice);
                    }}
                    style={{ padding: 5 }}
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
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleShare(notice.title);
                    }}
                    style={{ padding: 5, marginLeft: 5 }}
                  >
                    <Image
                      source={require("../../assets/images/export.png")}
                      style={{
                        width: 24,
                        height: 24,
                        resizeMode: "contain",
                      }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDelete(notice.id);
                    }}
                    style={{ padding: 5, marginLeft: 5 }}
                  >
                    <Image
                      source={require("../../assets/images/close.png")}
                      style={{
                        width: 24,
                        height: 24,
                        resizeMode: "contain",
                        tintColor: "#FF3B30",
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
