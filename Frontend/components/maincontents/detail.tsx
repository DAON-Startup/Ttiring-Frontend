import { useRoute, useNavigation } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Image, Linking, Platform, ScrollView, Share, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { Notice, getNoticeDetail } from "../../services/crawlerAPI";
import { useBookmark } from "../../context/BookmarkContext";
import { useToast } from "../../context/ToastContext";

// 네이티브 플랫폼에서만 WebView 사용
let WebView: any = null;
if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

interface DetailProps {
  onWebViewStateChange?: (isWebView: boolean) => void;
}

// 날짜 문자열을 파싱하는 헬퍼 함수
const parseDate = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr) return null;

  // 문자열로 변환
  const str = String(dateStr).trim();

  // YYYY.MM.DD 형식 처리
  if (str.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
    const [year, month, day] = str.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  // YYYY-MM-DD 형식 처리
  if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // YYYY/MM/DD 형식 처리
  if (str.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
    const [year, month, day] = str.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // ISO 8601 또는 기타 형식
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// 날짜 포맷팅 함수
const formatDate = (notice: any): string => {
  // 다양한 필드명 시도: publishedAt, date, createdAt, postedAt, created_at, posted_at
  const dateStr = notice.publishedAt || notice.date || notice.createdAt ||
                  notice.postedAt || notice.created_at || notice.posted_at;

  const parsed = parseDate(dateStr);

  if (parsed) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return '';
};

// 조회수 가져오기
const getViewCount = (notice: any): number => {
  // hits를 우선적으로 사용, 다양한 필드명 시도
  const count = notice.hits ?? notice.viewCount ?? notice.views ?? notice.view_count ?? notice.hit ?? 0;
  const numCount = typeof count === 'number' ? count : parseInt(count) || 0;
  console.log("getViewCount - hits:", notice.hits, "viewCount:", notice.viewCount, "결과:", numCount);
  return numCount;
};

// 카테고리 가져오기
const getCategory = (notice: any): string => {
  return notice.categoryCode || notice.category || notice.detailCategory ||
         notice.tag || notice.tags || '';
};

export default function Detail({ onWebViewStateChange }: DetailProps = {}) {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as { notice?: Notice } | undefined;
  const initialNotice = params?.notice || null;

  const { isBookmarked, toggleBookmark } = useBookmark();
  const { showToast } = useToast();
  const [notice, setNotice] = useState<Notice | null>(initialNotice);
  const [isLoading, setIsLoading] = useState(true); // 초기값을 true로 설정
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false); // 이미 fetch 했는지 추적
  const webViewRef = useRef<any>(null);

  // 공지사항 상세 정보 불러오기 (API 사용)
  const fetchNoticeDetail = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await getNoticeDetail(id);
      console.log("공지사항 상세 조회 결과:", result);
      if (result.success && result.data) {
        // 기존 notice 정보와 병합 (상세 조회 결과로 업데이트)
        setNotice(prev => ({
          ...prev,
          ...result.data,
        }));
      }
    } catch (error) {
      console.error("공지사항 상세 조회 오류:", error);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  useEffect(() => {
    // 최초 1회만 상세 조회 API 호출
    if (initialNotice?.id && !hasFetched) {
      fetchNoticeDetail(initialNotice.id);
    } else if (!initialNotice?.id) {
      setIsLoading(false);
    }
  }, [initialNotice?.id, hasFetched]);

  // 웹뷰 상태 변경 시 부모 컴포넌트에 알림 (항상 false로 설정하여 Header/BottomBar 유지)
  useEffect(() => {
    if (onWebViewStateChange) {
      onWebViewStateChange(false);
    }
  }, [onWebViewStateChange]);

  const handleBookmark = async () => {
    if (!notice) return;
    try {
      const wasBookmarked = isBookmarked(notice.id);
      await toggleBookmark(notice);
      showToast(wasBookmarked ? "북마크에서 제거되었습니다." : "북마크에 추가되었습니다.");
    } catch (error) {
      console.error("북마크 처리 중 오류:", error);
    }
  };

  // 공유 탭 띄우기 함수
  const handleShare = async (title: string) => {
    try {
      await Share.share({
        message: `${title}\n\n띠링인캠퍼스에서 확인하세요!`,
        title: title,
      });
    } catch (error) {
      console.error("공유 오류:", error);
    }
  };

  // 카테고리 코드를 한글로 변환
  const getCategoryLabel = (categoryCode: string | undefined) => {
    const categoryMap: { [key: string]: string } = {
      'degree': '학사',
      'scholarship': '장학',
      'learning': '학습/상담',
      'employment': '취창업',
      'event': '행사/소식',
      'external-scholarship': '외부장학',
      'other': '기타',
    };
    return categoryCode ? categoryMap[categoryCode] || categoryCode : '';
  };

  // 디버깅: notice 데이터 확인
  useEffect(() => {
    if (notice) {
      console.log("Detail - notice 데이터:", {
        id: notice.id,
        title: notice.title,
        publishedAt: notice.publishedAt,
        date: notice.date,
        categoryCode: notice.categoryCode,
        category: notice.category,
        viewCount: notice.viewCount,
        hits: notice.hits,
        hasContent: !!notice.content,
        contentLength: notice.content?.length || 0,
      });
    }
  }, [notice]);

  if (!notice) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          공지사항을 찾을 수 없습니다
        </Text>
      </View>
    );
  }

  // HTML 컨텐츠 생성 (본문 내용을 WebView로 표시하기 위함)
  const generateHtmlContent = () => {
    // 로딩 중이면 로딩 메시지 표시
    if (isLoading) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                color: #666;
              }
            </style>
          </head>
          <body>
            <p>내용을 불러오는 중...</p>
          </body>
        </html>
      `;
    }

    const content = notice?.content || "";

    // content가 비어있으면 안내 메시지
    if (!content) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                padding: 20px;
                color: #666;
                text-align: center;
              }
              .btn {
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background-color: #3366FF;
                color: white;
                border-radius: 8px;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <p>본문 내용을 불러올 수 없습니다.</p>
            ${notice?.url ? `<p>원문 페이지에서 확인해주세요.</p>` : ''}
          </body>
        </html>
      `;
    }

    // 이미 HTML 태그가 포함되어 있는지 확인
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

    const bodyContent = isHtml ? content : `<p style="white-space: pre-wrap;">${content}</p>`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', Roboto, sans-serif;
              font-size: 15px;
              line-height: 1.7;
              color: #333;
              padding: 0 16px 30px 16px;
              margin: 0;
              background-color: #fff;
              word-break: keep-all;
            }
            p {
              margin: 0 0 16px 0;
            }
            a {
              color: #3366FF;
              text-decoration: none;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
              font-size: 14px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            ul, ol {
              padding-left: 20px;
              margin: 8px 0;
            }
            li {
              margin: 4px 0;
            }
            .attachment {
              background-color: #f9f9f9;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 12px;
              margin-top: 20px;
            }
            .attachment-title {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 8px;
              color: #333;
            }
            .attachment-item {
              font-size: 13px;
              color: #666;
              line-height: 1.5;
            }
            .original-button {
              display: block;
              width: 100%;
              margin: 24px 0 16px 0;
              padding: 14px 0;
              background-color: #3366FF;
              color: #FFFFFF;
              font-size: 15px;
              font-weight: 600;
              text-align: center;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              text-decoration: none;
            }
            .original-button:hover {
              background-color: #2255DD;
            }
          </style>
        </head>
        <body>
          ${bodyContent}
          ${notice?.attachments ? `
            <div class="attachment">
              <div class="attachment-title">첨부파일</div>
              <div class="attachment-item">${notice.attachments}</div>
            </div>
          ` : ''}
          ${notice?.url ? `
            <a href="${notice.url}" target="_blank" class="original-button" onclick="window.ReactNativeWebView && window.ReactNativeWebView.postMessage('openUrl:${notice.url}'); return false;">
              원문 보러가기
            </a>
          ` : ''}
        </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      {/* 공지사항 정보 헤더 */}
      <View style={styles.noticeHeader}>
        <Text style={styles.noticeTitle}>{notice.title}</Text>

        <View style={styles.metaRow}>
          {formatDate(notice) ? (
            <Text style={styles.noticeDate}>{formatDate(notice)}</Text>
          ) : null}

          {getCategory(notice) && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {getCategoryLabel(getCategory(notice)) || getCategory(notice)}
              </Text>
            </View>
          )}

          <Text style={styles.viewCount}>조회 {getViewCount(notice)}</Text>
        </View>

        {/* 북마크 & 공유 버튼 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => handleBookmark()} style={styles.actionButton}>
            <Image
              source={
                isBookmarked(notice.id)
                  ? require("../../assets/images/bookmark2.png")
                  : require("../../assets/images/bookmark.png")
              }
              style={styles.actionIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShare(notice.title)} style={styles.actionButton}>
            <Image
              source={require("../../assets/images/export.png")}
              style={styles.shareIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 본문 내용 */}
      <View style={styles.contentContainer}>
        {/* 로딩 중 */}
        {isLoading && (
          <View style={styles.loadingContentContainer}>
            <ActivityIndicator size="large" color="#3366FF" />
            <Text style={styles.loadingText}>내용을 불러오는 중...</Text>
          </View>
        )}

        {/* 로딩 완료 후 content가 있으면 HTML로 표시 */}
        {!isLoading && notice.content && (
          <>
            {webViewLoading && (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="small" color="#3366FF" />
              </View>
            )}

            {Platform.OS === "web" ? (
              <ScrollView style={styles.webContent}>
                <div
                  dangerouslySetInnerHTML={{ __html: generateHtmlContent() }}
                  style={{ padding: 16 }}
                />
              </ScrollView>
            ) : (
              WebView && (
                <WebView
                  ref={webViewRef}
                  source={{ html: generateHtmlContent() }}
                  style={styles.webView}
                  onLoadStart={() => setWebViewLoading(true)}
                  onLoadEnd={() => setWebViewLoading(false)}
                  onError={(syntheticEvent: any) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error("WebView 오류:", nativeEvent);
                    setWebViewLoading(false);
                  }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  scalesPageToFit={false}
                  showsVerticalScrollIndicator={true}
                  originWhitelist={["*"]}
                  // 반응형 콘텐츠를 위한 설정
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  onShouldStartLoadWithRequest={(request: any) => {
                    const url = request.url;
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                      if (!url.startsWith('about:')) {
                        Linking.openURL(url);
                        return false;
                      }
                    }
                    return true;
                  }}
                  onMessage={(event: any) => {
                    const message = event.nativeEvent.data;
                    if (message.startsWith('openUrl:')) {
                      const url = message.replace('openUrl:', '');
                      Linking.openURL(url);
                    }
                  }}
                />
              )
            )}
          </>
        )}

        {/* 로딩 완료 후 content가 없고 URL이 있으면 URL을 WebView로 표시 */}
        {!isLoading && !notice.content && notice.url && (
          <>
            {webViewLoading && (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="small" color="#3366FF" />
                <Text style={styles.loadingUrlText}>원문 페이지 로딩 중...</Text>
              </View>
            )}

            {Platform.OS === "web" ? (
              <View style={{ flex: 1 }}>
                <iframe
                  src={notice.url}
                  style={{ flex: 1, border: "none", width: "100%", height: "calc(100% - 70px)" }}
                  onLoad={() => setWebViewLoading(false)}
                />
                <View style={styles.webOriginalButtonContainer}>
                  <TouchableOpacity
                    style={styles.webOriginalButton}
                    onPress={() => {
                      if (notice.url) {
                        window.open(notice.url, '_blank');
                      }
                    }}
                  >
                    <Text style={styles.webOriginalButtonText}>원문 보러가기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              WebView && (
                <WebView
                  ref={webViewRef}
                  source={{ uri: notice.url }}
                  style={styles.webView}
                  onLoadStart={() => setWebViewLoading(true)}
                  onLoadEnd={() => setWebViewLoading(false)}
                  onError={(syntheticEvent: any) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error("WebView URL 오류:", nativeEvent);
                    setWebViewLoading(false);
                  }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  scalesPageToFit={true}
                  originWhitelist={["*"]}
                  // 반응형 viewport 설정 및 원문 보러가기 버튼 삽입
                  injectedJavaScript={`
                    (function() {
                      var meta = document.querySelector('meta[name="viewport"]');
                      if (!meta) {
                        meta = document.createElement('meta');
                        meta.name = 'viewport';
                        document.head.appendChild(meta);
                      }
                      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes';

                      // 본문 영역 스타일 조정
                      var style = document.createElement('style');
                      style.textContent = \`
                        body {
                          max-width: 100% !important;
                          overflow-x: hidden !important;
                          word-break: keep-all !important;
                          word-wrap: break-word !important;
                          padding-bottom: 80px !important;
                        }
                        img {
                          max-width: 100% !important;
                          height: auto !important;
                        }
                        table {
                          max-width: 100% !important;
                          overflow-x: auto !important;
                          display: block !important;
                        }
                        pre, code {
                          white-space: pre-wrap !important;
                          word-break: break-all !important;
                        }
                        .app-original-button {
                          display: block;
                          width: calc(100% - 32px);
                          margin: 24px 16px 30px 16px;
                          padding: 14px 0;
                          background-color: #3366FF;
                          color: #FFFFFF !important;
                          font-size: 15px;
                          font-weight: 600;
                          text-align: center;
                          border: none;
                          border-radius: 8px;
                          cursor: pointer;
                          text-decoration: none;
                        }
                      \`;
                      document.head.appendChild(style);

                      // 원문 보러가기 버튼 추가
                      var existingBtn = document.querySelector('.app-original-button');
                      if (!existingBtn) {
                        var btn = document.createElement('a');
                        btn.href = window.location.href;
                        btn.className = 'app-original-button';
                        btn.textContent = '원문 보러가기';
                        btn.onclick = function(e) {
                          e.preventDefault();
                          window.ReactNativeWebView && window.ReactNativeWebView.postMessage('openUrl:' + window.location.href);
                        };
                        document.body.appendChild(btn);
                      }
                    })();
                    true;
                  `}
                  onMessage={(event: any) => {
                    const message = event.nativeEvent.data;
                    if (message.startsWith('openUrl:')) {
                      const url = message.replace('openUrl:', '');
                      Linking.openURL(url);
                    }
                  }}
                  onShouldStartLoadWithRequest={(request: any) => {
                    const url = request.url;
                    if (url.match(/\.(pdf|hwp|hwpx|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|png|jpg|jpeg|gif)(\?.*)?$/i)) {
                      Linking.openURL(url);
                      return false;
                    }
                    if (url.includes("download") || url.includes("fileDown") || url.includes("attachFile") || url.includes("atchmnfl")) {
                      Linking.openURL(url);
                      return false;
                    }
                    return true;
                  }}
                />
              )
            )}
          </>
        )}

        {/* 로딩 완료 후 content도 URL도 없으면 안내 메시지 */}
        {!isLoading && !notice.content && !notice.url && (
          <View style={styles.noContentContainer}>
            <Text style={styles.noContentText}>본문 내용을 불러올 수 없습니다.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 16,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    marginTop: 10,
  },
  noticeHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  noticeTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
    color: '#000',
    lineHeight: 24,
    marginBottom: 10,
    paddingRight: 70, // 북마크/공유 아이콘 공간 확보
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  noticeDate: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#666',
  },
  categoryBadge: {
    backgroundColor: '#8e8e8e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  categoryText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#ffffff',
    lineHeight: 14,
  },
  viewCount: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#999',
  },
  actionButtons: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  shareIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewLoading: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webContent: {
    flex: 1,
  },
  loadingContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingUrlText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noContentText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#999',
  },
  webOriginalButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  webOriginalButton: {
    paddingVertical: 14,
    backgroundColor: '#3366FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  webOriginalButtonText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
