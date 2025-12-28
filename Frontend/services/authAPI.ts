import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";

/**
 * 이메일/비밀번호로 회원가입
 * @param email - 이메일 주소
 * @param password - 비밀번호
 * @param displayName - 사용자 이름 (선택)
 * @returns 성공 여부 및 사용자 정보
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
) => {
  try {
    // 회원가입
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 사용자 이름 설정
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    console.log("✅ Firebase 회원가입 완료:", user.email);

    return {
      success: true,
      message: "회원가입이 완료되었습니다.",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    };
  } catch (error: any) {
    console.error("회원가입 오류:", error);

    let errorMessage = "회원가입에 실패했습니다.";

    // Firebase 에러 코드별 메시지
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "이미 사용 중인 이메일입니다.";
        break;
      case "auth/invalid-email":
        errorMessage = "유효하지 않은 이메일 형식입니다.";
        break;
      case "auth/weak-password":
        errorMessage = "비밀번호는 6자 이상이어야 합니다.";
        break;
      case "auth/operation-not-allowed":
        errorMessage = "이메일/비밀번호 인증이 활성화되지 않았습니다.";
        break;
    }

    return {
      success: false,
      message: errorMessage,
      error: error.code,
    };
  }
};

/**
 * 이메일/비밀번호로 로그인
 * @param email - 이메일 주소
 * @param password - 비밀번호
 * @returns 성공 여부 및 사용자 정보
 */
export const signInWithEmail = async (
  email: string,
  password: string
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("✅ Firebase 로그인 성공:", user.email);

    return {
      success: true,
      message: "로그인되었습니다.",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    };
  } catch (error: any) {
    console.error("로그인 오류:", error);

    let errorMessage = "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";

    switch (error.code) {
      case "auth/invalid-credential":
        errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
        break;
      case "auth/invalid-email":
        errorMessage = "유효하지 않은 이메일 형식입니다.";
        break;
      case "auth/user-disabled":
        errorMessage = "비활성화된 계정입니다.";
        break;
      case "auth/too-many-requests":
        errorMessage =
          "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.";
        break;
    }

    return {
      success: false,
      message: errorMessage,
      error: error.code,
    };
  }
};

/**
 * 로그아웃
 * @returns 성공 여부
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: "로그아웃되었습니다.",
    };
  } catch (error: any) {
    console.error("로그아웃 오류:", error);
    return {
      success: false,
      message: "로그아웃에 실패했습니다.",
      error: error.code,
    };
  }
};

/**
 * 현재 로그인한 사용자 가져오기
 * @returns 현재 사용자 또는 null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * 인증 상태 변경 리스너
 * @param callback - 인증 상태 변경 시 호출될 콜백 함수
 * @returns unsubscribe 함수
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

// ============================================
// Backend API 연동 함수
// ============================================

const BACKEND_URL = "http://localhost:8080";

/**
 * Backend에 사용자 정보 저장 (회원가입 완료)
 * Firebase 회원가입 후 호출하여 Backend DB에 사용자 정보 저장
 */
export const registerUserToBackend = async (
  name: string,
  studentId: string,
  email: string,
  password: string,
  departmentName: string = "미지정"
) => {
  try {
    const requestBody = {
      studentId,
      email,
      password,
      name,
      departmentName,
    };

    console.log("========== 백엔드 회원가입 API 호출 ==========");
    console.log("요청 URL:", `${BACKEND_URL}/api/auth/signup`);
    console.log("요청 데이터:", requestBody);
    console.log("JSON 문자열:", JSON.stringify(requestBody, null, 2));
    console.log("==============================================");

    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("✅ Backend 회원가입 성공:", data.data);
      return {
        success: true,
        message: "Backend 회원가입이 완료되었습니다.",
        data: data.data,
      };
    } else {
      console.error("Backend 회원가입 실패:", data.message);
      return {
        success: false,
        message: data.message || "Backend 회원가입에 실패했습니다.",
      };
    }
  } catch (error: any) {
    console.error("Backend 회원가입 오류:", error);
    return {
      success: false,
      message: "서버 연결에 실패했습니다.",
      error: error.message,
    };
  }
};

/**
 * Firebase ID Token으로 Backend 로그인
 * Firebase 로그인 후 호출하여 Backend에서 사용자 인증 및 JWT 발급
 */
export const loginToBackend = async (fcmToken?: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        message: "Firebase 로그인이 필요합니다.",
      };
    }

    // Firebase ID Token 발급
    const idToken = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
        fcmToken,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("✅ Backend 로그인 성공:", data.data);
      return {
        success: true,
        message: "Backend 로그인이 완료되었습니다.",
        data: data.data,
      };
    } else {
      console.error("Backend 로그인 실패:", data.message);
      return {
        success: false,
        message: data.message || "Backend 로그인에 실패했습니다.",
      };
    }
  } catch (error: any) {
    console.error("Backend 로그인 오류:", error);
    return {
      success: false,
      message: "서버 연결에 실패했습니다.",
      error: error.message,
    };
  }
};
