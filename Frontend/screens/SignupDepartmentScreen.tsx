import React, { useState } from "react";
import {
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
import { DEPARTMENTS } from "../constants/departments";

type SignupDepartmentNavigationProp = NativeStackNavigationProp<RootStackParamList, "SignupDepartment">;
type SignupDepartmentRouteProp = RouteProp<RootStackParamList, "SignupDepartment">;

const { width, height } = Dimensions.get("window");

// 반응형 크기 계산 함수
const responsiveWidth = (percent: number) => (width * percent) / 100;
const responsiveHeight = (percent: number) => (height * percent) / 100;
const responsiveFontSize = (size: number) => Math.min(size, width * (size / 400));

export default function SignupDepartmentScreen() {
  const navigation = useNavigation<SignupDepartmentNavigationProp>();
  const route = useRoute<SignupDepartmentRouteProp>();
  const { name, studentId } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [error, setError] = useState("");

  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  // Flatten all departments for search
  const allDepartments = DEPARTMENTS.flatMap(college => college.departments);

  // Filter departments based on search query
  const filteredDepartments = searchQuery
    ? allDepartments.filter(dept =>
        dept.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectDepartment = (dept: string) => {
    setSelectedDepartment(dept);
    setSearchQuery(dept);
    setError("");
  };

  const handleContinue = () => {
    if (!selectedDepartment) {
      setError("학과를 선택해주세요.");
      return;
    }
    setError("");
    navigation.navigate("SignupEmail", { name, studentId, department: selectedDepartment });
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

        {/* 학과 섹션 */}
        <Text style={styles.sectionTitle}>학과</Text>

        {/* 검색 입력 */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, error ? styles.inputError : null]}
            placeholder="학과 검색하기"
            placeholderTextColor="#AAAAAA"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text !== selectedDepartment) {
                setSelectedDepartment("");
              }
            }}
          />
          {searchQuery && !selectedDepartment && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery("");
                setSelectedDepartment("");
              }}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 검색 결과 */}
        {searchQuery && !selectedDepartment && filteredDepartments.length > 0 && (
          <ScrollView
            style={styles.searchResults}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {filteredDepartments.map((dept, index) => (
              <TouchableOpacity
                key={index}
                style={styles.searchResultItem}
                onPress={() => handleSelectDepartment(dept)}
              >
                <Text style={styles.searchResultText}>{dept}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 선택된 학과 표시 */}
        {selectedDepartment && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedText}>{selectedDepartment}</Text>
          </View>
        )}

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
    marginBottom: responsiveHeight(1.5),
  },
  searchContainer: {
    position: "relative",
    marginBottom: responsiveHeight(1),
  },
  searchInput: {
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(14),
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.5),
    paddingRight: responsiveWidth(10),
    backgroundColor: "#FAFAFA",
    textAlign: "left",
  },
  inputError: {
    borderColor: "red",
  },
  clearButton: {
    position: "absolute",
    right: responsiveWidth(4),
    top: responsiveHeight(1.5),
  },
  clearButtonText: {
    fontSize: responsiveFontSize(20),
    color: "#999",
  },
  searchResults: {
    maxHeight: responsiveHeight(25),
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: responsiveHeight(1),
  },
  searchResultItem: {
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchResultText: {
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(15),
    color: "#333333",
  },
  selectedContainer: {
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
    backgroundColor: "#F0F5FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3366FF",
    marginBottom: responsiveHeight(1),
  },
  selectedText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: responsiveFontSize(15),
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
