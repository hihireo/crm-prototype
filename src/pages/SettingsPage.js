import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import MembersPage from "./settings/MembersPage";
import TeamsPage from "./settings/TeamsPage";
import "./SettingsPage.css";

const SettingsPage = ({ service }) => {
  const location = useLocation();

  const settingsMenus = [
    { id: "general", name: "일반", path: "/settings/general", icon: "⚙️" },
    { id: "members", name: "멤버", path: "/settings/members", icon: "👥" },
    { id: "teams", name: "팀 관리", path: "/settings/teams", icon: "🏢" },
    {
      id: "notifications",
      name: "알림",
      path: "/settings/notifications",
      icon: "🔔",
    },
    {
      id: "security",
      name: "보안",
      path: "/settings/security",
      icon: "🔒",
    },
  ];

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-layout">
          <div className="settings-sidebar">
            <div className="settings-header">
              <h2>서비스 설정</h2>
              <p>{service}</p>
            </div>

            <nav className="settings-nav">
              {settingsMenus.map((menu) => (
                <Link
                  key={menu.id}
                  to={menu.path}
                  className={`settings-nav-link ${
                    location.pathname === menu.path ? "active" : ""
                  }`}
                >
                  <span className="nav-icon">{menu.icon}</span>
                  <span className="nav-text">{menu.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="settings-content">
            <Routes>
              <Route
                path="/general"
                element={<GeneralSettings service={service} />}
              />
              <Route
                path="/members"
                element={<MembersPage service={service} />}
              />
              <Route path="/teams" element={<TeamsPage service={service} />} />
              <Route
                path="/notifications"
                element={<NotificationSettings service={service} />}
              />
              <Route
                path="/security"
                element={<SecuritySettings service={service} />}
              />
              <Route path="/" element={<MembersPage service={service} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

// 임시 컴포넌트들
const GeneralSettings = ({ service }) => (
  <div className="settings-section">
    <h3>일반 설정</h3>
    <p>서비스 기본 설정을 관리합니다.</p>
  </div>
);

const NotificationSettings = ({ service }) => (
  <div className="settings-section">
    <h3>알림 설정</h3>
    <p>알림 및 이메일 설정을 관리합니다.</p>
  </div>
);

const SecuritySettings = ({ service }) => (
  <div className="settings-section">
    <h3>보안 설정</h3>
    <p>서비스 보안 및 권한 설정을 관리합니다.</p>
  </div>
);

export default SettingsPage;
