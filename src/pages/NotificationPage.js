import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./NotificationPage.css";

const NotificationPage = ({ user }) => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [displayedCount, setDisplayedCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // 확장된 알림 데이터
  const allNotifications = useMemo(
    () => [
      {
        id: 1,
        title: "새로운 고객 배정",
        message: "4명의 고객이 배정되었습니다.",
        time: "5분 전",
        date: "2024-01-15",
        unread: true,
        type: "assignment",
        priority: "high",
      },
      {
        id: 2,
        title: "시스템 점검 안내",
        message: "오늘 밤 2시부터 시스템 점검이 있습니다.",
        time: "1시간 전",
        date: "2024-01-15",
        unread: true,
        type: "system",
        priority: "medium",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
      {
        id: 3,
        title: "새로운 공지사항",
        message: "공지사항이 등록되었습니다.",
        time: "4일 전",
        date: "2024-01-11",
        unread: false,
        type: "notice",
        priority: "low",
      },
    ],
    []
  );

  const getFilteredNotifications = () => {
    let filtered;
    switch (selectedTab) {
      case "unread":
        filtered = allNotifications.filter((n) => n.unread);
        break;
      default:
        filtered = allNotifications;
        break;
    }
    return filtered.slice(0, displayedCount);
  };

  const getAllFilteredNotifications = useCallback(() => {
    switch (selectedTab) {
      case "unread":
        return allNotifications.filter((n) => n.unread);
      default:
        return allNotifications;
    }
  }, [selectedTab, allNotifications]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "assignment":
        return "👥";
      case "system":
        return "⚙️";
      case "notice":
        return "📢";
      case "payment":
        return "💰";
      case "consultation":
        return "💬";
      case "report":
        return "📊";
      default:
        return "🔔";
    }
  };

  const markAsRead = (id) => {
    // 실제로는 서버에 읽음 처리 요청
    console.log(`Mark notification ${id} as read`);
  };

  const markAllAsRead = () => {
    // 모든 알림을 읽음 처리
    console.log("Mark all notifications as read");
  };

  const loadMoreNotifications = useCallback(() => {
    if (isLoading) return;

    const allFiltered = getAllFilteredNotifications();
    if (displayedCount >= allFiltered.length) return;

    setIsLoading(true);

    // 실제로는 API 호출을 시뮬레이션
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + 10, allFiltered.length));
      setIsLoading(false);
    }, 500);
  }, [isLoading, displayedCount, getAllFilteredNotifications]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000
    ) {
      loadMoreNotifications();
    }
  }, [loadMoreNotifications]);

  // 탭 변경 시 표시 개수 초기화
  useEffect(() => {
    setDisplayedCount(10);
  }, [selectedTab]);

  // 스크롤 이벤트 등록
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const filteredNotifications = getFilteredNotifications();
  const allFilteredNotifications = getAllFilteredNotifications();
  const unreadCount = allNotifications.filter((n) => n.unread).length;
  const hasMoreNotifications = displayedCount < allFilteredNotifications.length;

  return (
    <div className="notification-page">
      <div className="container">
        <div className="page-header">
          <h1>알림</h1>
          <p>모든 알림을 확인하고 관리하세요</p>
        </div>

        <div className="notifications-board">
          <div className="notifications-tabs">
            <div className="notifications-tab-group">
              <button
                className={`notifications-tab-btn ${
                  selectedTab === "all" ? "active" : ""
                }`}
                onClick={() => setSelectedTab("all")}
              >
                전체 ({allNotifications.length})
              </button>
              <button
                className={`notifications-tab-btn ${
                  selectedTab === "unread" ? "active" : ""
                }`}
                onClick={() => setSelectedTab("unread")}
              >
                미읽음 ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                className="btn btn-secondary notifications-mark-all-btn"
                onClick={markAllAsRead}
              >
                모두 읽음 처리
              </button>
            )}
          </div>

          <div className="notifications-content">
            {filteredNotifications.length > 0 ? (
              <>
                <div className="notifications-list">
                  {filteredNotifications.map((notification, index) => (
                    <div
                      key={`${notification.id}-${index}`}
                      className={`notifications-card ${
                        notification.unread ? "unread" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="notifications-icon">
                        {getTypeIcon(notification.type)}
                      </div>

                      <div className="notifications-body">
                        <div className="notifications-header">
                          <h4>{notification.title}</h4>
                          <span className="notifications-time">
                            {notification.time}
                          </span>
                        </div>

                        <p className="notifications-message">
                          {notification.message}
                        </p>
                      </div>

                      {notification.unread && (
                        <div className="notifications-unread-dot"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 로딩 인디케이터 */}
                {isLoading && (
                  <div className="notifications-loading">
                    <div className="loading-spinner"></div>
                    <span>알림을 불러오는 중...</span>
                  </div>
                )}

                {/* 더 보기 버튼 (무한 스크롤 대신 수동 로드 옵션) */}
                {!isLoading && hasMoreNotifications && (
                  <div className="notifications-load-more">
                    <button
                      className="load-more-btn"
                      onClick={loadMoreNotifications}
                    >
                      더 보기
                    </button>
                  </div>
                )}

                {/* 모든 알림 로드 완료 메시지 */}
                {!hasMoreNotifications &&
                  allFilteredNotifications.length > 10 && (
                    <div className="notifications-end">
                      <p>모든 알림을 확인했습니다.</p>
                    </div>
                  )}
              </>
            ) : (
              <div className="notifications-empty-state">
                <div className="notifications-empty-icon">🔔</div>
                <h3>알림이 없습니다</h3>
                <p>선택한 필터에 해당하는 알림이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
