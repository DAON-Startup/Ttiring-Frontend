const BACKEND_URL = "http://localhost:8080";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Bookmark {
  id: number;
  noticeId: number;
  createdAt: string;
}

/**
 * 북마크 생성
 */
export async function createBookmark(noticeId: number, token: string): Promise<ApiResponse<Bookmark>> {
  const response = await fetch(`${BACKEND_URL}/api/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ noticeId }),
  });

  if (!response.ok) {
    throw new Error(`북마크 생성 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 북마크 삭제
 */
export async function deleteBookmark(id: number, token: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${BACKEND_URL}/api/bookmarks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`북마크 삭제 실패: ${response.statusText}`);
  }

  return response.json();
}
