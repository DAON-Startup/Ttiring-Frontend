import React from "react";
import { StyleSheet, View } from "react-native";
import EmailVerification from "../components/login/EmailVerification";
import { RouteProp, useRoute } from "@react-navigation/native";

type RootStackParamList = {
  EmailVerification: { email: string };
};

type EmailVerificationScreenRouteProp = RouteProp<
  RootStackParamList,
  "EmailVerification"
>;

export default function EmailVerificationScreen() {
  const route = useRoute<EmailVerificationScreenRouteProp>();
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <EmailVerification email={email} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
