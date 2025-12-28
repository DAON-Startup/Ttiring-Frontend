const BACKEND_URL = "http://localhost:8080";

export interface UserInfo {
  id: number;
  studentId: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  systemNotificationEnabled: boolean;
  department: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export async function getMyInfo(token: string): Promise<ApiResponse<UserInfo>> {
  const response = await fetch(`${BACKEND_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`내 정보 조회 실패: ${response.statusText}`);
  return response.json();
}

export async function deleteAccount(password: string, token: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${BACKEND_URL}/api/users/me`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) throw new Error(`회원 탈퇴 실패: ${response.statusText}`);
  return response.json();
}

export async function updateStudentId(studentId: string, token: string): Promise<ApiResponse<UserInfo>> {
  const response = await fetch(`${BACKEND_URL}/api/users/student-id`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentId }),
  });
  if (!response.ok) throw new Error(`학번 수정 실패: ${response.statusText}`);
  return response.json();
}

export async function updateName(name: string, token: string): Promise<ApiResponse<UserInfo>> {
  const response = await fetch(`${BACKEND_URL}/api/users/name`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(`이름 수정 실패: ${response.statusText}`);
  return response.json();
}

export async function updateDepartment(departmentId: number, token: string): Promise<ApiResponse<UserInfo>> {
  const response = await fetch(`${BACKEND_URL}/api/users/department`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ departmentId }),
  });
  if (!response.ok) throw new Error(`학과 수정 실패: ${response.statusText}`);
  return response.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
  token: string
): Promise<ApiResponse<void>> {
  const response = await fetch(`${BACKEND_URL}/api/users/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
  if (!response.ok) throw new Error(`비밀번호 변경 실패: ${response.statusText}`);
  return response.json();
}

export async function updateFcmToken(fcmToken: string, token: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${BACKEND_URL}/api/users/fcm-token`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fcmToken }),
  });
  if (!response.ok) throw new Error(`FCM 토큰 업데이트 실패: ${response.statusText}`);
  return response.json();
}

export async function updateSettings(systemNotificationEnabled: boolean, token: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${BACKEND_URL}/api/users/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ systemNotificationEnabled }),
  });
  if (!response.ok) throw new Error(`알림 설정 실패: ${response.statusText}`);
  return response.json();
}

export async function logout(token: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`로그아웃 실패: ${response.statusText}`);
  return response.json();
}

export async function loginWithEmail(
  email: string,
  password: string,
  fcmToken?: string
): Promise<ApiResponse<{ idToken: string; tokenType: string; expiresIn: number; user: any }>> {
  const response = await fetch(`${BACKEND_URL}/api/auth/login/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fcmToken }),
  });
  if (!response.ok) throw new Error(`로그인 실패: ${response.statusText}`);
  return response.json();
}
