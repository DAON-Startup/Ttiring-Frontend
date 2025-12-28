const BACKEND_URL = "http://localhost:8080";

export interface Keyword {
  id: number;
  keyword: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export async function getKeywords(token: string): Promise<ApiResponse<Keyword[]>> {
  const response = await fetch(`${BACKEND_URL}/api/keywords`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`키워드 조회 실패: ${response.statusText}`);
  return response.json();
}

export async function createKeyword(keyword: string, token: string): Promise<ApiResponse<Keyword>> {
  const response = await fetch(`${BACKEND_URL}/api/keywords`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ keyword }),
  });
  if (!response.ok) throw new Error(`키워드 등록 실패: ${response.statusText}`);
  return response.json();
}

export async function deleteKeyword(id: number, token: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${BACKEND_URL}/api/keywords/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`키워드 삭제 실패: ${response.statusText}`);
  return response.json();
}

export async function toggleKeyword(id: number, token: string): Promise<ApiResponse<Keyword>> {
  const response = await fetch(`${BACKEND_URL}/api/keywords/${id}/toggle`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`키워드 토글 실패: ${response.statusText}`);
  return response.json();
}
