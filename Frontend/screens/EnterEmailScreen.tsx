import React from "react";
import { StyleSheet, View } from "react-native";

// 이메일 입력 컴포넌트
import EnterEmail from "../components/login/enterEmail";

export default function EnterEmailScreen() {
  return (
    <View style={styles.container}>
      <EnterEmail />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
