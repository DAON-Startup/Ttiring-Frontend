import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
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
import { registerUserToBackend, signUpWithEmail } from "../services/authAPI";
import { TokenService } from "../services/tokenService";

type SignupPasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, "SignupPassword">;
type SignupPasswordRouteProp = RouteProp<RootStackParamList, "SignupPassword">;

const { width, height } = Dimensions.get("window");

// 반응형 크기 계산 함수
const responsiveWidth = (percent: number) => (width * percent) / 100;
const responsiveHeight = (percent: number) => (height * percent) / 100;
const responsiveFontSize = (size: number) => Math.min(size, width * (size / 400));

export default function SignupPasswordScreen() {
  const navigation = useNavigation<SignupPasswordNavigationProp>();
  const route = useRoute<SignupPasswordRouteProp>();
  const { name, studentId, department, email } = route.params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text.length > 0 && text.length < 8) {
      setPasswordError("8자리 이상 입력해 주세요.");
    } else {
      setPasswordError("");
    }
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else if (confirmPassword) {
      setConfirmPasswordError("");
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

  const handleSignup = async () => {
    // Validate password
    let isValid = true;
    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("8자리 이상 입력해 주세요.");
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      isValid = false;
    }

    if (!isValid) return;

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

      // 2. Backend API 호출
      const backendResult = await registerUserToBackend(
        name,
        studentId,
        email,
        password,
        department
      );

      if (!backendResult.success) {
        console.warn("Backend 회원가입 실패 (Firebase는 성공):", backendResult.message);
      } else {
        console.log("Backend 회원가입 성공:", backendResult.data);
      }

      // 3. 사용자 정보 저장
      await TokenService.saveUserInfo({
        name,
        email,
        studentId,
        department,
      });
      console.log("사용자 정보 저장 완료");

      // 4. 완료 모달 표시
      setShowSuccessModal(true);
    } catch (error) {
      console.error("회원가입 오류:", error);
      Alert.alert("오류", "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
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

        {/* 비밀번호 입력 섹션 */}
        <Text style={styles.sectionTitle}>비밀번호 입력</Text>
        <TextInput
          style={[styles.input, passwordError ? styles.inputError : null]}
          placeholder="8자리 이상 입력해 주세요. (특수문자 포함)"
          placeholderTextColor="#AAAAAA"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        {/* 비밀번호 확인 섹션 */}
        <Text style={styles.sectionTitle}>비밀번호 확인</Text>
        <TextInput
          style={[styles.input, confirmPasswordError ? styles.inputError : null]}
          placeholder="다시 한번 입력해 주세요."
          placeholderTextColor="#AAAAAA"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry
        />
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

        {/* 회원가입 버튼 */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>계속하기</Text>
          )}
        </TouchableOpacity>

        {/* 하단 문구 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>INU Announcement Notification App</Text>
          <Text style={styles.footerSubText}>© DAON</Text>
        </View>

        {/* 회원가입 완료 모달 */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => {
            setShowSuccessModal(false);
            navigation.navigate("Login");
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>회원가입이 완료 되었습니다.</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate("Login");
                }}
              >
                <Text style={styles.modalButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    fontSize: responsiveFontSize(16),
    color: "#333333",
    marginBottom: responsiveHeight(1),
    marginTop: responsiveHeight(1),
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
  errorText: {
    fontFamily: "Pretendard-Regular",
    color: "red",
    fontSize: responsiveFontSize(13),
    marginBottom: responsiveHeight(0.5),
  },
  button: {
    backgroundColor: "#3366FF",
    borderRadius: 10,
    paddingVertical: responsiveHeight(1.8),
    alignItems: "center",
    marginTop: responsiveHeight(3),
    width: "100%",
  },
  buttonDisabled: {
    backgroundColor: "#99BBFF",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: responsiveWidth(8),
    alignItems: "center",
    marginHorizontal: responsiveWidth(10),
    minWidth: Math.min(responsiveWidth(70), 280),
  },
  modalText: {
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(16),
    color: "#333333",
    marginBottom: responsiveHeight(3),
    textAlign: "center",
  },
  modalButton: {
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(8),
  },
  modalButtonText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: responsiveFontSize(16),
    color: "#3366FF",
  },
});
