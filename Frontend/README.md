# 공지사항 웹앱 (Frontend)

대학생/동아리 전용 공지사항 앱 프론트엔드  
React Native(Expo) 기반으로 제작되었으며, React Native Web으로 웹 빌드 후 **Vercel**에 배포됩니다.  
애니메이션은 **React Native Animated API** (`Animated`, `Dimensions`)를 활용합니다.  

---

## 주요 기능
- 공지사항 목록 및 상세 페이지
- 로그인 화면 & 사용자 세션 저장 (UI 기준)
- 무한 스크롤 및 카테고리/검색 필터
- **Animated API**를 통한 페이드인/아웃, 슬라이드, 스크롤 애니메이션
- 반응형 UI (Dimensions 활용)

---

## 기술 스택
- **프레임워크**: React Native (Expo), React Native Web
- **언어**: TypeScript
- **스타일링**: NativeWind(Tailwind-in-RN) 또는 React Native StyleSheet
- **애니메이션**: React Native Animated API
- **데이터 관리**: React Query 또는 Zustand
- **빌드/배포**: Expo, Vercel (웹)

---

## 설치 및 실행

```bash
# 레포 클론
git clone https://github.com/your-org/notice-frontend.git
cd notice-frontend

# 의존성 설치
npm install

# 모바일 실행 (Expo Go)
npm start

# 웹 실행 (React Native Web)
npm run web
