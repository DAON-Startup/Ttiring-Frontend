const BACKEND_URL = "http://localhost:8080";

export interface SearchResult {
  id: number;
  title: string;
  contentPreview: string;
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
  bookmarked?: boolean;
  relevanceScore?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  keyword: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  searchTimeMs: number;
}

export interface RecentSearch {
  id: number;
  keyword: string;
  searchedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * 공지사항 전문 검색
 */
export async function searchNotices(params: {
  keyword: string;
  categoryId?: number;
  sortBy?: "relevance" | "latest" | "oldest";
  page?: number;
  size?: number;
  token: string;
}): Promise<ApiResponse<SearchResponse>> {
  const { keyword, categoryId, sortBy = "relevance", page = 0, size = 20, token } = params;

  const queryParams = new URLSearchParams({
    keyword,
    sortBy,
    page: page.toString(),
    size: size.toString(),
  });

  if (categoryId) queryParams.append("categoryId", categoryId.toString());

  const response = await fetch(`${BACKEND_URL}/api/search?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`검색 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 최근 검색어 조회
 */
export async function getRecentSearches(token: string): Promise<ApiResponse<RecentSearch[]>> {
  const response = await fetch(`${BACKEND_URL}/api/search/recent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`최근 검색어 조회 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 최근 검색어 저장
 */
export async function saveRecentSearch(keyword: string, token: string): Promise<ApiResponse<RecentSearch>> {
  const response = await fetch(`${BACKEND_URL}/api/search/recent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ keyword }),
  });

  if (!response.ok) {
    throw new Error(`최근 검색어 저장 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 최근 검색어 삭제
 */
export async function deleteRecentSearch(id: number, token: string): Promise<ApiResponse<string>> {
  const response = await fetch(`${BACKEND_URL}/api/search/recent/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`최근 검색어 삭제 실패: ${response.statusText}`);
  }

  return response.json();
}
