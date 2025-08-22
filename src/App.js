import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Layout/Header";
import LoginPage from "./pages/LoginPage";
import ServiceSelectPage from "./pages/ServiceSelectPage";
import DashboardPage from "./pages/DashboardPage";
import NoticePage from "./pages/NoticePage";
import ApplicationsPage from "./pages/ApplicationsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const [user, setUser] = useState(null);
  const [currentService, setCurrentService] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleServiceSelect = (serviceName) => {
    setCurrentService(serviceName);
  };

  return (
    <Router>
      <div className="App">
        {user && currentService && (
          <Header user={user} currentService={currentService} />
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
              path="/settings/*"
              element={
                !user || !currentService ? (
                  <Navigate to="/login" replace />
                ) : (
                  <SettingsPage service={currentService} />
                )
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
