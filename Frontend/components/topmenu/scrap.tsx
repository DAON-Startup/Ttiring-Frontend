import { useFonts } from "expo-font";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ScrapProps {
  selectedTab: "관심 공지" | "스크랩 공지";
  onTabChange: (tab: "관심 공지" | "스크랩 공지") => void;
}

export default function Scrap({ selectedTab, onTabChange }: ScrapProps) {
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
  });
  const categories: ("관심 공지" | "스크랩 공지")[] = ["관심 공지", "스크랩 공지"];

  if (!fontsLoaded) return null;

  return (
    <View
      style={{
        width: "100%",
        height: 49,
        backgroundColor: "white",
      }}
    >
      {/* 탭 바 (크기 고정) */}
      <View
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: "#bababa",
        }}
      >
        {/* 탭 바 안 카테고리 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 50,
            flex: 1,
          }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={{ flex: 1 }}
              onPress={() => onTabChange(category)}
            >
              <View
                style={{
                  paddingHorizontal: 0,
                  paddingVertical: 15,
                  borderBottomWidth: selectedTab === category ? 4 : 0,
                  borderBottomColor: "#bababa",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily:
                      selectedTab === category
                        ? "Pretendard-Bold"
                        : "Pretendard-Light",
                    color: selectedTab === category ? "black" : "#555",
                    fontSize: 15,
                  }}
                >
                  {category}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
