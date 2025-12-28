import React from "react";
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { useNotification } from "../context/NotificationContext";
import { useFonts } from "expo-font";

// 상단 탭바
import Header from "@/components/topmenu/header";

// 하단 탭바
import BottomBar from "@/components/bottombar/bottombar";

type AlertScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Alert'>;

export default function AlertScreen() {
  const navigation = useNavigation<AlertScreenNavigationProp>();
  const { notificationNotices, removeNotification } = useNotification();
  const [fontsLoaded] = useFonts({
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  const handleTabPress = (index: number) => {
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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNoticePress = (notice: any) => {
    navigation.navigate("Detail", { notice });
  };

  const formatTimeAgo = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true} onBackPress={handleBackPress} isAlertPage={true} />

      {/* 알림함 타이틀 */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>알림함</Text>
      </View>

      {/* 알림 목록 */}
      {notificationNotices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>받은 알림이 없습니다</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {notificationNotices.map((notice) => (
            <TouchableOpacity
              key={notice.id}
              style={styles.notificationItem}
              onPress={() => handleNoticePress(notice)}
            >
              <Image
                source={require("../assets/images/Logo.png")}
                style={styles.notificationIcon}
              />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationType}>키워드 공지 알림</Text>
                <Text style={styles.notificationMessage} numberOfLines={1}>
                  {notice.title}
                </Text>
                <Text style={styles.notificationTime}>
                  {formatTimeAgo(notice.date || notice.publishedAt)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeNotification(notice.id)}
              >
                <Text style={styles.deleteText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <BottomBar onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  titleContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#fff",
  },
  title: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 15,
    color: "#999",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationType: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  notificationMessage: {
    fontFamily: "Pretendard-Regular",
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  notificationTime: {
    fontFamily: "Pretendard-Regular",
    fontSize: 11,
    color: "#999",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 20,
    color: "#999",
    fontWeight: "300",
  },
});
