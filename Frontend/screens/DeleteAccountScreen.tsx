import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { useFonts } from "expo-font";
import Header from "@/components/topmenu/header";
import BottomBar from "@/components/bottombar/bottombar";
import { TokenService } from "../services/tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteAccount } from "../services/userSettingsAPI";

type DeleteAccountNavigationProp = NativeStackNavigationProp<RootStackParamList, "DeleteAccount">;

export default function DeleteAccountScreen() {
  const navigation = useNavigation<DeleteAccountNavigationProp>();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
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

  const handleDeleteAccount = async () => {
    if (!password) {
      window.alert("비밀번호를 입력해주세요.");
      return;
    }

    if (window.confirm("정말로 회원을 탈퇴하시겠습니까?\n\n회원 탈퇴시 등록 계정으로\n회원 거래이 제한됩니다.")) {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          window.alert("로그인이 필요합니다.");
          return;
        }

        const response = await deleteAccount(password, token);
        if (response.success) {
          await TokenService.clearAll();
          await AsyncStorage.removeItem("fcmToken");

          (navigation as any).reset({
            index: 0,
            routes: [{ name: "Login" }],
          });

          window.alert("회원이 정상적으로 탈퇴되었습니다.");
        } else {
          window.alert(response.message || "회원 탈퇴에 실패했습니다.");
        }
      } catch (error: any) {
        console.error("회원 탈퇴 오류:", error);
        window.alert("회원 탈퇴 중 문제가 발생했습니다.");
      }
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Header showBackButton={true} onBackPress={handleBackPress} />

      <View style={styles.content}>
        <Text style={styles.title}>회원 탈퇴</Text>

        <Text style={styles.subtitle}>ID와 비밀번호를 입력하세요</Text>

        <TextInput
          style={styles.input}
          placeholder="ID"
          value={id}
          onChangeText={setId}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="PW"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#999"
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>회원 탈퇴하기</Text>
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
    paddingTop: 20,
  },
  title: {
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 40,
  },
  subtitle: {
    fontFamily: "Pretendard-Regular",
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
  },
  input: {
    fontFamily: "Pretendard-Regular",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: "#A3C3FF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});
