import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Layout/Header";
import LoginPage from "./pages/LoginPage";
import ServiceSelectPage from "./pages/ServiceSelectPage";
import CreateServicePage from "./pages/CreateServicePage";
import DashboardPage from "./pages/DashboardPage";
import ConsultationPage from "./pages/ConsultationPage";
import NoticePage from "./pages/NoticePage";
import NotificationPage from "./pages/NotificationPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import StatisticsPage from "./pages/StatisticsPage";
import AttendancePage from "./pages/AttendancePage";
import SettingsPage from "./pages/SettingsPage";
import PersonalSettingsPage from "./pages/PersonalSettingsPage";
import InstagramCallbackPage from "./pages/InstagramCallbackPage";
import SampleChecklistPage from "./pages/sample/SampleChecklistPage";
import SampleDashboardPage from "./pages/sample/SampleDashboardPage";
import ChecklistListPage from "./pages/sample/ChecklistListPage";

/* 와이어프레임용 더미 데이터 — 미로그인 시 checklist 경로에서 사용 */
const DEMO_USER    = { name: "데모 상담사", email: "demo@talkgate.kr" };
const DEMO_SERVICE = "TalkGate Demo";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentService, setCurrentService] = useState(() => {
    const savedService = localStorage.getItem("currentService");
    return savedService ? JSON.parse(savedService) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleServiceSelect = (serviceName) => {
    setCurrentService(serviceName);
    localStorage.setItem("currentService", JSON.stringify(serviceName));
  };

  const handleServiceCreate = (newService) => {
    // 새로 생성된 서비스를 현재 서비스로 설정
    setCurrentService(newService.name);
    localStorage.setItem("currentService", JSON.stringify(newService.name));
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentService(null);
    localStorage.removeItem("user");
    localStorage.removeItem("currentService");
    navigate("/login");
  };

  const isChecklistRoute = location.pathname.startsWith("/checklist");
  const headerUser    = user    ?? (isChecklistRoute ? DEMO_USER    : null);
  const headerService = currentService ?? (isChecklistRoute ? DEMO_SERVICE : null);

  return (
    <div className="App">
      {headerUser && headerService && (
        <Header
          user={headerUser}
          currentService={headerService}
          onLogout={handleLogout}
        />
      )}

      <main>
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/services" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/services"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : currentService ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ServiceSelectPage
                  onServiceSelect={handleServiceSelect}
                  onServiceCreate={handleServiceCreate}
                />
              )
            }
          />
          <Route
            path="/create-service"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <CreateServicePage onServiceCreate={handleServiceCreate} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              !user || !currentService ? (
                <Navigate to="/login" replace />
              ) : (
                <DashboardPage user={user} service={currentService} />
              )
            }
          />
          <Route
            path="/consultation"
            element={
              !user || !currentService ? (
                <Navigate to="/login" replace />
              ) : (
                <ConsultationPage user={user} service={currentService} />
              )
            }
          />
          <Route
            path="/notice"
            element={
              !user || !currentService ? (
                <Navigate to="/login" replace />
              ) : (
                <NoticePage />
              )
            }
          />
          <Route
            path="/notifications"
            element={
              !user || !currentService ? (
                <Navigate to="/login" replace />
              ) : (
                <NotificationPage user={user} />
              )
            }
          />
          <Route
            path="/applications"
            element={
              !user || !currentService ? (
                <Navigate to="/login" replace />
              ) : (
                <ApplicationsPage />
              )
            }
          />
          <Route
            path="/statistics"
            element={
              !user || !currentService ? (
                <Navigate to="/login" replace />
              ) : (
                <StatisticsPage user={user} service={currentService} />
              )
            }
          />
          <Route
            path="/attendance"
            element={
              !user || !currentService ? (
                <Navigate to="/login" replace />
              ) : (
                <AttendancePage user={user} service={currentService} />
              )
            }
          />
          <Route
            path="/settings/*"
            element={
              !user || !currentService ? (
                <Navigate to="/login" replace />
              ) : (
                <SettingsPage service={currentService} user={user} />
              )
            }
          />
          <Route
            path="/personal-settings/*"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <PersonalSettingsPage user={user} />
              )
            }
          />
          <Route
            path="/instagram/callback"
            element={<InstagramCallbackPage />}
          />
          <Route path="/checklist" element={<ChecklistListPage />} />
          <Route path="/checklist/form" element={<SampleChecklistPage />} />
          <Route path="/checklist/result" element={<SampleDashboardPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
