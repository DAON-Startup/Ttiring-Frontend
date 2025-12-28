import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 화면 크기 (iPhone 13 기준)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * 화면 너비 비율 계산 (퍼센트 기반)
 * @param percent 0-100 사이의 퍼센트 값
 */
export const wp = (percent: number): number => {
  return (SCREEN_WIDTH * percent) / 100;
};

/**
 * 화면 높이 비율 계산 (퍼센트 기반)
 * @param percent 0-100 사이의 퍼센트 값
 */
export const hp = (percent: number): number => {
  return (SCREEN_HEIGHT * percent) / 100;
};

/**
 * 반응형 폰트 크기 계산
 * 기준 화면 대비 현재 화면 비율로 폰트 크기 조정
 * @param size 기준 폰트 크기 (px)
 */
export const fp = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  // 최소/최대 크기 제한
  return Math.round(PixelRatio.roundToNearestPixel(Math.max(size * 0.8, Math.min(newSize, size * 1.3))));
};

/**
 * 반응형 크기 계산 (너비 기준)
 * @param size 기준 크기 (px)
 */
export const rw = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scale);
};

/**
 * 반응형 크기 계산 (높이 기준)
 * @param size 기준 크기 (px)
 */
export const rh = (size: number): number => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  return Math.round(size * scale);
};

// 화면 크기 export
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// 기존 함수 호환성을 위한 alias
export const responsiveWidth = wp;
export const responsiveHeight = hp;
export const responsiveFontSize = fp;
