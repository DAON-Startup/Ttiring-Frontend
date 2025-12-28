import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Notice } from "../services/crawlerAPI";
import { createBookmark, deleteBookmark } from "../services/bookmarkAPI";
import { getBookmarkedNotices } from "../services/noticeAPI";

interface BookmarkContextType {
  bookmarkedNotices: Notice[];
  bookmarkedIds: string[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (notice: Notice) => Promise<void>;
  addBookmark: (notice: Notice) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  syncBookmarks: () => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const BOOKMARK_STORAGE_KEY = "bookmarkedNotices";
const BOOKMARK_MAP_KEY = "bookmarkIdMap"; // noticeId -> bookmarkId 매핑

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarkedNotices, setBookmarkedNotices] = useState<Notice[]>([]);
  const [bookmarkIdMap, setBookmarkIdMap] = useState<{ [noticeId: string]: number }>({});

  // 앱 시작 시 저장된 북마크 불러오기
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      // 로컬 캐시 불러오기
      const saved = await AsyncStorage.getItem(BOOKMARK_STORAGE_KEY);
      const savedMap = await AsyncStorage.getItem(BOOKMARK_MAP_KEY);
      if (saved) {
        setBookmarkedNotices(JSON.parse(saved));
      }
      if (savedMap) {
        setBookmarkIdMap(JSON.parse(savedMap));
      }

      // 서버에서 동기화
      await syncBookmarks();
    } catch (error) {
      console.error("북마크 불러오기 오류:", error);
    }
  };

  const saveBookmarks = async (notices: Notice[], idMap?: { [noticeId: string]: number }) => {
    try {
      await AsyncStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(notices));
      if (idMap) {
        await AsyncStorage.setItem(BOOKMARK_MAP_KEY, JSON.stringify(idMap));
      }
    } catch (error) {
      console.error("북마크 저장 오류:", error);
    }
  };

  const syncBookmarks = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await getBookmarkedNotices({ page: 0, size: 100, token });
      if (response.success && response.data.content) {
        setBookmarkedNotices(response.data.content as unknown as Notice[]);
        await AsyncStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(response.data.content));
      }
    } catch (error) {
      console.error("북마크 동기화 오류:", error);
    }
  };

  const bookmarkedIds = bookmarkedNotices.map((n) => n.id);

  const isBookmarked = (id: string) => {
    return bookmarkedIds.includes(id);
  };

  const toggleBookmark = async (notice: Notice) => {
    if (isBookmarked(notice.id)) {
      await removeBookmark(notice.id);
    } else {
      await addBookmark(notice);
    }
  };

  const addBookmark = async (notice: Notice) => {
    if (isBookmarked(notice.id)) return;

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("로그인이 필요합니다");
      }

      // 서버에 북마크 추가
      const noticeIdNum = typeof notice.id === 'string' ? parseInt(notice.id, 10) : notice.id;
      const response = await createBookmark(noticeIdNum, token);

      if (response.success && response.data) {
        // 로컬 상태 업데이트
        const updated = [...bookmarkedNotices, notice];
        const newMap = { ...bookmarkIdMap, [notice.id]: response.data.id };

        setBookmarkedNotices(updated);
        setBookmarkIdMap(newMap);
        await saveBookmarks(updated, newMap);
      } else {
        // 서버 응답이 success가 아니어도 로컬에서는 북마크 추가
        const updated = [...bookmarkedNotices, notice];
        setBookmarkedNotices(updated);
        await saveBookmarks(updated);
      }
    } catch (error) {
      console.error("북마크 추가 오류:", error);
      // 서버 오류 시에도 로컬에서는 북마크 추가 (오프라인 지원)
      const updated = [...bookmarkedNotices, notice];
      setBookmarkedNotices(updated);
      await saveBookmarks(updated);
    }
  };

  const removeBookmark = async (id: string) => {
    // 먼저 로컬에서 북마크 삭제 (UI 즉시 반영)
    const updated = bookmarkedNotices.filter((n) => n.id !== id);
    const newMap = { ...bookmarkIdMap };
    delete newMap[id];

    setBookmarkedNotices(updated);
    setBookmarkIdMap(newMap);
    await saveBookmarks(updated, newMap);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        return; // 로그인 안 되어 있으면 로컬만 삭제
      }

      const bookmarkId = bookmarkIdMap[id];
      if (bookmarkId) {
        // 서버에서 북마크 삭제
        await deleteBookmark(bookmarkId, token);
      }
    } catch (error) {
      console.error("북마크 삭제 오류 (로컬은 삭제됨):", error);
      // 서버 오류가 나도 로컬에서는 이미 삭제됨
    }
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedNotices,
        bookmarkedIds,
        isBookmarked,
        toggleBookmark,
        addBookmark,
        removeBookmark,
        syncBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmark() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error("useBookmark must be used within a BookmarkProvider");
  }
  return context;
}
