import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Header from "./components/Layout/Header";
import LoginPage from "./pages/LoginPage";
import ServiceSelectPage from "./pages/ServiceSelectPage";
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

function AppContent() {
  const navigate = useNavigate();
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

  const handleLogout = () => {
    setUser(null);
    setCurrentService(null);
    localStorage.removeItem("user");
    localStorage.removeItem("currentService");
    navigate("/login");
  };

  return (
    <div className="App">
      {user && currentService && (
        <Header
          user={user}
          currentService={currentService}
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
                <ServiceSelectPage onServiceSelect={handleServiceSelect} />
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
