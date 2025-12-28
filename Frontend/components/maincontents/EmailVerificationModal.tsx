
import React, { useEffect } from "react";
import { Modal, View, Text, StyleSheet, Button } from "react-native";
import { auth } from "../../config/firebaseConfig";

interface EmailVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  onClose,
  onVerificationSuccess,
}) => {
  useEffect(() => {
    if (visible) {
      // TODO: Implement polling logic here
      // 1. Start a setInterval to run every few seconds.
      // 2. Inside the interval, get the current user: `auth.currentUser`.
      // 3. If the user exists, reload their profile: `await user.reload();`
      // 4. Check the `emailVerified` status: `auth.currentUser.emailVerified`.
      // 5. If verified, clear the interval, and call `onVerificationSuccess`.
    }
  }, [visible, onVerificationSuccess]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>이메일 인증 필요</Text>
          <Text style={styles.subText}>
            회원가입을 완료하려면 이메일 인증이 필요합니다. {"\n"}
            입력하신 이메일 주소의 받은 편지함을 확인해주세요.
          </Text>
          <Text style={styles.subText}>
            이메일을 받지 못하셨나요? 스팸 편지함을 확인해보세요.
          </Text>
          <Button title="나중에 하기" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  subText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default EmailVerificationModal;
