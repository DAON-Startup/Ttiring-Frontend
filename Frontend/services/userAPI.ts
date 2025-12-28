import { api } from "./apiClient";

/**
 * 사용자의 푸시 알림 키워드 구독을 업데이트합니다.
 * @param fcmToken - 디바이스의 FCM 토큰
 * @param keywords - 사용자가 구독할 키워드 배열
 * @returns 성공 여부
 */
export const updateUserKeywords = async (
  fcmToken: string,
  keywords: string[]
) => {
  try {
    // 백엔드 API에 구독 정보 전송
    // 실제 엔드포인트는 백엔드에 맞게 수정해야 합니다. (예: '/subscribe')
    const response = await api.subscribe({
      fcmToken,
      keywords,
    });

    console.log("✅ 키워드 구독 정보 전송 성공:", response);

    // 백엔드 응답 구조에 따라 성공 여부 판단
    if (response.status === 200) {
      return {
        success: true,
        message: "알림 키워드가 성공적으로 저장되었습니다.",
      };
    } else {
      return {
        success: false,
        message:
          response.data?.message || "키워드 저장에 실패했습니다.",
      };
    }
  } catch (error: any) {
    console.error("❌ 키워드 구독 정보 전송 오류:", error);

    // 네트워크 오류 또는 서버 오류 처리
    let errorMessage = "서버와의 통신 중 오류가 발생했습니다.";
    if (error.response) {
      // 서버가 오류 응답을 보낸 경우
      errorMessage =
        error.response.data?.message || "키워드 저장 중 오류가 발생했습니다.";
    }

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};
