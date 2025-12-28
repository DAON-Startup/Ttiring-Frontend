import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../App";
import { useFonts } from "expo-font";
import Header from "@/components/topmenu/header";
import BottomBar from "@/components/bottombar/bottombar";
import { DEPARTMENTS } from "@/constants/departments";
import { useSignup } from "@/context/SignupContext";

type DepartmentSelectionNavigationProp = NativeStackNavigationProp<RootStackParamList, "DepartmentSelection">;
type DepartmentSelectionRouteProp = RouteProp<RootStackParamList, "DepartmentSelection">;

export default function DepartmentSelectionScreen() {
  const navigation = useNavigation<DepartmentSelectionNavigationProp>();
  const route = useRoute<DepartmentSelectionRouteProp>();
  const { setDepartment: setContextDepartment } = useSignup();
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleDepartmentSelect = (department: string) => {
    console.log("학과 선택됨:", department);

    // Context에 학과 저장 (회원가입 플로우용)
    setContextDepartment(department);
    console.log("Context에 학과 저장 완료:", department);

    // 기존 콜백도 지원 (다른 화면에서 사용할 경우)
    if (route.params?.onSelect) {
      route.params.onSelect(department);
    }

    navigation.goBack();
  };

  // Filter departments based on search query
  const filteredDepartments = DEPARTMENTS.map(college => ({
    ...college,
    departments: college.departments.filter(dept =>
      dept.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(college => college.departments.length > 0 || searchQuery === "");

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Header showBackButton={true} onBackPress={handleBackPress} />

      <View style={styles.content}>
        <Text style={styles.title}>학과 변경</Text>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Text style={styles.label}>학과1 (주전공)</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="검색"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Department List */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filteredDepartments.map((college, collegeIndex) => (
            <View key={collegeIndex} style={styles.collegeSection}>
              <TouchableOpacity style={styles.collegeHeader}>
                <Text style={styles.collegeName}>{college.college}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              {college.departments.map((dept, deptIndex) => (
                <TouchableOpacity
                  key={deptIndex}
                  style={styles.departmentItem}
                  onPress={() => handleDepartmentSelect(dept)}
                >
                  <Text style={styles.departmentName}>• {dept}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
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
  searchContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  searchInput: {
    fontFamily: "Pretendard-Regular",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  listContainer: {
    flex: 1,
    marginBottom: 20,
  },
  collegeSection: {
    marginBottom: 20,
  },
  collegeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 10,
  },
  collegeName: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: "#000",
  },
  arrow: {
    fontSize: 20,
    color: "#666",
  },
  departmentItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  departmentName: {
    fontFamily: "Pretendard-Regular",
    fontSize: 15,
    color: "#000",
  },
});
