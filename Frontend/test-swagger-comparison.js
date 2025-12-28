/**
 * Swagger vs 프론트엔드 요청 비교 테스트
 */

const API_BASE_URL = "http://localhost:8080/api";
const JWT_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzdTU2NTNAaW51LmFjLmtyIiwiaWF0IjoxNzYzNzIwMDE0LCJleHAiOjE3NjM4MDY0MTR9.G51G7xRlo1atioKGMvaztKHCQThDPbIpSgcBM-VSdtvS2zbdx6OzTluQ9GmqFuEaC2y5c3lembbJWHfuXSKLGQ";

async function testVariations() {
  console.log("🔍 다양한 요청 방식 테스트\n");

  const tests = [
    {
      name: "기본 요청 (page=1, limit=10)",
      url: `${API_BASE_URL}/crawler/notices?page=1&limit=10`,
    },
    {
      name: "page=0 시작 (Swagger 방식)",
      url: `${API_BASE_URL}/crawler/notices?page=0&size=10`,
    },
    {
      name: "size 파라미터 사용",
      url: `${API_BASE_URL}/crawler/notices?page=0&size=20`,
    },
    {
      name: "파라미터 없음",
      url: `${API_BASE_URL}/crawler/notices`,
    },
    {
      name: "Pageable 형식 (Spring 기본)",
      url: `${API_BASE_URL}/crawler/notices?page=0&size=10&sort=id,desc`,
    },
  ];

  for (const test of tests) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`테스트: ${test.name}`);
    console.log(`URL: ${test.url}`);
    console.log(`${"=".repeat(60)}`);

    try {
      const response = await fetch(test.url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JWT_TOKEN}`,
        },
      });

      console.log(`상태 코드: ${response.status} ${response.statusText}`);

      const text = await response.text();

      if (response.status === 200) {
        const data = JSON.parse(text);
        console.log(`✅ 성공!`);

        if (data.data && data.data.content) {
          console.log(`  - 데이터 개수: ${data.data.content.length}개`);
          console.log(`  - 전체 개수: ${data.data.totalElements}개`);
        } else if (data.content) {
          console.log(`  - 데이터 개수: ${data.content.length}개`);
          console.log(`  - 전체 개수: ${data.totalElements}개`);
        }
      } else {
        console.log(`❌ 실패`);
        console.log(`  응답: ${text.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`❌ 오류: ${error.message}`);
    }

    // 다음 요청 전 대기
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("권장 사항");
  console.log(`${"=".repeat(60)}`);
  console.log("Swagger에서 성공한 요청:");
  console.log("  - 페이지: 0부터 시작 (page=0)");
  console.log("  - 사이즈: size 파라미터 사용");
  console.log("  - 정렬: sort 파라미터 (선택)");
  console.log("\n프론트엔드 수정 필요:");
  console.log("  - getNotices(page, limit) → page를 0부터 시작하도록 변경");
  console.log("  - limit → size로 파라미터명 변경");
}

testVariations().catch(console.error);
