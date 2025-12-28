import React from "react";
import { StyleSheet, View } from "react-native";

// 비밀번호 입력 컴포넌트
import EnterPw from "../components/login/enterPw";

export default function EnterPwScreen() {
  return (
    <View style={styles.container}>
      <EnterPw />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
