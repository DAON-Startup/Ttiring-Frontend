import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { useFonts } from "expo-font";
import Header from "@/components/topmenu/header";
import BottomBar from "@/components/bottombar/bottombar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateSettings, getMyInfo } from "../services/userSettingsAPI";

type NotificationSettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, "NotificationSettings">;

export default function NotificationSettingsScreen() {
  const navigation = useNavigation<NotificationSettingsNavigationProp>();
  const [keywordNotifications, setKeywordNotifications] = useState(true);
  const [newsAndBenefits, setNewsAndBenefits] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const response = await getMyInfo(token);
        if (response.success && response.data) {
          setKeywordNotifications(response.data.systemNotificationEnabled);
        }
      }
      const news = await AsyncStorage.getItem("newsAndBenefits");
      if (news !== null) setNewsAndBenefits(news === "true");
    } catch (error) {
      console.error("설정 불러오기 오류:", error);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleToggleKeyword = async (value: boolean) => {
    if (value) {
      setShowConsentModal(true);
    } else {
      setKeywordNotifications(value);
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          await updateSettings(false, token);
        }
      } catch (error) {
        console.error("설정 저장 오류:", error);
      }
    }
  };

  const handleConsent = async (consent: boolean) => {
    setShowConsentModal(false);
    if (consent) {
      setKeywordNotifications(true);
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          await updateSettings(true, token);
        }
      } catch (error) {
        console.error("설정 저장 오류:", error);
      }
    }
  };

  const handleToggleNews = async (value: boolean) => {
    setNewsAndBenefits(value);
    try {
      await AsyncStorage.setItem("newsAndBenefits", value.toString());
    } catch (error) {
      console.error("설정 저장 오류:", error);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Header showBackButton={true} onBackPress={handleBackPress} />

      <View style={styles.content}>
        <Text style={styles.title}>알림 설정</Text>

        <ScrollView style={styles.settingsContainer}>
          {/* 공지 키워드 알림 */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleToggleKeyword(!keywordNotifications)}
            activeOpacity={0.7}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>공지 키워드 알림</Text>
              <Text style={styles.settingDescription}>
                설정한 키워드가 포함된 공지사항을 알림으로 받습니다
              </Text>
            </View>
            <Switch
              value={keywordNotifications}
              onValueChange={handleToggleKeyword}
              trackColor={{ false: "#E0E0E0", true: "#A3C3FF" }}
              thumbColor={keywordNotifications ? "#3478F6" : "#f4f3f4"}
            />
          </TouchableOpacity>

          {/* 뉴스 및 혜택 */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleToggleNews(!newsAndBenefits)}
            activeOpacity={0.7}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>뉴스 및 혜택</Text>
              <Text style={styles.settingDescription}>
                띠링인캠퍼스의 새로운 소식과 혜택을 알림으로 받습니다
              </Text>
            </View>
            <Switch
              value={newsAndBenefits}
              onValueChange={handleToggleNews}
              trackColor={{ false: "#E0E0E0", true: "#A3C3FF" }}
              thumbColor={newsAndBenefits ? "#3478F6" : "#f4f3f4"}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal
        visible={showConsentModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowConsentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>"띠링인캠퍼스" 에서 알림을{"\n"}보내고자 합니다.</Text>
            <Text style={styles.modalDescription}>
              해당 기기로 새로운 공지사항 등록,{"\n"}맞춤형 정보 제공 등 서비스 이용에 필요한 사항을{"\n"}푸쉬 알림으로 보내드리겠습니다.
            </Text>
            <Text style={styles.modalQuestion}>앱 푸쉬에 수신 동의하시겠습니까?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleConsent(false)}>
                <Text style={styles.modalButtonText}>허용 안 함</Text>
              </TouchableOpacity>
              <View style={styles.modalButtonDivider} />
              <TouchableOpacity style={styles.modalButton} onPress={() => handleConsent(true)}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>허용</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  settingsContainer: {
    flex: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: "#000",
    marginBottom: 6,
  },
  settingDescription: {
    fontFamily: "Pretendard-Regular",
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 15,
  },
  modalDescription: {
    fontFamily: "Pretendard-Regular",
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  modalQuestion: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  modalButtonDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  modalButtonText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 15,
    color: "#666",
  },
  modalButtonTextPrimary: {
    fontFamily: "Pretendard-SemiBold",
    color: "#3478F6",
  },
});
