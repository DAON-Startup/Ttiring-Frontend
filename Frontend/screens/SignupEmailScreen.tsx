import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { useFonts } from "expo-font";

type SignupEmailNavigationProp = NativeStackNavigationProp<RootStackParamList, "SignupEmail">;
type SignupEmailRouteProp = RouteProp<RootStackParamList, "SignupEmail">;

const { width, height } = Dimensions.get("window");

// 반응형 크기 계산 함수
const responsiveWidth = (percent: number) => (width * percent) / 100;
const responsiveHeight = (percent: number) => (height * percent) / 100;
const responsiveFontSize = (size: number) => Math.min(size, width * (size / 400));

export default function SignupEmailScreen() {
  const navigation = useNavigation<SignupEmailNavigationProp>();
  const route = useRoute<SignupEmailRouteProp>();
  const { name, studentId, department } = route.params;
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  // 이메일이 올바른 도메인으로 끝나는지 확인
  const isValidEmail = email.endsWith("@inu.ac.kr");

  const validateEmail = (text: string) => {
    if (!text || !text.endsWith("@inu.ac.kr")) {
      setEmailError("학교 이메일(@inu.ac.kr)을 사용해주세요.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleContinue = () => {
    if (!validateEmail(email)) {
      // 학교 이메일이 아닌 경우 경고 후 진행 여부 확인
      if (email && !email.endsWith("@inu.ac.kr")) {
        Alert.alert(
          "알림",
          "학교 이메일(@inu.ac.kr)이 아닙니다. 그래도 계속하시겠습니까?",
          [
            { text: "취소", style: "cancel" },
            {
              text: "계속",
              onPress: () => {
                navigation.navigate("SignupPassword", { name, studentId, department, email });
              },
            },
          ]
        );
        return;
      }
      return;
    }
    navigation.navigate("SignupPassword", { name, studentId, department, email });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* 타이틀 */}
        <Text style={styles.title}>띠링인캠퍼스</Text>

        {/* 로고 이미지 */}
        <Image
          source={require("../assets/images/Logo.png")}
          style={styles.logo}
        />

        {/* 이메일 섹션 */}
        <Text style={styles.sectionTitle}>이메일</Text>

        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="이메일을 입력해 주세요"
          placeholderTextColor="#AAAAAA"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (text) setEmailError("");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* 도메인 안내 문구 - 올바르게 입력하면 사라짐 */}
        {!isValidEmail && (
          <Text style={styles.hintText}>@inu.ac.kr 도메인을 포함해주세요.</Text>
        )}

        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        {/* 계속하기 버튼 */}
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>계속하기</Text>
        </TouchableOpacity>

        {/* 하단 문구 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>INU Announcement Notification App</Text>
          <Text style={styles.footerSubText}>© DAON</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: responsiveWidth(8),
    paddingTop: responsiveHeight(6),
    paddingBottom: responsiveHeight(4),
    minHeight: height,
  },
  title: {
    fontFamily: "Pretendard-ExtraBold",
    fontSize: responsiveFontSize(20),
    color: "#000000",
    textAlign: "center",
    marginBottom: responsiveHeight(2),
  },
  logo: {
    width: Math.min(responsiveWidth(30), 120),
    height: Math.min(responsiveWidth(30), 120),
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: responsiveHeight(5),
  },
  sectionTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: responsiveFontSize(18),
    color: "#333333",
    marginBottom: responsiveHeight(1.5),
  },
  input: {
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(14),
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.5),
    backgroundColor: "#FAFAFA",
    marginBottom: responsiveHeight(0.5),
    width: "100%",
    textAlign: "left",
  },
  inputError: {
    borderColor: "red",
  },
  hintText: {
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(12),
    color: "red",
    marginBottom: responsiveHeight(0.5),
  },
  errorText: {
    fontFamily: "Pretendard-Regular",
    color: "red",
    fontSize: responsiveFontSize(12),
    marginBottom: responsiveHeight(1),
  },
  button: {
    backgroundColor: "#3366FF",
    borderRadius: 10,
    paddingVertical: responsiveHeight(1.8),
    alignItems: "center",
    marginTop: responsiveHeight(2),
    width: "100%",
  },
  buttonText: {
    fontFamily: "Pretendard-Bold",
    fontSize: responsiveFontSize(16),
    color: "#FFFFFF",
  },
  footer: {
    position: "absolute",
    bottom: responsiveHeight(5),
    left: 0,
    right: 0,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(14),
    color: "#AAAAAA",
    textAlign: "center",
    marginBottom: responsiveHeight(1),
  },
  footerSubText: {
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(12),
    color: "#AAAAAA",
    textAlign: "center",
  },
});
