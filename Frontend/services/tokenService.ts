import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_INFO_KEY = "userInfo";
const FCM_TOKEN_KEY = "fcmToken";


/**
 * 토큰 저장소 서비스
 */
export const TokenService = {
  /**
   * 액세스 토큰 저장
   */
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("토큰 저장 오류:", error);
      throw error;
    }
  },

  /**
   * 액세스 토큰 조회
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("토큰 조회 오류:", error);
      return null;
    }
  },

  /**
   * 리프레시 토큰 저장
   */
  async saveRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error("리프레시 토큰 저장 오류:", error);
      throw error;
    }
  },

  /**
   * 리프레시 토큰 조회
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("리프레시 토큰 조회 오류:", error);
      return null;
    }
  },

  /**
   * 사용자 정보 저장
   */
  async saveUserInfo(userInfo: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    } catch (error) {
      console.error("사용자 정보 저장 오류:", error);
      throw error;
    }
  },

  /**
   * 사용자 정보 조회
   */
  async getUserInfo(): Promise<any | null> {
    try {
      const userInfo = await AsyncStorage.getItem(USER_INFO_KEY);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
      return null;
    }
  },

  /**
   * 모든 인증 정보 삭제 (로그아웃)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY]);
    } catch (error) {
      console.error("인증 정보 삭제 오류:", error);
      throw error;
    }
  },

  /**
   * 토큰 유효성 체크 (간단한 만료 시간 체크)
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // 초를 밀리초로 변환
      return Date.now() >= exp;
    } catch (error) {
      console.error("토큰 파싱 오류:", error);
      return true; // 파싱 실패 시 만료된 것으로 간주
    }
  },

  /**
   * 로그인 여부 확인
   */
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  },
};
