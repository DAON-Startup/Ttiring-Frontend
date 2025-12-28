/**
 * 공지사항 API 테스트 스크립트
 * 실행: node test-api.js
 */

const API_BASE_URL = "http://localhost:8080/api";
const JWT_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzdTU2NTNAaW51LmFjLmtyIiwiaWF0IjoxNzYzNzIwMDE0LCJleHAiOjE3NjM4MDY0MTR9.G51G7xRlo1atioKGMvaztKHCQThDPbIpSgcBM-VSdtvS2zbdx6OzTluQ9GmqFuEaC2y5c3lembbJWHfuXSKLGQ";

// 공지사항 목록 조회 테스트
async function testGetNotices(category = null) {
  const categoryText = category ? ` (카테고리: ${category})` : " (전체)";
  console.log(`\n=== 공지사항 목록 조회 테스트${categoryText} (JWT 인증) ===`);

  try {
    let url = `${API_BASE_URL}/crawler/notices?page=1&limit=10`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    console.log("요청 URL:", url);
    console.log("JWT 토큰:", JWT_TOKEN.substring(0, 50) + "...");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JWT_TOKEN}`,
      },
    });

    console.log("응답 상태:", response.status, response.statusText);

    const text = await response.text();
    console.log("응답 본문 (원본):", text.substring(0, 500)); // 처음 500자만 출력

    if (!text) {
      console.error("❌ 빈 응답을 받았습니다");
      return;
    }

    const data = JSON.parse(text);
    console.log("\n파싱된 데이터 구조:");
    console.log("- 키 목록:", Object.keys(data));

    // 응답 구조 분석 - Spring Page 객체 처리
    let notices = [];
    if (data.data && data.data.content) {
      // Spring Page: { data: { content: [...] } }
      notices = data.data.content;
      console.log(`\n✅ 응답 구조: Spring Page (data.data.content)`);
      console.log(`✅ 총 공지사항: ${data.data.totalElements}개`);
      console.log(`✅ 현재 페이지: ${notices.length}개`);
    } else if (data.content) {
      // Page 직접: { content: [...] }
      notices = data.content;
      console.log(`\n✅ 응답 구조: Page (content)`);
      console.log(`✅ 총 공지사항: ${data.totalElements}개`);
    } else if (Array.isArray(data.data)) {
      notices = data.data;
      console.log(`\n✅ 응답 구조: Array (data)`);
    } else if (data.notices) {
      notices = data.notices;
      console.log(`\n✅ 응답 구조: Custom (notices)`);
    }

    console.log(`✅ 조회된 개수: ${notices.length}개`);

    if (notices.length > 0) {
      console.log("\n첫 번째 공지사항 예시:");
      console.log(JSON.stringify(notices[0], null, 2));

      // 카테고리 추출
      const categories = [...new Set(notices.map(n => n.categoryCode || n.category).filter(Boolean))];
      console.log("\n발견된 카테고리:", categories);
    }

    return { success: true, data: notices, rawResponse: data };
  } catch (error) {
    console.error("❌ 오류 발생:", error.message);
    return { success: false, error };
  }
}

// 백엔드 연결 테스트
async function testConnection() {
  console.log("=== 백엔드 연결 테스트 ===");

  try {
    const response = await fetch(`${API_BASE_URL}/crawler/health`);
    console.log("Health Check 상태:", response.status);

    if (response.ok) {
      console.log("✅ 백엔드 서버 연결 성공");
      return true;
    } else {
      console.log("⚠️ 백엔드 응답이 있지만 상태 코드가 비정상:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ 백엔드 서버에 연결할 수 없습니다:", error.message);
    console.log("\n해결 방법:");
    console.log("1. 백엔드 서버가 실행 중인지 확인");
    console.log("2. http://localhost:8080 에서 접근 가능한지 확인");
    return false;
  }
}

// 메인 실행
async function main() {
  console.log("🚀 공지사항 API 테스트 시작\n");

  // 1. 연결 테스트 (403 에러는 무시하고 계속 진행)
  await testConnection();

  console.log("\n⚠️ Health 체크 실패해도 공지사항 API는 작동할 수 있으므로 계속 진행합니다...\n");

  // 2. 전체 공지사항 조회 테스트
  const result = await testGetNotices();

  // 3. 카테고리별 조회 테스트
  const categories = ["학사", "장학금", "일반/행사/모집"];
  console.log("\n" + "=".repeat(50));
  console.log("카테고리별 조회 테스트");
  console.log("=".repeat(50));

  for (const category of categories) {
    const categoryResult = await testGetNotices(category);
    if (categoryResult.success && categoryResult.data.length > 0) {
      console.log(`✅ "${category}" 카테고리: ${categoryResult.data.length}개 발견`);
    } else {
      console.log(`⚠️ "${category}" 카테고리: 데이터 없음`);
    }
    // 다음 요청 전 짧은 대기
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 4. 최종 결과 요약
  console.log("\n" + "=".repeat(50));
  console.log("최종 테스트 결과 요약");
  console.log("=".repeat(50));

  if (result && result.success) {
    console.log("✅ API 호출 성공");
    console.log(`✅ 데이터 개수: ${result.data.length}개`);

    // 응답 구조 확인
    if (result.rawResponse.notices) {
      console.log("✅ 응답 구조: { notices: [...] }");
    } else if (result.rawResponse.data) {
      console.log("✅ 응답 구조: { data: [...] }");
    } else if (result.rawResponse.content) {
      console.log("✅ 응답 구조: { content: [...] } (Spring Page)");
    } else if (Array.isArray(result.rawResponse)) {
      console.log("✅ 응답 구조: 배열 [...]");
    }

    console.log("\n프론트엔드 코드 호환성:");
    const compatible = result.rawResponse.notices || result.rawResponse.data;
    if (compatible) {
      console.log("✅ crawlerAPI.ts의 getNotices() 함수와 호환됨");
    } else {
      console.log("⚠️ crawlerAPI.ts 수정 필요");
      console.log("   93번 줄: data.notices || data.data || []");
      console.log("   → 응답 구조에 맞게 수정 필요");
    }
  } else {
    console.log("❌ API 호출 실패");
  }
}

// 실행
main().catch(console.error);
