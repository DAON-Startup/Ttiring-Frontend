const BACKEND_URL = "http://localhost:8080";

export interface Notice {
  id: number;
  title: string;
  content?: string;
  url?: string;
  categoryId: number;
  categoryName?: string;
  categoryCode?: string;
  detailCategory?: string;
  source?: string;
  author?: string;
  date?: string;
  publishedAt?: string;
  viewCount?: number;
  hits?: string;
  isImportant?: boolean;
  isPinned?: boolean;
  attachments?: string;
  bookmarked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * 공지사항 목록 조회
 */
export async function getNotices(params: {
  categoryId?: number;
  sortBy?: "latest" | "oldest" | "popular";
  important?: boolean;
  page?: number;
  size?: number;
  token: string;
}): Promise<ApiResponse<PageResponse<Notice>>> {
  const { categoryId, sortBy = "latest", important, page = 0, size = 20, token } = params;

  const queryParams = new URLSearchParams({
    sortBy,
    page: page.toString(),
    size: size.toString(),
  });

  if (categoryId) queryParams.append("categoryId", categoryId.toString());
  if (important !== undefined) queryParams.append("important", important.toString());

  const response = await fetch(`${BACKEND_URL}/api/notices?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`공지사항 조회 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 공지사항 상세 조회
 */
export async function getNoticeDetail(noticeId: number, token: string): Promise<ApiResponse<Notice>> {
  const response = await fetch(`${BACKEND_URL}/api/notices/${noticeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`공지사항 상세 조회 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 구독 카테고리 공지사항 조회
 */
export async function getSubscribedNotices(params: {
  page?: number;
  size?: number;
  token: string;
}): Promise<ApiResponse<PageResponse<Notice>>> {
  const { page = 0, size = 20, token } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const response = await fetch(`${BACKEND_URL}/api/notices/subscribed?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`구독 공지사항 조회 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 북마크한 공지사항 조회
 */
export async function getBookmarkedNotices(params: {
  page?: number;
  size?: number;
  token: string;
}): Promise<ApiResponse<PageResponse<Notice>>> {
  const { page = 0, size = 20, token } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const response = await fetch(`${BACKEND_URL}/api/notices/bookmarked?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`북마크 공지사항 조회 실패: ${response.statusText}`);
  }

  return response.json();
}
