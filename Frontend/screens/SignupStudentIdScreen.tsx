import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { useFonts } from "expo-font";

type SignupStudentIdNavigationProp = NativeStackNavigationProp<RootStackParamList, "SignupStudentId">;
type SignupStudentIdRouteProp = RouteProp<RootStackParamList, "SignupStudentId">;

const STUDENT_IDS = [
  "25학번", "24학번", "23학번",
  "22학번", "21학번", "20학번",
  "19학번", "18학번", "17학번",
  "16학번", "15학번", "14학번",
];

const { width, height } = Dimensions.get("window");

// 반응형 크기 계산 함수
const responsiveWidth = (percent: number) => (width * percent) / 100;
const responsiveHeight = (percent: number) => (height * percent) / 100;
const responsiveFontSize = (size: number) => Math.min(size, width * (size / 400));

export default function SignupStudentIdScreen() {
  const navigation = useNavigation<SignupStudentIdNavigationProp>();
  const route = useRoute<SignupStudentIdRouteProp>();
  const { name } = route.params;
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");

  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  const handleContinue = () => {
    if (!selectedId) {
      setError("학번을 선택해주세요.");
      return;
    }
    setError("");
    navigation.navigate("SignupDepartment", { name, studentId: selectedId });
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

        {/* 학번 섹션 */}
        <Text style={styles.sectionTitle}>학번</Text>

        {/* 학번 버튼 그리드 */}
        <View style={styles.grid}>
          {STUDENT_IDS.map((id) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.gridButton,
                selectedId === id && styles.gridButtonSelected,
              ]}
              onPress={() => {
                setSelectedId(id);
                setError("");
              }}
            >
              <Text
                style={[
                  styles.gridButtonText,
                  selectedId === id && styles.gridButtonTextSelected,
                ]}
              >
                {id}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
    marginBottom: responsiveHeight(2),
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: responsiveHeight(1),
  },
  gridButton: {
    width: "31%",
    paddingVertical: responsiveHeight(1.5),
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: responsiveHeight(1),
    backgroundColor: "#FAFAFA",
  },
  gridButtonSelected: {
    borderColor: "#3366FF",
    borderWidth: 2,
    backgroundColor: "#F0F5FF",
  },
  gridButtonText: {
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(15),
    color: "#333333",
  },
  gridButtonTextSelected: {
    fontFamily: "Pretendard-SemiBold",
    color: "#3366FF",
  },
  errorText: {
    fontFamily: "Pretendard-Regular",
    color: "red",
    fontSize: responsiveFontSize(13),
    marginBottom: responsiveHeight(1),
  },
  button: {
    backgroundColor: "#3366FF",
    borderRadius: 10,
    paddingVertical: responsiveHeight(1.8),
    alignItems: "center",
    marginTop: responsiveHeight(1),
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
