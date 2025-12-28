// 크롤러 API 기본 URL
const API_BASE_URL = "http://localhost:8080/api";

/**
 * AsyncStorage에서 JWT 토큰 가져오기
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
    return await AsyncStorage.getItem("authToken");
  } catch (error) {
    console.error("토큰 조회 오류:", error);
    return null;
  }
};

/**
 * 인증 헤더 포함한 fetch 요청
 */
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * 공지사항 데이터 타입
 */
export interface Notice {
  id: string;
  title: string;
  content: string;
  url?: string;
  externalId?: string;
  categoryCode?: string; // 카테고리 코드
  category?: string; // 카테고리명 (호환성 유지)
  detailCategory?: string; // 세부 카테고리 (태그)
  author?: string; // 작성자
  publishedAt: string; // 발행일 (ISO 8601)
  date?: string; // 호환성 유지
  viewCount?: number; // 조회수 (호환성 유지)
  hits?: number; // 조회수 (백엔드 응답)
  isImportant?: boolean; // 중요 공지 여부
  attachments?: string; // 첨부파일
  source?: string; // 출처
  createdAt?: string;
}

/**
 * 크롤링 상태 타입
 */
export interface CrawlerStatus {
  isRunning: boolean;
  lastCrawlTime?: string;
  totalNotices?: number;
  status?: string;
}

/**
 * 공지사항 목록 조회
 * @param page - 페이지 번호 (기본값: 0)
 * @param limit - 페이지당 항목 수 (기본값: 20)
 * @param categoryId - 카테고리 ID 필터 (선택사항)
 * @returns 공지사항 목록
 */
export const getNotices = async (
  page: number = 0,
  limit: number = 20,
  categoryId?: number
) => {
  try {
    let url = `${API_BASE_URL}/notices?page=${page}&size=${limit}`;
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }

    const response = await authenticatedFetch(url, {
      method: "GET",
    });

    // 응답이 비어있는지 확인
    const text = await response.text();
    if (!text) {
      console.warn("빈 응답을 받았습니다");
      return {
        success: false,
        message: "서버에서 빈 응답을 받았습니다",
        data: [],
        total: 0,
      };
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.error("응답 내용:", text);
      return {
        success: false,
        message: "서버 응답을 파싱할 수 없습니다",
        data: [],
        total: 0,
      };
    }

    if (!response.ok) {
      throw new Error(data.message || "공지사항을 불러오는데 실패했습니다.");
    }

    // 백엔드 응답 구조 처리: { success, message, data: { content, totalElements, ... }, timestamp }
    if (data.success === false) {
      return {
        success: false,
        message: data.message || "공지사항을 불러오는데 실패했습니다.",
        data: [],
        total: 0,
      };
    }

    // Spring Page 객체 처리: data.data.content가 실제 배열
    let notices = [];
    let total = 0;

    if (data.data && data.data.content) {
      // Spring Page 응답: { data: { content: [...], totalElements: 10 } }
      notices = data.data.content;
      total = data.data.totalElements || 0;
    } else if (Array.isArray(data.data)) {
      // 배열 직접 반환: { data: [...] }
      notices = data.data;
      total = notices.length;
    } else if (data.content) {
      // Page 객체 직접: { content: [...], totalElements: 10 }
      notices = data.content;
      total = data.totalElements || 0;
    } else if (data.notices) {
      // 커스텀 응답: { notices: [...] }
      notices = data.notices;
      total = data.total || notices.length;
    }

    return {
      success: true,
      data: notices,
      total: total,
      page: data.data?.number || page,
    };
  } catch (error) {
    console.error("공지사항 조회 오류:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "공지사항을 불러오는데 실패했습니다.",
      data: [],
      total: 0,
    };
  }
};

/**
 * 공지사항 상세 조회
 * @param id - 공지사항 ID
 * @returns 공지사항 상세 정보
 */
export const getNoticeDetail = async (id: string) => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/notices/${id}`, {
      method: "GET",
    });

    // 응답이 비어있는지 확인
    const text = await response.text();
    if (!text) {
      console.warn("빈 응답을 받았습니다");
      return {
        success: false,
        message: "서버에서 빈 응답을 받았습니다",
        data: null,
      };
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.error("응답 내용:", text);
      return {
        success: false,
        message: "서버 응답을 파싱할 수 없습니다",
        data: null,
      };
    }

    if (!response.ok) {
      throw new Error(data.message || "공지사항 상세를 불러오는데 실패했습니다.");
    }

    // 디버깅: 응답 데이터 구조 확인
    console.log("getNoticeDetail 원본 응답:", JSON.stringify(data, null, 2));

    // 다양한 응답 구조 처리
    let noticeData = null;
    if (data.data) {
      // { success: true, data: {...} } 형식
      noticeData = data.data;
    } else if (data.notice) {
      // { notice: {...} } 형식
      noticeData = data.notice;
    } else if (data.id && data.title) {
      // 직접 Notice 객체 반환
      noticeData = data;
    }

    return {
      success: true,
      data: noticeData,
    };
  } catch (error) {
    console.error("공지사항 상세 조회 오류:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "공지사항 상세를 불러오는데 실패했습니다.",
      data: null,
    };
  }
};

/**
 * 공지사항 검색
 * @param query - 검색 키워드
 * @param page - 페이지 번호
 * @param limit - 페이지당 항목 수
 * @returns 검색 결과
 */
export const searchNotices = async (
  query: string,
  page: number = 0,
  limit: number = 20
) => {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/search?keyword=${encodeURIComponent(
        query
      )}&page=${page}&size=${limit}`,
      {
        method: "GET",
      }
    );

    // 응답이 비어있는지 확인
    const text = await response.text();
    if (!text) {
      console.warn("빈 응답을 받았습니다");
      return {
        success: false,
        message: "서버에서 빈 응답을 받았습니다",
        data: [],
        total: 0,
      };
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.error("응답 내용:", text);
      return {
        success: false,
        message: "서버 응답을 파싱할 수 없습니다",
        data: [],
        total: 0,
      };
    }

    if (!response.ok) {
      throw new Error(data.message || "검색에 실패했습니다.");
    }

    // Backend 응답 구조: { success, data: { results: [...], totalCount } }
    let results = [];
    let total = 0;

    if (data.data && data.data.results) {
      results = data.data.results;
      total = data.data.totalCount || results.length;
    } else if (data.results) {
      results = data.results;
      total = data.totalCount || results.length;
    } else if (Array.isArray(data.data)) {
      results = data.data;
      total = results.length;
    }

    return {
      success: true,
      data: results,
      total: total,
    };
  } catch (error) {
    console.error("공지사항 검색 오류:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "검색에 실패했습니다.",
      data: [],
      total: 0,
    };
  }
};

/**
 * 크롤링된 공지사항 저장 (더 이상 사용되지 않음)
 *
 * ⚠️ DEPRECATED: 크롤러가 이제 DB에 직접 저장하므로 이 API는 더 이상 사용되지 않습니다.
 *
 * @param notices - 저장할 공지사항 배열
 * @returns 저장 결과
 */
export const saveNotices = async (notices: Partial<Notice>[]) => {
  console.warn("⚠️ saveNotices API는 더 이상 사용되지 않습니다. 크롤러가 DB에 직접 저장합니다.");

  return {
    success: false,
    message: "이 API는 더 이상 사용되지 않습니다. 크롤러가 DB에 직접 저장합니다.",
  };
};

/**
 * 크롤링 상태 조회 (FastAPI 크롤링 서버)
 *
 * ⚠️ Note: 이 API는 FastAPI 크롤링 서버(port 8001)를 직접 호출합니다.
 *
 * @returns 크롤링 상태 정보
 */
export const getCrawlerStatus = async () => {
  try {
    const response = await fetch(`http://localhost:8001/api/v1/crawling-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "크롤러 상태 조회에 실패했습니다.");
    }

    return {
      success: true,
      data: data as CrawlerStatus,
    };
  } catch (error) {
    console.error("크롤러 상태 조회 오류:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "크롤러 상태 조회에 실패했습니다.",
      data: null,
    };
  }
};

/**
 * 크롤러 헬스 체크 (FastAPI 크롤링 서버)
 *
 * ⚠️ Note: 이 API는 FastAPI 크롤링 서버(port 8001)를 직접 호출합니다.
 *
 * @returns 헬스 상태
 */
export const checkCrawlerHealth = async () => {
  try {
    const response = await fetch(`http://localhost:8001/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "헬스 체크에 실패했습니다.");
    }

    return {
      success: true,
      healthy: data.healthy || data.status === "ok",
      message: data.message || "정상",
    };
  } catch (error) {
    console.error("헬스 체크 오류:", error);
    return {
      success: false,
      healthy: false,
      message:
        error instanceof Error ? error.message : "헬스 체크에 실패했습니다.",
    };
  }
};
