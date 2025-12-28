import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerUserToBackend, signUpWithEmail } from "../../services/authAPI";
import { TokenService } from "../../services/tokenService";
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
};

type EnterPwScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EnterPw"
>;

export default function EnterPw() {
  const navigation = useNavigation<EnterPwScreenNavigationProp>();
  const { signupData, clearSignupData } = useSignup();
  const { email, name, studentId, department } = signupData;
  const { width } = Dimensions.get("window");

  console.log("EnterPw - Context에서 읽은 데이터:", signupData);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text.length > 0 && text.length < 8) {
      setPasswordError("비밀번호는 8자 이상이어야 합니다.");
    } else {
      setPasswordError("");
    }
    // Also validate the confirm password if it's not empty
    if (confirmPassword) {
      if (text !== confirmPassword) {
        setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (password !== text) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleContinue = async () => {
    // Manually trigger validation one last time before submitting
    let isPasswordValid = false;
    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
    } else if (password.length < 8) {
      setPasswordError("비밀번호는 8자 이상이어야 합니다.");
    } else {
      setPasswordError("");
      isPasswordValid = true;
    }

    let isConfirmPasswordValid = false;
    if (password !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError("");
      isConfirmPasswordValid = true;
    }

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. Firebase 회원가입
      const firebaseResult = await signUpWithEmail(email, password, name);

      if (!firebaseResult.success) {
        Alert.alert("회원가입 실패", firebaseResult.message || "회원가입에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      console.log("Firebase 회원가입 성공:", firebaseResult.user);

      // 2. Backend API 호출 - DB에 사용자 정보 저장
      console.log("=== 회원가입 데이터 확인 (Context) ===");
      console.log("name:", name);
      console.log("studentId:", studentId);
      console.log("email:", email);
      console.log("department:", department);

      const backendResult = await registerUserToBackend(
        name,
        studentId,
        email,
        password,
        department
      );

      if (!backendResult.success) {
        console.warn("Backend 회원가입 실패 (Firebase는 성공):", backendResult.message);
        // Backend 실패해도 Firebase 회원가입은 성공했으므로 계속 진행
      } else {
        console.log("Backend 회원가입 성공:", backendResult.data);
      }

      // 회원가입한 사용자 정보 저장 (로그인 전에도 내 정보에서 확인 가능하도록)
      await TokenService.saveUserInfo({
        name,
        email,
        studentId,
        department,
      });
      console.log("사용자 정보 저장 완료");

      // 회원가입 완료 모달 표시
      setShowSuccessModal(true);
    } catch (error) {
      console.error("회원가입 오류:", error);
      Alert.alert("오류", "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
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

      {/* 비밀번호 설정 텍스트 */}
      <Text
        style={{
          fontFamily: "Pretendard-Bold",
          fontSize: 24,
          color: "#333333",
          marginBottom: 40,
        }}
      >
        비밀번호 설정
      </Text>

      {/* 비밀번호 입력칸 */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontFamily: "Pretendard-SemiBold",
            fontSize: 14,
            color: "#333333",
            marginBottom: 8,
          }}
        >
          비밀번호
        </Text>
        <TextInput
          style={{
            fontFamily: "Pretendard-Regular",
            fontSize: 16,
            borderWidth: 1,
            borderColor: passwordError ? "red" : "#DDDDDD",
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 12,
            backgroundColor: "#FAFAFA",
          }}
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor="#AAAAAA"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
        />
        {passwordError ? (
          <Text style={{ color: "red", marginTop: 5 }}>{passwordError}</Text>
        ) : null}
      </View>

      {/* 비밀번호 확인 입력칸 */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontFamily: "Pretendard-SemiBold",
            fontSize: 14,
            color: "#333333",
            marginBottom: 8,
          }}
        >
          비밀번호 확인
        </Text>
        <TextInput
          style={{
            fontFamily: "Pretendard-Regular",
            fontSize: 16,
            borderWidth: 1,
            borderColor: confirmPasswordError ? "red" : "#DDDDDD",
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 12,
            backgroundColor: "#FAFAFA",
          }}
          placeholder="비밀번호를 다시 입력하세요"
          placeholderTextColor="#AAAAAA"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry
        />
        {confirmPasswordError ? (
          <Text style={{ color: "red", marginTop: 5 }}>
            {confirmPasswordError}
          </Text>
        ) : null}
      </View>

      {/* 회원가입 버튼 */}
      <TouchableOpacity
        onPress={handleContinue}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? "#99BBFF" : "#3366FF",
          borderRadius: 10,
          paddingVertical: 15,
          alignItems: "center",
          marginBottom: 20,
          marginTop: 10,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text
            style={{
              fontFamily: "Pretendard-Bold",
              fontSize: 16,
              color: "#FFFFFF",
            }}
          >
            회원가입
          </Text>
        )}
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

      {/* 회원가입 완료 모달 */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          navigation.navigate("Login");
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 30,
              alignItems: "center",
              marginHorizontal: 40,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontFamily: "Pretendard-Bold",
                fontSize: 18,
                color: "#333333",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              회원가입이 완료되었습니다!
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate("Login");
              }}
              style={{
                backgroundColor: "#3366FF",
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 40,
              }}
            >
              <Text
                style={{
                  fontFamily: "Pretendard-SemiBold",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                확인
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
