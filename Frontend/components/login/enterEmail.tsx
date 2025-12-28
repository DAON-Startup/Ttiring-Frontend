import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSignup } from "../../context/SignupContext";

type RootStackParamList = {
  Login: undefined;
  EnterEmail: undefined;
  EnterPw: { email: string; name: string; studentId: string; department: string };
  Home: undefined;
  Detail: undefined;
  Search: undefined;
  Setting: undefined;
  Alert: undefined;
  Scrap: undefined;
  DepartmentSelection: { onSelect?: (department: string) => void } | undefined;
  StudentIdSelection: { onSelect?: (studentId: string) => void } | undefined;
};

type EnterEmailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EnterEmail"
>;

export default function EnterEmail() {
  const navigation = useNavigation<EnterEmailScreenNavigationProp>();
  const { width } = Dimensions.get("window");
  const { signupData, setName: setContextName, setEmail: setContextEmail, setStudentId: setContextStudentId, setDepartment: setContextDepartment } = useSignup();

  // 로컬 상태는 입력 필드용으로 유지하되, Context와 동기화
  const [email, setEmail] = useState(signupData.email);
  const [name, setName] = useState(signupData.name);
  const [studentId, setStudentId] = useState(signupData.studentId);
  const [department, setDepartment] = useState(signupData.department);
  const [nameError, setNameError] = useState("");
  const [studentIdError, setStudentIdError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [departmentError, setDepartmentError] = useState("");

  // Context에서 값이 변경되면 로컬 상태도 업데이트
  React.useEffect(() => {
    if (signupData.studentId && signupData.studentId !== studentId) {
      setStudentId(signupData.studentId);
    }
    if (signupData.department && signupData.department !== department) {
      setDepartment(signupData.department);
    }
  }, [signupData.studentId, signupData.department]);

  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  const validateName = (text: string) => {
    if (!text) {
      setNameError("이름을 입력해주세요.");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateStudentId = (text: string) => {
    if (!text) {
      setStudentIdError("학번을 선택해주세요.");
      return false;
    }
    setStudentIdError("");
    return true;
  };

  const validateEmail = (text: string) => {
    if (!text || !text.endsWith("@inu.ac.kr")) {
      setEmailError("학교 이메일(@inu.ac.kr)을 사용해주세요.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateDepartment = (text: string) => {
    if (!text) {
      setDepartmentError("학과를 선택해주세요.");
      return false;
    }
    setDepartmentError("");
    return true;
  };

  const handleContinue = () => {
    // Context에서 최신 값 사용 (선택 화면에서 설정한 값)
    const finalStudentId = signupData.studentId || studentId;
    const finalDepartment = signupData.department || department;

    console.log("=== handleContinue 디버그 ===");
    console.log("로컬 studentId:", studentId);
    console.log("Context studentId:", signupData.studentId);
    console.log("최종 studentId:", finalStudentId);
    console.log("로컬 department:", department);
    console.log("Context department:", signupData.department);
    console.log("최종 department:", finalDepartment);

    const isNameValid = validateName(name);
    const isStudentIdValid = validateStudentId(finalStudentId);
    const isEmailValid = validateEmail(email);
    const isDepartmentValid = validateDepartment(finalDepartment);

    if (!isNameValid || !isStudentIdValid || !isEmailValid || !isDepartmentValid) {
      return;
    }

    // Context에 최종 데이터 저장
    setContextName(name);
    setContextEmail(email);
    setContextStudentId(finalStudentId);
    setContextDepartment(finalDepartment);

    console.log("회원가입 데이터 Context에 저장:", { name, email, studentId: finalStudentId, department: finalDepartment });

    // 다음 화면으로 이동
    navigation.navigate("EnterPw");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 30,
        paddingTop: 60,
      }}
    >
      {/* 타이틀 */}
      <Text
        style={{
          fontFamily: "Pretendard-ExtraBold",
          fontSize: 20,
          color: "#000000",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        띠링인캠퍼스
      </Text>

      {/* 로고 이미지 */}
      <Image
        source={require("../../assets/images/Logo.png")}
        style={{
          width: 120,
          height: 120,
          resizeMode: "contain",
          alignSelf: "center",
          marginBottom: 50,
        }}
      />

      {/* 회원가입 텍스트 */}
      <Text
        style={{
          fontFamily: "Pretendard-Bold",
          fontSize: 24,
          color: "#333333",
          marginBottom: 30,
        }}
      >
        회원가입
      </Text>

      {/* 이름 입력칸 */}
      <View style={{ marginBottom: 15 }}>
        <Text
          style={{
            fontFamily: "Pretendard-SemiBold",
            fontSize: 14,
            color: "#333333",
            marginBottom: 8,
          }}
        >
          이름
        </Text>
        <TextInput
          style={{
            fontFamily: "Pretendard-Regular",
            fontSize: 16,
            borderWidth: 1,
            borderColor: nameError ? "red" : "#DDDDDD",
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 12,
            backgroundColor: "#FAFAFA",
          }}
          placeholder="이름을 입력하세요"
          placeholderTextColor="#AAAAAA"
          value={name}
          onChangeText={(text) => {
            setName(text);
            validateName(text);
          }}
        />
        {nameError ? (
          <Text style={{ color: "red", marginTop: 5 }}>{nameError}</Text>
        ) : null}
      </View>

      {/* 학번 선택 */}
      <View style={{ marginBottom: 15 }}>
        <Text
          style={{
            fontFamily: "Pretendard-SemiBold",
            fontSize: 14,
            color: "#333333",
            marginBottom: 8,
          }}
        >
          학번
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: studentIdError ? "red" : "#DDDDDD",
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 12,
            backgroundColor: "#FAFAFA",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onPress={() => {
            // Navigate to student ID selection (context 사용)
            console.log("학번 선택 화면으로 이동");
            navigation.navigate("StudentIdSelection", { fromSignup: true });
          }}
        >
          <Text
            style={{
              fontFamily: "Pretendard-Regular",
              fontSize: 16,
              color: (signupData.studentId || studentId) ? "#000000" : "#AAAAAA",
            }}
          >
            {signupData.studentId || studentId || "학번을 선택하세요"}
          </Text>
          <Text style={{ fontSize: 20, color: "#666" }}>›</Text>
        </TouchableOpacity>
        {studentIdError ? (
          <Text style={{ color: "red", marginTop: 5 }}>{studentIdError}</Text>
        ) : null}
      </View>

      {/* 학과 선택 */}
      <View style={{ marginBottom: 15 }}>
        <Text
          style={{
            fontFamily: "Pretendard-SemiBold",
            fontSize: 14,
            color: "#333333",
            marginBottom: 8,
          }}
        >
          학과
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: departmentError ? "red" : "#DDDDDD",
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 12,
            backgroundColor: "#FAFAFA",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onPress={() => {
            // Navigate to department selection (context 사용)
            console.log("학과 선택 화면으로 이동");
            navigation.navigate("DepartmentSelection", { fromSignup: true });
          }}
        >
          <Text
            style={{
              fontFamily: "Pretendard-Regular",
              fontSize: 16,
              color: (signupData.department || department) ? "#000000" : "#AAAAAA",
            }}
          >
            {signupData.department || department || "학과를 선택하세요"}
          </Text>
          <Text style={{ fontSize: 20, color: "#666" }}>›</Text>
        </TouchableOpacity>
        {departmentError ? (
          <Text style={{ color: "red", marginTop: 5 }}>{departmentError}</Text>
        ) : null}
      </View>

      {/* 이메일 입력칸 */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontFamily: "Pretendard-SemiBold",
            fontSize: 14,
            color: "#333333",
            marginBottom: 8,
          }}
        >
          이메일
        </Text>
        <TextInput
          style={{
            fontFamily: "Pretendard-Regular",
            fontSize: 16,
            borderWidth: 1,
            borderColor: emailError ? "red" : "#DDDDDD",
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 12,
            backgroundColor: "#FAFAFA",
          }}
          placeholder="이메일을 입력하세요"
          placeholderTextColor="#AAAAAA"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            validateEmail(text);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? (
          <Text style={{ color: "red", marginTop: 5 }}>{emailError}</Text>
        ) : null}
      </View>

      {/* 계속하기 버튼 */}
      <TouchableOpacity
        onPress={handleContinue}
        style={{
          backgroundColor: "#3366FF",
          borderRadius: 10,
          paddingVertical: 15,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontFamily: "Pretendard-Bold",
            fontSize: 16,
            color: "#FFFFFF",
          }}
        >
          계속하기
        </Text>
      </TouchableOpacity>

      {/* 하단 문구 */}
      <Text
        style={{
          fontFamily: "Pretendard-Regular",
          fontSize: Math.min(width * 0.04, 16),
          color: "#AAAAAA",
          textAlign: "center",
          position: "absolute",
          bottom: 70,
          width: "100%",
          alignSelf: "center",
        }}
      >
        INU Announcement Notification App
      </Text>

      <Text
        style={{
          fontFamily: "Pretendard-Regular",
          fontSize: Math.min(width * 0.035, 14),
          color: "#AAAAAA",
          textAlign: "center",
          position: "absolute",
          bottom: 40,
          width: "100%",
          alignSelf: "center",
        }}
      >
        ⓒ DAON
      </Text>
    </View>
  );
}
