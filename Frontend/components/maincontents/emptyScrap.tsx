import { useFonts } from "expo-font";
import React from "react";
import { Image, Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

interface EmptyScrapProps {
  type: "관심 공지" | "스크랩 공지";
}

type EmptyScrapNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EmptyScrap({ type }: EmptyScrapProps) {
  const navigation = useNavigation<EmptyScrapNavigationProp>();
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  const isInterest = type === "관심 공지";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require("../../assets/images/empty.png")}
        style={{ width: 40, height: 47, marginBottom: 20 }}
      />
      <Text
        style={{
          fontFamily: "Pretendard-Bold",
          fontSize: 20,
          marginLeft: 50,
          marginRight: 50,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        {isInterest ? "알림이 온 공지가 없습니다" : "저장한 공지가 없습니다"}
      </Text>
      <Text
        style={{
          fontFamily: "Pretendard-Regular",
          fontSize: 15,
          marginLeft: 50,
          marginRight: 50,
          marginBottom: 4,
          textAlign: "center",
          color: "#666",
        }}
      >
        {isInterest ? "관심있는 키워드를 알림 설정하여" : "관심 있는 공지를 스크랩하여"}
      </Text>
      <Text
        style={{
          fontFamily: "Pretendard-Regular",
          fontSize: 15,
          marginLeft: 50,
          marginRight: 50,
          marginBottom: isInterest ? 20 : 150,
          textAlign: "center",
          color: "#666",
        }}
      >
        언제든지 공지를 편하게 열람하세요!
      </Text>
      {isInterest && (
        <TouchableOpacity
          style={{
            backgroundColor: "#3366FF",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            marginBottom: 130,
          }}
          onPress={() => navigation.navigate("KeywordSettings")}
        >
          <Text
            style={{
              fontFamily: "Pretendard-SemiBold",
              fontSize: 16,
              color: "#fff",
            }}
          >
            키워드 설정하기
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
