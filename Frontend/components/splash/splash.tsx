import { useFonts } from "expo-font";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, Text, View } from "react-native";

export default function Splash() {
  const { width } = Dimensions.get("window");

  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../../assets/fonts/Pretendard-SemiBold.ttf"),
  });
  const rotateAni = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!fontsLoaded) return;

    const rotate = () => {
      Animated.sequence([
        Animated.timing(rotateAni, {
          toValue: 0.0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAni, {
          toValue: -0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAni, {
          toValue: 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAni, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(rotate, 1000); // 1초마다 반복
      });
    };

    rotate();
  }, [rotateAni, fontsLoaded]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 이미지 ㄹ */}
      <Image
        source={require("../../assets/images/rr.png")}
        style={{
          position: "absolute",
          width: width * 0.3,
          height: width * 0.3,
          resizeMode: "contain",
          top: "38%",
          left: "42%",
        }}
      />
      {/* 이미지 ㄸ */}
      <Animated.Image
        source={require("../../assets/images/dd.png")}
        style={{
          position: "absolute",
          width: width * 0.3,
          height: width * 0.3,
          resizeMode: "contain",
          top: "37.5%",
          left: "27%",
          transformOrigin: "90% 5%",
          transform: [
            {
              rotate: rotateAni.interpolate({
                inputRange: [-1, 1],
                outputRange: ["-20deg", "20deg"],
              }),
            },
          ],
        }}
      />
      {/* 하단 문구 */}
      <Text
        style={{
          fontFamily: "Pretendard-Regular",
          fontSize: Math.min(width * 0.04, 16),
          color: "#666666",
          textAlign: "center",
          position: "absolute",
          bottom: 70,
          width: "100%",
        }}
      >
        INU Announcement Notification App
      </Text>

      <Text
        style={{
          fontFamily: "Pretendard-Regular",
          fontSize: Math.min(width * 0.035, 14),
          color: "#666666",
          textAlign: "center",
          position: "absolute",
          bottom: 40,
          width: "100%",
        }}
      >
        ⓒ DAON
      </Text>
    </View>
  );
}
