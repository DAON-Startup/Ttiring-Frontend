import { useFonts } from "expo-font";
import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotification } from "../../context/NotificationContext";

export default function Alert() {
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
  });

  const { notificationNotices, removeNotification, clearAllNotifications } = useNotification();
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      const saved = await AsyncStorage.getItem("userKeywords");
      if (saved) {
        setKeywords(JSON.parse(saved));
      }
    } catch (error) {
      console.error("키워드 불러오기 오류:", error);
    }
  };

  const filteredNotices = notificationNotices.filter((notice) => {
    if (keywords.length === 0) return true;
    return keywords.some((keyword) => notice.title.includes(keyword) || notice.content?.includes(keyword));
  });

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: "#D1D1D1",
      }}>
        <Text style={{ fontFamily: "Pretendard-Bold", fontSize: 15 }}>
          알림함
        </Text>
        {filteredNotices.length > 0 && (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={{ fontFamily: "Pretendard-Regular", fontSize: 13, color: "#666" }}>
              전체 삭제
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView>
        {filteredNotices.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ fontFamily: "Pretendard-Regular", fontSize: 14, color: "#999" }}>
              알림이 없습니다
            </Text>
          </View>
        ) : (
          filteredNotices.map((notice) => (
            <View
              key={notice.id}
              style={{
                borderBottomWidth: 1,
                borderColor: "#D1D1D1",
                padding: 15,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: "Pretendard-Bold", fontSize: 14, flex: 1 }}>
                  {notice.title}
                </Text>
                <TouchableOpacity onPress={() => removeNotification(notice.id)}>
                  <Text style={{ color: "#999", fontSize: 18 }}>×</Text>
                </TouchableOpacity>
              </View>
              {notice.content && (
                <Text style={{
                  fontFamily: "Pretendard-Regular",
                  fontSize: 13,
                  color: "#666",
                  marginTop: 5,
                }}
                numberOfLines={2}
                >
                  {notice.content}
                </Text>
              )}
              <Text style={{
                fontFamily: "Pretendard-Regular",
                fontSize: 11,
                color: "#999",
                marginTop: 5,
              }}>
                {notice.publishedAt}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
