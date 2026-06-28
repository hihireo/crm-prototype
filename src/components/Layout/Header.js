import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ user, currentService, onLogout }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // 샘플 알림 데이터
  const notifications = [
    {
      id: 1,
      title: "새로운 고객 배정",
      message: "4명의 고객이 배정되었습니다.",
      time: "5분 전",
      unread: true,
    },
    {
      id: 2,
      title: "시스템 점검 안내",
      message: "오늘 밤 2시부터 시스템 점검이 있습니다.",
      time: "1시간 전",
      unread: true,
    },
    {
      id: 3,
      title: "새로운 공지사항",
      message: "공지사항이 등록되었습니다.",
      time: "4일 전",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleViewAllNotifications = () => {
    setIsNotificationOpen(false);
    navigate("/notifications");
  };

  const handleMarkAllAsRead = () => {
    // 실제로는 서버에 모든 알림 읽음 처리 요청
    console.log("Mark all notifications as read");
    // 알림 상태 업데이트 로직 추가 가능
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <Link to="/dashboard" className="logo">
              <img src="/images/talkgate-logo-white.png" alt="TalkGate" className="logo-img" />
            </Link>
            {currentService && (
              <div className="header-service-info">
                <span className="service-name">{currentService}</span>
              </div>
            )}
            <nav className="nav">
              <Link to="/dashboard" className="nav-link">
                대시보드
              </Link>
              <Link to="/consultation" className="nav-link consultation-link">
                상담
                <span className="consultation-red-dot"></span>
              </Link>
              <Link to="/applications" className="nav-link">
                고객목록
              </Link>
              <Link to="/statistics" className="nav-link">
                통계
              </Link>
              <Link to="/attendance" className="nav-link">
                근태
              </Link>
              <Link to="/checklist" className="nav-link">
                회생 상담
              </Link>
              <Link to="/notice" className="nav-link">
                공지사항
              </Link>
              <Link to="/settings" className="nav-link">
                설정
              </Link>
            </nav>
          </div>

          <div className="header-right">
            {user && (
              <div className="user-section">
                {/* 알림 */}
                <div className="notification-wrapper">
                  <button
                    className="notification-btn"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="notification-dropdown">
                      <div className="notification-header">
                        <h4>알림</h4>
                        <div className="notification-header-actions">
                          {/* <span className="notification-count">
                            {unreadCount}개 미읽음
                          </span> */}
                          {unreadCount > 0 && (
                            <button
                              className="header-mark-all-btn"
                              onClick={handleMarkAllAsRead}
                            >
                              모두 읽음
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="notification-list">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`notification-item ${
                              notification.unread ? "unread" : ""
                            }`}
                          >
                            <div className="notification-content">
                              <h5>
                                <span>{notification.title}</span>
                                <span className="notification-time">
                                  {notification.time}
                                </span>
                              </h5>
                              <span className="notification-desc">
                                {notification.message}
                              </span>
                            </div>
                            {notification.unread && (
                              <div className="notification-dot"></div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="notification-footer">
                        <button
                          className="view-all-btn"
                          onClick={handleViewAllNotifications}
                        >
                          모든 알림 보기
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 프로필 */}
                <div className="hdr-profile-wrapper">
                  <button
                    className="hdr-profile-btn"
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                  >
                    <div className="user-avatar">{user.name.charAt(0)}</div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="hdr-profile-dropdown">
                      <div className="hdr-profile-info">
                        <div className="hdr-profile-avatar">
                          {user.name.charAt(0)}
                        </div>
                        <div className="hdr-profile-details">
                          <div className="hdr-profile-email">
                            {user.email || "user@example.com"}
                          </div>
                          <div className="hdr-profile-uid">
                            UID: {user.uid || "12345"}
                          </div>
                        </div>
                      </div>
                      <div className="hdr-profile-divider"></div>
                      <div className="hdr-profile-actions">
                        <button
                          className="hdr-profile-action-btn"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigate("/personal-settings");
                          }}
                        >
                          <span className="hdr-action-icon">⚙️</span>
                          개인 설정
                        </button>
                        <button
                          className="hdr-profile-action-btn hdr-logout-btn"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            onLogout();
                          }}
                        >
                          <span className="hdr-action-icon">🚪</span>
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 알림 드롭다운 바깥 클릭 시 닫기 */}
      {isNotificationOpen && (
        <div
          className="notification-overlay"
          onClick={() => setIsNotificationOpen(false)}
        />
      )}

      {/* 프로필 드롭다운 바깥 클릭 시 닫기 */}
      {isProfileDropdownOpen && (
        <div
          className="hdr-profile-overlay"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
