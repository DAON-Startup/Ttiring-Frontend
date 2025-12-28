import { useFonts } from "expo-font";
import React, { useState, useEffect } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { TokenService } from "../../services/tokenService";

type MyInfoNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyInfo() {
  const navigation = useNavigation<MyInfoNavigationProp>();
  const [userName, setUserName] = useState("김민지");
  const [userEmail, setUserEmail] = useState("1234abcd@inu.ac.kr");
  const [userStudentId, setUserStudentId] = useState("25학번");
  const [userDepartment, setUserDepartment] = useState("컴퓨터공학부");

  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await TokenService.getUserInfo();
        if (userInfo) {
          setUserName(userInfo.name || "김민지");
          setUserEmail(userInfo.email || "1234abcd@inu.ac.kr");
          setUserStudentId(userInfo.studentId || "25학번");
          setUserDepartment(userInfo.department || "컴퓨터공학부");
        }
      } catch (error) {
        console.error("사용자 정보 로드 오류:", error);
      }
    };
    loadUserInfo();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontFamily: "Pretendard-Bold",
            fontSize: 20,
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          내 정보
        </Text>

        {/* 이메일 */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: "Pretendard-Regular",
              fontSize: 14,
              marginBottom: 8,
              color: "#666",
            }}
          >
            이메일
          </Text>
          <Text
            style={{
              fontFamily: "Pretendard-Regular",
              fontSize: 16,
              color: "#BDBDBD",
              paddingVertical: 12,
              paddingHorizontal: 15,
              backgroundColor: "#F5F5F5",
              borderRadius: 8,
            }}
          >
            {userEmail}
          </Text>
        </View>

        {/* 학과 */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: "Pretendard-Regular",
              fontSize: 14,
              marginBottom: 8,
              color: "#666",
            }}
          >
            학과
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 15,
              backgroundColor: "#F5F5F5",
              borderRadius: 8,
            }}
            onPress={() => navigation.navigate("DepartmentSelection", {
              onSelect: (selectedDept: string) => {
                setUserDepartment(selectedDept);
                // TODO: Save to backend and TokenService
              }
            })}
          >
            <Text
              style={{
                fontFamily: "Pretendard-Regular",
                fontSize: 16,
                color: "#000",
              }}
            >
              {userDepartment}
            </Text>
            <Text style={{ fontSize: 20, color: "#666" }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 학번 */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: "Pretendard-Regular",
              fontSize: 14,
              marginBottom: 8,
              color: "#666",
            }}
          >
            학번
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 15,
              backgroundColor: "#F5F5F5",
              borderRadius: 8,
            }}
            onPress={() => navigation.navigate("StudentIdSelection", {
              onSelect: (selectedId: string) => {
                setUserStudentId(selectedId);
                // TODO: Save to backend and TokenService
              }
            })}
          >
            <Text
              style={{
                fontFamily: "Pretendard-Regular",
                fontSize: 16,
                color: "#000",
              }}
            >
              {userStudentId}
            </Text>
            <Text style={{ fontSize: 20, color: "#666" }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 이름 */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: "Pretendard-Regular",
              fontSize: 14,
              marginBottom: 8,
              color: "#666",
            }}
          >
            이름
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 15,
              backgroundColor: "#F5F5F5",
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Pretendard-Regular",
                fontSize: 16,
                color: "#000",
              }}
            >
              {userName}
            </Text>
            <Text style={{ fontSize: 20, color: "#666" }}>›</Text>
          </View>
        </View>

        {/* 비밀번호 */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: "Pretendard-Regular",
              fontSize: 14,
              marginBottom: 8,
              color: "#666",
            }}
          >
            비밀번호
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 15,
              backgroundColor: "#F5F5F5",
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Pretendard-Regular",
                fontSize: 16,
                color: "#000",
              }}
            >
              ••••••••
            </Text>
            <Text style={{ fontSize: 20, color: "#666" }}>›</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
