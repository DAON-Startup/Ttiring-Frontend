import React from "react";
import { StyleSheet, View } from "react-native";

// 로그인 컴포넌트
import LoginMain from "../components/login/loginMain";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <LoginMain />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
