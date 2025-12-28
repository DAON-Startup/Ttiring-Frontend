import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../App";
import { useFonts } from "expo-font";
import Header from "@/components/topmenu/header";
import BottomBar from "@/components/bottombar/bottombar";
import { useSignup } from "@/context/SignupContext";

type StudentIdSelectionNavigationProp = NativeStackNavigationProp<RootStackParamList, "StudentIdSelection">;
type StudentIdSelectionRouteProp = RouteProp<RootStackParamList, "StudentIdSelection">;

export default function StudentIdSelectionScreen() {
  const navigation = useNavigation<StudentIdSelectionNavigationProp>();
  const route = useRoute<StudentIdSelectionRouteProp>();
  const { setStudentId: setContextStudentId } = useSignup();
  const [selectedYear, setSelectedYear] = useState<number | null>(25);
  const [activeTab, setActiveTab] = useState<number>(4);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    switch (index) {
      case 0:
        navigation.navigate('Home');
        break;
      case 1:
        navigation.navigate('Scrap');
        break;
      case 2:
        navigation.navigate('Chatbot');
        break;
      case 3:
        navigation.navigate('Search');
        break;
      case 4:
        navigation.navigate('Setting');
        break;
    }
  };

  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };

  const handleSave = () => {
    if (selectedYear) {
      const studentIdStr = `${selectedYear}학번`;
      console.log("학번 선택됨:", studentIdStr);

      // Context에 학번 저장 (회원가입 플로우용)
      setContextStudentId(studentIdStr);
      console.log("Context에 학번 저장 완료:", studentIdStr);

      // 기존 콜백도 지원 (다른 화면에서 사용할 경우)
      if (route.params?.onSelect) {
        route.params.onSelect(studentIdStr);
      }
    }
    navigation.goBack();
  };

  // Generate years from 14 to 25
  const years = Array.from({ length: 12 }, (_, i) => 25 - i);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Header showBackButton={true} onBackPress={handleBackPress} />

      <View style={styles.content}>
        <Text style={styles.title}>학번 선택</Text>

        {/* Year Grid */}
        <View style={styles.yearGrid}>
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearButton,
                selectedYear === year && styles.yearButtonSelected,
              ]}
              onPress={() => handleYearSelect(year)}
            >
              <Text
                style={[
                  styles.yearText,
                  selectedYear === year && styles.yearTextSelected,
                ]}
              >
                {year}학번
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장하기</Text>
        </TouchableOpacity>
      </View>

      <BottomBar onTabPress={handleTabPress} activeTab={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 40,
  },
  yearButton: {
    width: "28%",
    paddingVertical: 14,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  yearButtonSelected: {
    backgroundColor: "#3478F6",
    borderColor: "#3478F6",
  },
  yearText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 15,
    color: "#666",
  },
  yearTextSelected: {
    fontFamily: "Pretendard-SemiBold",
    color: "#fff",
  },
  saveButton: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#3478F6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  saveButtonText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});
