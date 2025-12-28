import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface AllProps {
  onCategoryChange?: (category: string) => void;
  availableCategories?: string[]; // 실제 존재하는 카테고리 목록
}

// 카테고리 코드와 한글 이름 매핑
const CATEGORY_MAP: { [code: string]: string } = {
  degree: "학사",
  academic_credit: "학점교류",
  general_events: "일반/행사/모집",
  scholarship: "장학금",
  tuition_payment: "등록금 납부",
  educational_test: "교육시험",
  volunteer: "봉사",
  job: "채용정보",
};

// 카테고리 코드 목록 (순서 유지)
const CATEGORY_CODES = [
  "degree",
  "academic_credit",
  "general_events",
  "scholarship",
  "tuition_payment",
  "educational_test",
  "volunteer",
  "job",
];

export default function All({ onCategoryChange, availableCategories }: AllProps) {
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
  });

  const [selected, setSelected] = useState(CATEGORY_CODES[0]);

  // 컴포넌트 마운트 시 첫 번째 카테고리 선택
  useEffect(() => {
    onCategoryChange?.(CATEGORY_CODES[0]);
  }, []);

  const handleCategoryPress = (categoryCode: string) => {
    setSelected(categoryCode);
    onCategoryChange?.(categoryCode);
  };

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
          height: 49,
          backgroundColor: "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: "#bababa",
        }}
      >
        {/* 탭 바 안 카테고리 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 50,
            }}
          >
            {CATEGORY_CODES.map((code) => (
              <TouchableOpacity
                key={code}
                onPress={() => handleCategoryPress(code)}
              >
                <View
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderBottomWidth: selected === code ? 4 : 0,
                    borderBottomColor: "#bababa",
                  }}
                >
                  <Text
                    style={{
                      fontFamily:
                        selected === code
                          ? "Pretendard-Bold"
                          : "Pretendard-Light",
                      color: selected === code ? "black" : "#555",
                      fontSize: 15,
                    }}
                  >
                    {CATEGORY_MAP[code]}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
