import { useFonts } from "expo-font";
import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface BottomBarProps {
  onTabPress?: (index: number) => void;
  activeTab?: number;
}

export default function BottomBar({ onTabPress, activeTab = 0 }: BottomBarProps) {
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  const navItems = [
    { type: "image", src: require("../../assets/images/file.png") },
    { type: "image", src: require("../../assets/images/scrap.png") },
    {
      type: "image",
      src: require("../../assets/images/Logo.png"),
    },
    { type: "image", src: require("../../assets/images/search.png") },
    { type: "image", src: require("../../assets/images/menu2.png") },
  ];

  const reverseNavItems = [
    { type: "image", src: require("../../assets/images/file2.png") },
    {
      type: "image",
      src: require("../../assets/images/scrap2.png"),
    },
    {
      type: "image",
      src: require("../../assets/images/Logo.png"),
    },
    { type: "image", src: require("../../assets/images/search2.png") },
    { type: "image", src: require("../../assets/images/menu.png") },
  ];

  const itemNames = ["공지사항", "공지 보관함", "AI 챗봇", "검색", "더보기"];

  if (!fontsLoaded) return null;
  return (
    <View style={styles.container}>
      {/* 하단 탭바 */}
      <View style={styles.tabBar}>
        {/* 탭바 안 메뉴들 */}
        {navItems.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => {
            onTabPress?.(index);
          }}>
            {item.type === "image" && (
              <View style={styles.tabItem}>
                <Image
                  source={
                    activeTab === index && reverseNavItems[index]
                      ? reverseNavItems[index].src
                      : item.src
                  }
                  style={[
                    styles.tabIcon,
                    { width: index === 2 ? 40 : 30 },
                  ]}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: activeTab === index ? "#000000" : "#ffffff" },
                  ]}
                >
                  {itemNames[index]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    backgroundColor: "white",
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#3366FF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    height: 30,
    resizeMode: "contain",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
  },
  tabLabel: {
    fontFamily: "Pretendard-Regular",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
});
