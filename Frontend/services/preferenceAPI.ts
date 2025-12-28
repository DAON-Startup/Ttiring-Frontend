const BACKEND_URL = "http://localhost:8080";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface DetailCategoryResponse {
  id: number;
  name: string;
  subscribed: boolean;
}

export interface DetailCategorySubscription {
  detailCategoryId: number;
  enabled: boolean;
}

export interface PreferenceResponse {
  id: number;
  detailCategory: DetailCategoryResponse;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 상세 카테고리 목록 조회
 */
export async function getDetailCategories(token: string): Promise<ApiResponse<DetailCategoryResponse[]>> {
  const response = await fetch(`${BACKEND_URL}/api/preferences/detail-categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`상세 카테고리 조회 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 활성 구독 조회
 */
export async function getActivePreferences(token: string): Promise<ApiResponse<PreferenceResponse[]>> {
  const response = await fetch(`${BACKEND_URL}/api/preferences/categories/active`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`활성 구독 조회 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 알림 상세 카테고리 구독 설정
 */
export async function updateDetailCategorySubscriptions(
  subscriptions: DetailCategorySubscription[],
  token: string
): Promise<ApiResponse<DetailCategoryResponse[]>> {
  const response = await fetch(`${BACKEND_URL}/api/preferences/categories`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ subscriptions }),
  });

  if (!response.ok) {
    throw new Error(`구독 설정 업데이트 실패: ${response.statusText}`);
  }

  return response.json();
}
