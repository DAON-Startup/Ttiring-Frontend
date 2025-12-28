import { useFonts } from "expo-font";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Alert: undefined;
  [key: string]: any;
};

interface HeaderProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
  isAlertPage?: boolean;
}

export default function Header({
  showBackButton = false,
  onBackPress,
  isAlertPage = false,
}: HeaderProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [fontsLoaded] = useFonts({
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-ExtraLight": require("../../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
            >
              <Image
                source={require("../../assets/images/back.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('Alert')}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            style={styles.alertButton}
          >
            <Image
              source={require("../../assets/images/종.png")}
              style={[
                styles.alertIcon,
                isAlertPage && { tintColor: "#FFFFFF" },
              ]}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.title} pointerEvents="none">
          띠링인캠퍼스
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3366FF",
    paddingTop: 59,
    paddingBottom: 10,
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 10,
    marginLeft: -20,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  placeholder: {
    width: 40,
  },
  alertButton: {
    padding: 10,
  },
  alertIcon: {
    marginRight: -20,
    width: 20,
    height: 25,
    resizeMode: "contain",
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    color: "#FFFFFF",
    fontFamily: "Pretendard-SemiBold",
    fontSize: 20,
    textAlign: "center",
  },
});
