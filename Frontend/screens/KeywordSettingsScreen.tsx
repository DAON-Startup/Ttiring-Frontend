import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { useFonts } from "expo-font";
import Header from "@/components/topmenu/header";
import BottomBar from "@/components/bottombar/bottombar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getKeywords, createKeyword, deleteKeyword, toggleKeyword, Keyword } from "../services/keywordAPI";

type KeywordSettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, "KeywordSettings">;

export default function KeywordSettingsScreen() {
  const navigation = useNavigation<KeywordSettingsNavigationProp>();
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
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
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await getKeywords(token);
      if (response.success && response.data) {
        setKeywords(response.data);
        await AsyncStorage.setItem("userKeywords", JSON.stringify(response.data.map(k => k.keyword)));
      }
    } catch (error) {
      console.error("키워드 불러오기 오류:", error);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddKeyword = async () => {
    if (!keyword.trim()) {
      Alert.alert("알림", "키워드를 입력해주세요.");
      return;
    }

    if (keywords.some(k => k.keyword === keyword.trim())) {
      Alert.alert("알림", "이미 등록된 키워드입니다.");
      return;
    }

    if (keywords.length >= 10) {
      Alert.alert("알림", "키워드는 최대 10개까지 등록할 수 있습니다.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("오류", "로그인이 필요합니다.");
        return;
      }

      const response = await createKeyword(keyword.trim(), token);
      if (response.success && response.data) {
        setKeywords([...keywords, response.data]);
        setKeyword("");
        await AsyncStorage.setItem("userKeywords", JSON.stringify([...keywords, response.data].map(k => k.keyword)));
      }
    } catch (error) {
      console.error("키워드 추가 오류:", error);
      Alert.alert("오류", "키워드 추가에 실패했습니다.");
    }
  };

  const handleRemoveKeyword = async (kw: Keyword) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      await deleteKeyword(kw.id, token);
      const newKeywords = keywords.filter((k) => k.id !== kw.id);
      setKeywords(newKeywords);
      await AsyncStorage.setItem("userKeywords", JSON.stringify(newKeywords.map(k => k.keyword)));
    } catch (error) {
      console.error("키워드 삭제 오류:", error);
      Alert.alert("오류", "키워드 삭제에 실패했습니다.");
    }
  };

  const handleToggleKeyword = async (kw: Keyword) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await toggleKeyword(kw.id, token);
      if (response.success && response.data) {
        setKeywords(keywords.map(k => k.id === kw.id ? response.data : k));
      }
    } catch (error) {
      console.error("키워드 토글 오류:", error);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Header showBackButton={true} onBackPress={handleBackPress} />

      <View style={styles.content}>
        <Text style={styles.title}>알림 키워드 설정</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="키워드를 입력하세요"
            value={keyword}
            onChangeText={setKeyword}
            placeholderTextColor="#999"
            returnKeyType="done"
            onSubmitEditing={handleAddKeyword}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddKeyword}>
            <Text style={styles.addButtonText}>추가</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>• 등록된 키워드가 포함된 공지사항을 푸시 알림으로 받습니다</Text>
        </View>

        <View style={styles.keywordHeader}>
          <Text style={styles.keywordHeaderText}>등록된 키워드 ({keywords.length}/10)</Text>
        </View>

        <ScrollView style={styles.keywordList}>
          {keywords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>등록된 키워드가 없습니다</Text>
            </View>
          ) : (
            keywords.map((kw) => (
              <View key={kw.id} style={styles.keywordItem}>
                <Text style={[styles.keywordText, !kw.isActive && styles.keywordTextInactive]}>{kw.keyword}</Text>
                <View style={styles.keywordActions}>
                  <Switch
                    value={kw.isActive}
                    onValueChange={() => handleToggleKeyword(kw)}
                    trackColor={{ false: "#E0E0E0", true: "#A3C3FF" }}
                    thumbColor={kw.isActive ? "#3478F6" : "#f4f3f4"}
                    style={{ marginRight: 10 }}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveKeyword(kw)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
  inputContainer: {
    flexDirection: "row",
    marginBottom: 15,
    width: "100%",
  },
  input: {
    flex: 1,
    fontFamily: "Pretendard-Regular",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
    minWidth: 0, // flex item이 줄어들 수 있도록
  },
  addButton: {
    backgroundColor: "#3478F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0, // 버튼 크기 유지
  },
  addButtonText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  infoContainer: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  keywordHeader: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 10,
  },
  keywordHeaderText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 15,
    color: "#000",
  },
  keywordList: {
    flex: 1,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: "#999",
  },
  keywordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 10,
  },
  keywordText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 15,
    color: "#000",
    flex: 1,
  },
  keywordTextInactive: {
    color: "#999",
  },
  keywordActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF5252",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
    color: "#fff",
    marginTop: -2,
  },
});
