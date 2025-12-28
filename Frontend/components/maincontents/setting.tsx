import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TokenService } from "../../services/tokenService";
import { logout, getMyInfo } from "../../services/userSettingsAPI";

export default function Setting() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("김민지");
  const [userMajor, setUserMajor] = useState("컴퓨터공학부 25학번");
  const [userEmail, setUserEmail] = useState("1234abcd@inu.ac.kr");

  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
  });

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const response = await getMyInfo(token);
          console.log("API 응답:", response);
          if (response.success && response.data) {
            const userData = response.data;
            setUserName(userData.name || "이름 없음");
            setUserEmail(userData.email || "이메일 없음");

            // 학과와 학번 조합
            const deptName = userData.department?.name || "";
            const studentId = userData.studentId || "";
            if (deptName && studentId) {
              setUserMajor(`${deptName} ${studentId}`);
            } else if (deptName) {
              setUserMajor(deptName);
            } else if (studentId) {
              setUserMajor(studentId);
            } else {
              setUserMajor("정보 없음");
            }
          }
        }
      } catch (error) {
        console.error("사용자 정보 로드 오류:", error);
      }
    };
    loadUserInfo();
  }, []);
  const category = ["계정", "앱 설정", "이용 안내", "기타"];
  const images = [
    require("../../assets/images/person.png"),
    require("../../assets/images/setting.png"),
    require("../../assets/images/paper.png"),
    require("../../assets/images/plus.png"),
  ];
  const accont = ["1. 내 정보", "2. 로그아웃", "3. 회원 탈퇴"];
  const appSetting = ["1. 화면모드", "2. 알림 설정", "3. 알림 키워드"];
  const guide = ["1. 서비스 이용 약관", "2. 문의하기", "3. 앱 소개"];
  const plus = ["1. 개인정보 처리 방침", "2. 앱 버전"];

  const subArrays = [accont, appSetting, guide, plus];

  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          await logout(token);
        }
      } catch (error) {
        console.error("로그아웃 API 오류:", error);
      }
      TokenService.clearAll();
      AsyncStorage.removeItem("fcmToken");
      (navigation as any).reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
      window.alert("로그아웃 되었습니다.");
    }
  };

  const handleDeleteAccount = () => {
    (navigation as any).navigate("DeleteAccount");
  };

  const handleMenuPress = (categoryItem: string, subItem: string) => {
    // 내 정보
    if (subItem === "1. 내 정보") {
      (navigation as any).navigate("MyInfo");
      return;
    }

    // 로그아웃
    if (subItem === "2. 로그아웃") {
      handleLogout();
      return;
    }

    // 회원 탈퇴
    if (subItem === "3. 회원 탈퇴") {
      handleDeleteAccount();
      return;
    }

    // 알림 설정
    if (subItem === "2. 알림 설정") {
      (navigation as any).navigate("NotificationSettings");
      return;
    }

    // 알림 키워드
    if (subItem === "3. 알림 키워드") {
      (navigation as any).navigate("KeywordSettings");
      return;
    }

    // 앱 버전
    if (subItem === "2. 앱 버전") {
      Alert.alert("앱 버전", "버전 1.00");
      return;
    }

    // 나머지는 개발 중
    Alert.alert("안내", `${subItem}\n\n현재 개발 중인 기능입니다.`);
  };

  if (!fontsLoaded) return null;

  return (
    <ScrollView style={{ flex: 1 }}>
      {/* 상단 유저 정보 요약 */}
      <View
        style={{
          padding: 20,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 2,
          borderColor: "#BDBDBD",
          paddingBottom: 20,
          marginBottom: 10,
        }}
      >
        <Image
          source={require("../../assets/images/ID_card.png")}
          style={{
            width: 50,
            height: 50,
            resizeMode: "contain",
            marginRight: 15,
          }}
        />
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 10,
              marginBottom: 5,
            }}
          >
            <Text
              style={{
                fontFamily: "Pretendard-Bold",
                fontSize: 20,
                color: "#000",
              }}
            >
              {userName}
            </Text>
            <Text
              style={{
                fontFamily: "Pretendard-Regular",
                color: "#BDBDBD",
                fontSize: 20,
                marginHorizontal: 10,
              }}
            >
              |
            </Text>
            <Text
              style={{
                fontFamily: "Pretendard-Regular",
                color: "#BDBDBD",
                fontSize: 15,
              }}
            >
              {userMajor}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Pretendard-Regular",
              marginLeft: 10,
              color: "#BDBDBD",
              fontSize: 15,
            }}
          >
            {userEmail}
          </Text>
        </View>
      </View>

      {/* 설정 카테고리 리스트 */}
      <View style={{ padding: 10, paddingBottom: 100 }}>
        {category.map((categoryItem, index) => (
          <View key={index} style={{ marginBottom: 30 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 15,
                paddingLeft: 10,
              }}
            >
              {images[index] && (
                <Image
                  source={images[index]}
                  style={{
                    width: 20,
                    height: 20,
                    resizeMode: "contain",
                    marginRight: 15,
                  }}
                />
              )}
              <Text
                style={{
                  fontFamily: "Pretendard-Regular",
                  fontSize: 15,
                  color: "#000000",
                }}
              >
                {categoryItem}
              </Text>
            </View>

            {/* 하위 항목들을 항상 표시 */}
            <View style={{}}>
              {subArrays[index].map((subItem, subIndex) => (
                <TouchableOpacity
                  key={subIndex}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onPress={() => handleMenuPress(categoryItem, subItem)}
                >
                  <Text
                    style={{
                      fontFamily: "Pretendard-Light",
                      fontSize: 13,
                      color: "#000000",
                      flex: 1,
                    }}
                  >
                    {subItem}
                  </Text>
                  {subItem !== "2. 앱 버전" && (
                    <Text
                      style={{
                        fontSize: 25,
                        color: "#000000",
                        marginRight: 10,
                      }}
                    >
                      ›
                    </Text>
                  )}
                  {subItem === "2. 앱 버전" && (
                    <Text
                      style={{
                        fontFamily: "Pretendard-Light",
                        fontSize: 13,
                        color: "#999",
                        marginRight: 10,
                      }}
                    >
                      1.00
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
