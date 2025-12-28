import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../config/firebaseConfig";
import { signOut } from "firebase/auth";
import { resendVerificationEmail } from "../../services/authAPI";

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  EmailVerification: { email: string };
};

type EmailVerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EmailVerification"
>;

interface EmailVerificationProps {
  email: string;
}

export default function EmailVerification({ email }: EmailVerificationProps) {
  const navigation = useNavigation<EmailVerificationScreenNavigationProp>();
  const { width } = Dimensions.get("window");
  const [isLoading, setIsLoading] = useState(false);
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasNavigatedRef = useRef(false); // 중복 네비게이션 방지

  useEffect(() => {
    // Start polling when the component mounts
    intervalRef.current = setInterval(async () => {
      const user = auth.currentUser;
      if (user && !hasNavigatedRef.current) {
        try {
          // ID 토큰을 강제로 새로고침하여 최신 인증 상태를 가져옵니다.
          const idTokenResult = await user.getIdTokenResult(true);
          console.log(
            "✅ 이메일 인증 상태 확인 (폴링):",
            idTokenResult.claims.email_verified
          );

          if (idTokenResult.claims.email_verified) {
            hasNavigatedRef.current = true;
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            Alert.alert("인증 완료", "이메일 인증이 완료되었습니다.", [
              {
                text: "확인",
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                  });
                },
              },
            ]);
          }
        } catch (error) {
          console.error("인증 상태 확인 오류:", error);
        }
      }
    }, 3000); // Check every 3 seconds

    // Clean up the interval when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [navigation]);

  if (!fontsLoaded) return null;

  const handleResendEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      setIsLoading(true);
      const result = await resendVerificationEmail(user);
      if (result.success) {
        Alert.alert("성공", result.message);
      } else {
        Alert.alert("오류", result.message);
      }
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    const user = auth.currentUser;
    console.log("🔍 수동 인증 확인 시작, 현재 사용자:", user?.email);

    if (user) {
      setIsLoading(true);
      try {
        // ID 토큰을 강제로 새로고침하여 최신 인증 상태를 가져옵니다.
        const idTokenResult = await user.getIdTokenResult(true);
        console.log(
          "🔍 ID 토큰 새로고침 완료, email_verified:",
          idTokenResult.claims.email_verified
        );

        if (idTokenResult.claims.email_verified) {
          hasNavigatedRef.current = true;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          console.log("✅ 인증 완료! 로그인 화면으로 이동합니다.");
          Alert.alert("인증 완료", "이메일 인증이 완료되었습니다. 로그인해주세요.", [
            {
              text: "확인",
              onPress: async () => {
                try {
                  await signOut(auth);
                  console.log("🚀 로그아웃 후 로그인 화면으로 네비게이션 시작");
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                } catch (e) {
                  console.error("로그아웃 실패:", e);
                  // 로그아웃 실패하더라도 일단 로그인 화면으로 보냄
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                }
              },
            },
          ]);
        } else {
          console.log("❌ 인증 미완료");
          Alert.alert(
            "인증 미완료",
            "아직 이메일 인증이 완료되지 않았습니다."
          );
        }
      } catch (error) {
        console.error("❌ 인증 확인 중 오류:", error);
        Alert.alert("오류", "인증 상태 확인 중 오류가 발생했습니다.");
      }
      setIsLoading(false);
    } else {
      console.log("❌ 현재 사용자가 없습니다.");
      Alert.alert("오류", "로그인 정보를 찾을 수 없습니다.");
    }
  };

  const handleBackToLogin = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 30,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Pretendard-Bold",
          fontSize: 24,
          color: "#333333",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        이메일 인증
      </Text>
      <Text
        style={{
          fontFamily: "Pretendard-Regular",
          fontSize: 16,
          color: "#666666",
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        회원가입을 완료하려면 이메일 인증이 필요합니다.{"\n"}
        <Text style={{ fontFamily: "Pretendard-Bold" }}>{email}</Text>
        으로 발송된{"\n"}
        인증 메일을 확인해주세요.
      </Text>

      <TouchableOpacity
        onPress={handleCheckVerification}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? "#99BBFF" : "#3366FF",
          borderRadius: 10,
          paddingVertical: 15,
          alignItems: "center",
          marginBottom: 20,
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
            인증 완료 확인
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleResendEmail}
        disabled={isLoading}
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#3366FF",
          borderWidth: 1,
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
            color: "#3366FF",
          }}
        >
          인증 이메일 재전송
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleBackToLogin}>
        <Text
          style={{
            fontFamily: "Pretendard-Bold",
            fontSize: 14,
            color: "#666666",
            textAlign: "center",
          }}
        >
          로그인 화면으로 돌아가기
        </Text>
      </TouchableOpacity>
    </View>
  );
}
