# Frontend API 사용 문서

> **최종 업데이트**: 2025-12-04
> **아키텍처 변경**: 크롤링 서버가 메인 서버 데이터베이스로 통합됨 (2025-11-03)

## 목차
1. [API 클라이언트 설정](#api-클라이언트-설정)
2. [중요 변경사항](#중요-변경사항)
3. [인증 관련 API](#인증-관련-api)
4. [공지사항 관련 API](#공지사항-관련-api)
5. [검색 관련 API](#검색-관련-api)
6. [사용자 관련 API](#사용자-관련-api)
7. [북마크 관련 API](#북마크-관련-api)
8. [카테고리 관련 API](#카테고리-관련-api)
9. [알림 설정 관련 API](#알림-설정-관련-api)
10. [크롤링 서버 직접 호출 API](#크롤링-서버-직접-호출-api)

---

## API 클라이언트 설정

### Base Configuration
**파일 위치**: `Frontend/services/apiClient.ts`

```typescript
import { Configuration, DefaultApi } from "../generated";

const config = new Configuration({
  basePath: "http://localhost:8080",
});

export const api = new DefaultApi(config);
```

**Base URL**: `http://localhost:8080`

### OpenAPI Generator 사용
프로젝트는 OpenAPI Generator를 사용하여 자동으로 API 클라이언트를 생성합니다.

```bash
# API 클라이언트 재생성
cd Frontend
npm run generate:api
```

**생성된 파일 위치**: `Frontend/generated/`
- `api.ts` - 모든 API 함수
- `configuration.ts` - API 설정
- `base.ts` - 기본 HTTP 클라이언트
- `index.ts` - Export 파일

---

## 중요 변경사항

### 🔄 아키텍처 변경 (2025-11-03)

#### 변경 전 (Old)
```
크롤러 (FastAPI) → Spring Boot API (/api/crawler/notices) → PostgreSQL
  - 크롤러가 Spring Boot API를 통해 데이터 전송
  - 크롤러 전용 DB 사용 (school_notices)
```

#### 변경 후 (Current)
```
크롤러 (FastAPI + SQLAlchemy) → PostgreSQL (incheon_notice)
  - 크롤러가 메인 DB에 직접 저장
  - 단일 통합 데이터베이스 사용
  - crawl_notice 테이블에 저장
```

### API 엔드포인트 변경

| 이전 엔드포인트 | 현재 엔드포인트 | 상태 |
|----------------|----------------|------|
| `GET /api/crawler/notices` | `GET /api/notices` | ✅ 변경됨 |
| `GET /api/crawler/notices/{id}` | `GET /api/notices/{id}` | ✅ 변경됨 |
| `GET /api/crawler/notices/search` | `GET /api/search` | ✅ 변경됨 |
| `POST /api/crawler/notices` | ⛔ 제거됨 | 크롤러가 DB에 직접 저장 |
| `GET /api/crawler/status` | `GET http://localhost:8001/api/v1/crawling-status` | ✅ FastAPI 직접 호출 |
| `GET /api/crawler/health` | `GET http://localhost:8001/health` | ✅ FastAPI 직접 호출 |

### 데이터베이스 테이블 변경

| 테이블 | 용도 | 상태 |
|--------|------|------|
| `crawl_notice` | 크롤링된 공지사항 (메인) | ✅ 사용 중 |
| `notices` | (구) 공지사항 테이블 | ⚠️ 향후 제거 예정 |
| `bookmarks` | 사용자 북마크 | ✅ FK를 `crawl_notice_id`로 변경 |
| `notification_history` | 알림 이력 | ✅ FK를 `crawl_notice_id`로 변경 |

---

## 인증 관련 API

### 1. 회원가입 (Firebase 통합)
**엔드포인트**: `POST /api/auth/signup`
**Generated API**: `api.signUp()`

#### Request Body
```typescript
{
  name: string;        // 사용자 이름
  studentId: string;   // 학번
  email: string;       // 이메일
  password: string;    // 비밀번호 (8-50자)
}
```

#### Response
```typescript
{
  success: boolean;
  data: {
    id: number;
    studentId: string;
    email: string;
    name: string;
    role: string;
  };
}
```

#### 사용 예시
```typescript
import { api } from '../services/apiClient';

const result = await api.signUp({
  signUpRequest: {
    name: "홍길동",
    studentId: "202012345",
    email: "hong@inu.ac.kr",
    password: "password123"
  }
});
```

#### 호출 위치
- `Frontend/components/login/enterPw.tsx:113`

---

### 2. 로그인 (Firebase Authentication)
**엔드포인트**: `POST /api/auth/login`
**Generated API**: `api.login()`

#### Request Body
```typescript
{
  idToken: string;   // Firebase ID Token
  fcmToken?: string; // FCM 토큰 (선택사항)
}
```

#### Request Body 출처
- `idToken`: Firebase Authentication에서 `user.getIdToken()` 호출
  - 위치: `Frontend/services/authAPI.ts:325`
- `fcmToken`: Firebase Messaging에서 발급
  - 위치: `Frontend/components/login/loginMain.tsx`

#### Response
```typescript
{
  success: boolean;
  data: {
    idToken: string;      // JWT 토큰
    tokenType: "Bearer";
    expiresIn: number;
    user: {
      id: number;
      email: string;
      name: string;
      // ...
    };
  };
}
```

#### 사용 예시
```typescript
// 1. Firebase 로그인
const user = auth.currentUser;
const idToken = await user.getIdToken();

// 2. FCM 토큰 발급
const fcmToken = await getToken(messaging);

// 3. 백엔드 로그인
const result = await api.login({
  loginRequest: {
    idToken: idToken,
    fcmToken: fcmToken
  }
});
```

#### 호출 위치
- `Frontend/components/login/loginMain.tsx:146`

---

### 3. 간편 로그인 (이메일/비밀번호)
**엔드포인트**: `POST /api/auth/login/email`
**Generated API**: `api.loginWithEmail()`

#### Request Body
```typescript
{
  email: string;
  password: string;
  fcmToken?: string; // 선택사항
}
```

#### Response
```typescript
{
  success: boolean;
  data: {
    idToken: string;  // Firebase 커스텀 토큰
    tokenType: "Bearer";
    expiresIn: number;
    user: UserResponse;
  };
}
```

#### 사용 예시
```typescript
const response = await api.loginWithEmail({
  emailLoginRequest: {
    email: "test@inu.ac.kr",
    password: "password123"
  }
});

const { idToken } = response.data.data;

// API 요청 시 토큰 사용
const notices = await api.getNotices({
  headers: { 'Authorization': `Bearer ${idToken}` }
});
```

---

### 4. 비밀번호 재설정
**엔드포인트**: `POST /api/auth/forgot-password`
**Generated API**: `api.forgotPassword()`

#### Request Body
```typescript
{
  email: string;
}
```

#### 사용 예시
```typescript
await api.forgotPassword({
  forgotPasswordRequest: {
    email: "user@inu.ac.kr"
  }
});
```

---

### 5. 아이디 찾기
**엔드포인트**: `POST /api/auth/find-id`
**Generated API**: `api.findId()`

#### Request Body
```typescript
{
  name: string;      // 사용자 이름
  studentId: string; // 학번
}
```

#### Response
```typescript
{
  success: boolean;
  data: {
    maskedEmail: string; // "h***@inu.ac.kr"
    message: string;
  };
}
```

---

## 공지사항 관련 API

### 1. 공지사항 목록 조회 ✅ 변경됨
**엔드포인트**: `GET /api/notices`
**Generated API**: `api.getNotices()`

#### Query Parameters
```typescript
{
  page?: number;        // 페이지 번호 (기본값: 0)
  size?: number;        // 페이지 크기 (기본값: 20)
  categoryId?: number;  // 카테고리 ID 필터
  sortBy?: string;      // 정렬: "latest" | "oldest" | "popular"
  important?: boolean;  // 중요 공지만 조회
}
```

#### Response
```typescript
{
  success: boolean;
  data: {
    content: Array<{
      id: number;
      title: string;
      contentPreview: string;
      url: string;
      categoryId: number;
      categoryName: string;
      publishedAt: string; // ISO 8601
      viewCount: number;
      isImportant: boolean;
      bookmarked: boolean;
      // ...
    }>;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}
```

#### 사용 예시 (crawlerAPI.ts)
```typescript
// Frontend/services/crawlerAPI.ts
export const getNotices = async (
  page: number = 0,
  limit: number = 20,
  categoryId?: number
) => {
  const url = `${API_BASE_URL}/notices?page=${page}&size=${limit}${
    categoryId ? `&categoryId=${categoryId}` : ''
  }`;

  const response = await authenticatedFetch(url);
  const data = await response.json();

  return {
    success: true,
    data: data.data.content,
    total: data.data.totalElements,
    page: data.data.currentPage,
  };
};
```

#### 사용 예시 (Generated API)
```typescript
const result = await api.getNotices({
  page: 0,
  size: 20,
  categoryId: 1,
  sortBy: "latest"
});
```

---

### 2. 공지사항 상세 조회 ✅ 변경됨
**엔드포인트**: `GET /api/notices/{noticeId}`
**Generated API**: `api.getNoticeDetail()`

#### Path Parameters
```typescript
{
  noticeId: number; // 공지사항 ID
}
```

#### Response
```typescript
{
  success: boolean;
  data: {
    id: number;
    title: string;
    content: string;
    url: string;
    categoryId: number;
    categoryName: string;
    author: string;
    publishedAt: string;
    viewCount: number;
    isImportant: boolean;
    attachments: string;
    bookmarked: boolean;
    // ...
  };
}
```

#### 사용 예시 (crawlerAPI.ts)
```typescript
// Frontend/services/crawlerAPI.ts
export const getNoticeDetail = async (id: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/notices/${id}`);
  const data = await response.json();

  return {
    success: true,
    data: data.data,
  };
};
```

#### 사용 예시 (Generated API)
```typescript
const result = await api.getNoticeDetail({
  noticeId: 123
});
```

---

### 3. 중요 공지사항 목록 조회
**엔드포인트**: `GET /api/notices/important`
**Generated API**: `api.getImportantNotices()`

#### Response
```typescript
{
  success: boolean;
  data: Array<NoticeResponse>;
}
```

---

### 4. 관련 공지사항 조회
**엔드포인트**: `GET /api/notices/{noticeId}/related`
**Generated API**: `api.getRelatedNotices()`

#### Parameters
```typescript
{
  noticeId: number;
  limit?: number; // 기본값: 5
}
```

---

## 검색 관련 API

### 1. 공지사항 전문 검색 ✅ 변경됨
**엔드포인트**: `GET /api/search`
**Generated API**: `api.search()`

#### Query Parameters
```typescript
{
  keyword: string;      // 검색 키워드 (필수)
  categoryId?: number;  // 카테고리 필터
  sortBy?: string;      // "relevance" | "latest" | "oldest"
  page?: number;        // 페이지 번호 (기본값: 0)
  size?: number;        // 페이지 크기 (기본값: 20)
}
```

#### Response
```typescript
{
  success: boolean;
  data: {
    results: Array<{
      id: number;
      title: string;              // 하이라이트된 제목
      contentPreview: string;     // 하이라이트된 내용 미리보기
      url: string;
      categoryId: number;
      categoryName: string;
      publishedAt: string;
      viewCount: number;
      isImportant: boolean;
      bookmarked: boolean;
      relevanceScore: number;     // 관련도 점수
    }>;
    keyword: string;
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    searchTimeMs: number;
  };
}
```

#### 사용 예시 (crawlerAPI.ts)
```typescript
// Frontend/services/crawlerAPI.ts
export const searchNotices = async (
  query: string,
  page: number = 0,
  limit: number = 20
) => {
  const url = `${API_BASE_URL}/search?keyword=${encodeURIComponent(query)}&page=${page}&size=${limit}`;
  const response = await authenticatedFetch(url);
  const data = await response.json();

  return {
    success: true,
    data: data.data.results,
    total: data.data.totalCount,
  };
};
```

#### 사용 예시 (Generated API)
```typescript
const result = await api.search({
  keyword: "장학금",
  sortBy: "relevance",
  page: 0,
  size: 20
});
```

---

### 2. 검색어 자동완성
**엔드포인트**: `GET /api/search/autocomplete`
**Generated API**: `api.autocomplete()`

#### Query Parameters
```typescript
{
  prefix: string; // 검색어 접두사 (최소 2글자)
  limit?: number; // 결과 개수 (기본값: 10)
}
```

#### Response
```typescript
{
  success: boolean;
  data: Array<{
    keyword: string;
    matchCount: number;
    category: string;
  }>;
}
```

---

### 3. 최근 검색어 조회
**엔드포인트**: `GET /api/search/recent`
**Generated API**: `api.getRecentSearches()`

#### Response
```typescript
{
  success: boolean;
  data: Array<{
    id: number;
    keyword: string;
    searchedAt: string;
  }>;
}
```

---

### 4. 최근 검색어 저장
**엔드포인트**: `POST /api/search/recent`
**Generated API**: `api.saveRecentSearch()`

#### Request Body
```typescript
{
  keyword: string;
}
```

---

### 5. 최근 검색어 삭제
**엔드포인트**: `DELETE /api/search/recent/{id}`
**Generated API**: `api.deleteRecentSearch()`

---

### 6. 인기 검색어 조회
**엔드포인트**: `GET /api/search/popular`
**Generated API**: `api.getPopularKeywords()`

#### Query Parameters
```typescript
{
  limit?: number; // 기본값: 10
}
```

---

## 사용자 관련 API

### 1. 내 정보 조회
**엔드포인트**: `GET /api/users/me`
**Generated API**: `api.getMyInfo()`

#### Response
```typescript
{
  success: boolean;
  data: {
    id: number;
    studentId: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    darkMode: boolean;
    systemNotificationEnabled: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### 2. 프로필 수정
**엔드포인트**: `PUT /api/users/me`
**Generated API**: `api.updateProfile()`

#### Request Body
```typescript
{
  name?: string;
  email?: string;
}
```

---

### 3. 비밀번호 변경
**엔드포인트**: `PUT /api/users/password`
**Generated API**: `api.changePassword()`

#### Request Body
```typescript
{
  currentPassword: string;
  newPassword: string;     // 6자 이상
  confirmPassword: string;
}
```

---

### 4. 사용자 설정 수정
**엔드포인트**: `PUT /api/users/settings`
**Generated API**: `api.updateSettings()`

#### Request Body
```typescript
{
  darkMode?: boolean;
  systemNotificationEnabled?: boolean;
}
```

---

### 5. FCM 토큰 업데이트
**엔드포인트**: `PUT /api/users/fcm-token`
**Generated API**: `api.updateFcmToken()`

#### Request Body
```typescript
{
  fcmToken: string;
}
```

#### Request Body 출처
- `fcmToken`: Firebase Messaging에서 발급
  - 위치: `Frontend/config/firebaseConfig.ts`

---

### 6. 회원 탈퇴
**엔드포인트**: `DELETE /api/users/me`
**Generated API**: `api.deleteAccount()`

#### Request Body
```typescript
{
  password: string; // 비밀번호 확인
}
```

---

## 북마크 관련 API

### 1. 북마크 목록 조회
**엔드포인트**: `GET /api/bookmarks`
**Generated API**: `api.getMyBookmarks()`

#### Query Parameters
```typescript
{
  page?: number; // 기본값: 0
  size?: number; // 기본값: 20
}
```

---

### 2. 북마크 생성
**엔드포인트**: `POST /api/bookmarks`
**Generated API**: `api.createBookmark()`

#### Request Body
```typescript
{
  noticeId: number;
  memo?: string;
}
```

#### Request Body 출처
- `noticeId`: 공지사항 상세 화면에서 전달
- `memo`: 사용자 입력

---

### 3. 북마크 상세 조회
**엔드포인트**: `GET /api/bookmarks/{id}`
**Generated API**: `api.getBookmark()`

---

### 4. 북마크 메모 수정
**엔드포인트**: `PUT /api/bookmarks/{id}/memo`
**Generated API**: `api.updateBookmarkMemo()`

#### Request Body
```typescript
{
  memo?: string;
}
```

---

### 5. 북마크 삭제
**엔드포인트**: `DELETE /api/bookmarks/{id}`
**Generated API**: `api.deleteBookmark()`

---

### 6. 북마크 개수 조회
**엔드포인트**: `GET /api/bookmarks/count`
**Generated API**: `api.getBookmarkCount()`

---

### 7. 북마크 여부 확인
**엔드포인트**: `GET /api/bookmarks/check/{noticeId}`
**Generated API**: `api.isBookmarked()`

---

## 카테고리 관련 API

### 1. 전체 카테고리 목록 조회
**엔드포인트**: `GET /api/categories`
**Generated API**: `api.getAllCategories()`

#### Response
```typescript
{
  success: boolean;
  data: Array<{
    id: number;
    name: string;
    code: string;
    description: string;
    noticeCount: number;
    isActive: boolean;
    // ...
  }>;
}
```

#### 호출 위치
- `Frontend/components/maincontents/alert.tsx:66`
- `Frontend/scripts/testApiCategories.ts:5`

---

### 2. 특정 카테고리 조회
**엔드포인트**: `GET /api/categories/{code}`
**Generated API**: `api.getCategoryByCode()`

---

### 3. 활성 카테고리 목록 조회
**엔드포인트**: `GET /api/categories/active`
**Generated API**: `api.getActiveCategories()`

---

## 알림 설정 관련 API

### 1. 구독 카테고리 조회
**엔드포인트**: `GET /api/preferences/categories`
**Generated API**: `api.getMyPreferences()`

#### Response
```typescript
{
  success: boolean;
  data: Array<{
    id: number;
    categoryId: number;
    categoryName: string;
    notificationEnabled: boolean;
    subscribedAt: string;
  }>;
}
```

---

### 2. 카테고리 구독
**엔드포인트**: `POST /api/preferences/categories`
**Generated API**: `api.subscribeCategory()`

#### Request Body
```typescript
{
  categoryId: number;
  notificationEnabled?: boolean; // 기본값: true
}
```

---

### 3. 구독 취소
**엔드포인트**: `DELETE /api/preferences/categories/{categoryId}`
**Generated API**: `api.unsubscribeCategory()`

---

### 4. 알림 설정 변경
**엔드포인트**: `PUT /api/preferences/categories/{categoryId}/notification`
**Generated API**: `api.updateNotification()`

#### Request Body
```typescript
{
  notificationEnabled: boolean;
}
```

---

### 5. 구독 여부 확인
**엔드포인트**: `GET /api/preferences/categories/{categoryId}/subscribed`
**Generated API**: `api.isSubscribed()`

---

### 6. 활성 구독 조회
**엔드포인트**: `GET /api/preferences/categories/active`
**Generated API**: `api.getActivePreferences()`

---

## 크롤링 서버 직접 호출 API

⚠️ **주의**: 이 API들은 FastAPI 크롤링 서버(port 8001)를 직접 호출합니다.

### 1. 크롤링 상태 조회
**엔드포인트**: `GET http://localhost:8001/api/v1/crawling-status`
**함수**: `getCrawlerStatus()` (crawlerAPI.ts)

#### Response
```typescript
{
  isRunning: boolean;
  lastCrawlTime?: string;
  totalNotices?: number;
  status?: string;
}
```

---

### 2. 크롤러 헬스 체크
**엔드포인트**: `GET http://localhost:8001/health`
**함수**: `checkCrawlerHealth()` (crawlerAPI.ts)

#### Response
```typescript
{
  healthy: boolean;
  status: string;
  message?: string;
}
```

---

### 3. 크롤링 대시보드
**URL**: `http://localhost:8001/dashboard`
크롤링된 데이터를 웹 대시보드로 확인할 수 있습니다.

---

### 4. 크롤링 실행 (API Key 필요)
**엔드포인트**: `POST http://localhost:8001/run-crawler/{category}`

#### Header
```
X-API-Key: 0QWUQ6uNxMn4rvSqka4PeQx62ZtysZGF01VXBip0QjY
```

#### 카테고리 목록
- `volunteer` - 봉사
- `job` - 취업
- `scholarship` - 장학금
- `general_events` - 일반행사/채용
- `educational_test` - 교육시험
- `tuition_payment` - 등록금납부
- `academic_credit` - 학점
- `degree` - 학위
- `all` - 전체 크롤링

#### 예시
```bash
curl -X POST "http://localhost:8001/run-crawler/volunteer" \
  -H "X-API-Key: 0QWUQ6uNxMn4rvSqka4PeQx62ZtysZGF01VXBip0QjY"
```

---

## 인증 헤더 처리

### 1. Crawler API (수동 처리)
**위치**: `Frontend/services/crawlerAPI.ts:20-35`

```typescript
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = await getAuthToken(); // AsyncStorage에서 토큰 조회
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
};
```

### 2. Generated API (자동 처리)
**위치**: `Frontend/generated/api.ts`

- Bearer 인증은 Configuration 객체에 설정
- 각 API 호출 시 자동으로 헤더에 포함

```typescript
// Configuration 설정
const config = new Configuration({
  basePath: "http://localhost:8080",
  accessToken: async () => {
    const token = await AsyncStorage.getItem("authToken");
    return token || "";
  }
});

// 사용 예시
const api = new DefaultApi(config);
const notices = await api.getNotices(); // 자동으로 Authorization 헤더 포함
```

---

## Request Body 데이터 흐름 요약

| API | Request Body | 데이터 출처 |
|-----|--------------|------------|
| 회원가입 (Backend) | name, studentId, email, password | 회원가입 폼 (사용자 입력) |
| 로그인 (Backend) | idToken, fcmToken | Firebase Auth + Firebase Messaging |
| 공지사항 조회 | page, size, categoryId | 페이지네이션 상태 + 필터 선택 |
| 공지사항 검색 | keyword, page, size | 검색 입력 필드 + 페이지네이션 |
| FCM 토큰 업데이트 | fcmToken | Firebase Messaging |
| 북마크 생성 | noticeId, memo | 공지사항 ID + 사용자 입력 |
| 카테고리 구독 | categoryId, notificationEnabled | 알림 설정 화면 |

---

## 주요 파일 구조

```
Frontend/
├── services/
│   ├── apiClient.ts         # API 클라이언트 설정
│   ├── authAPI.ts           # 인증 관련 API (Firebase)
│   ├── crawlerAPI.ts        # 공지사항 관련 API (수동)
│   ├── userAPI.ts           # 사용자 관련 API
│   └── tokenService.ts      # 토큰 관리
├── generated/               # OpenAPI Generator 생성 파일
│   ├── api.ts              # 모든 API 함수
│   ├── configuration.ts    # API 설정
│   ├── base.ts             # 기본 HTTP 클라이언트
│   └── index.ts            # Export 파일
├── components/
│   ├── login/
│   │   ├── loginMain.tsx    # 로그인 화면
│   │   └── enterPw.tsx      # 회원가입 화면
│   └── maincontents/
│       └── alert.tsx        # 알림 설정
└── config/
    └── firebaseConfig.ts    # Firebase 설정
```

---

## 환경 변수

### 개발 환경
```typescript
// 현재 하드코딩된 URL
const API_BASE_URL = "http://localhost:8080";
const CRAWLER_API_URL = "http://localhost:8001";
```

### 프로덕션 환경 권장
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const CRAWLER_API_URL = process.env.REACT_APP_CRAWLER_URL || "http://localhost:8001";
```

---

## 데이터베이스 구조

### 통합 데이터베이스: `incheon_notice`

#### 크롤러 테이블
- `crawl_job` - 크롤링 작업 정의
- `crawl_task` - 크롤링 태스크 실행 이력
- `crawl_notice` - 크롤링된 공지사항 (메인)
- `host_budget` - 호스트별 크롤링 예산 관리
- `webhook` - 웹훅 설정

#### 메인 서버 테이블
- `users` - 사용자 정보
- `categories` - 공지사항 카테고리
- `notices` - (구) 공지사항 테이블 (향후 제거 예정)
- `bookmarks` - 사용자 북마크
- `notification_history` - 알림 이력
- `user_preferences` - 사용자 설정

#### FK 관계 변경
- `bookmarks.notice_id` → `bookmarks.crawl_notice_id`
- `notification_history.notice_id` → `notification_history.crawl_notice_id`

---

## 추가 문서

- [Spring Boot API 문서](http://localhost:8080/swagger-ui/index.html) - Swagger UI
- [크롤링 API 문서](http://localhost:8001/docs) - FastAPI Swagger UI
- [크롤링 대시보드](http://localhost:8001/dashboard) - 크롤링 데이터 조회
- [프로젝트 URL 가이드](Backend/PROJECT_URLS.md) - 서비스별 접속 정보

---

**마지막 업데이트**: 2025-12-04
**주요 변경사항**:
- ✅ API 엔드포인트 경로 변경 반영 (`/api/crawler/notices` → `/api/notices`)
- ✅ 크롤러 아키텍처 변경사항 문서화 (DB 직접 저장)
- ✅ OpenAPI Generator로 생성된 API 사용법 추가
- ✅ 검색 API 엔드포인트 업데이트 (`/api/search`)
- ✅ 데이터베이스 테이블 구조 변경사항 반영
