import React from "react";
import { Text, View, Image } from "react-native";

export default function Chatbot() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      }}
    >
      <Text
        style={{
          fontSize: 80,
          marginBottom: 30,
        }}
      >
        🤖
      </Text>
      <Text
        style={{
          fontFamily: "Pretendard-Bold",
          fontSize: 24,
          color: "#333",
          marginBottom: 15,
          textAlign: "center",
        }}
      >
        AI 챗봇
      </Text>
      <Text
        style={{
          fontFamily: "Pretendard-Regular",
          fontSize: 16,
          color: "#666",
          textAlign: "center",
          lineHeight: 24,
          marginBottom: 10,
        }}
      >
        현재 개발 중입니다
      </Text>
      <Text
        style={{
          fontFamily: "Pretendard-Light",
          fontSize: 14,
          color: "#999",
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        곧 더 나은 서비스로{"\n"}찾아뵙겠습니다!
      </Text>
    </View>
  );
}
