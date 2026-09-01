import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Layout/Header";
import SampleChecklistPage from "./pages/sample/SampleChecklistPage";
import SampleDashboardPage from "./pages/sample/SampleDashboardPage";
import ChecklistListPage from "./pages/sample/ChecklistListPage";
import ProcedureGuidePage from "./pages/sample/ProcedureGuidePage";
import PaymentStatsPage from "./pages/sample/PaymentStatsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import SettingsPage from "./pages/SettingsPage";

const DEMO_USER    = { name: "데모 상담사", email: "demo@talkgate.kr" };
const DEMO_SERVICE = "TalkGate Demo";

function AppContent() {
  const location = useLocation();
  const isChecklistRoute = location.pathname.startsWith("/checklist");
  const isStatisticsRoute = location.pathname.startsWith("/statistics");
  const isApplicationsRoute = location.pathname.startsWith("/applications");
  const isSettingsRoute = location.pathname.startsWith("/settings");
  const showHeader =
    isChecklistRoute ||
    isStatisticsRoute ||
    isApplicationsRoute ||
    isSettingsRoute;

  return (
    <div className="App">
      {showHeader && (
        <Header
          user={DEMO_USER}
          currentService={DEMO_SERVICE}
          onLogout={() => {}}
        />
      )}

      <main>
        <Routes>
          <Route path="/checklist"                  element={<ChecklistListPage />} />
          <Route path="/checklist/form"             element={<SampleChecklistPage />} />
          <Route path="/checklist/result"           element={<SampleDashboardPage />} />
          <Route path="/checklist/result-external"  element={<SampleDashboardPage />} />
          <Route path="/checklist/procedure"        element={<ProcedureGuidePage />} />
          <Route path="/statistics"                 element={<PaymentStatsPage />} />
          <Route path="/applications"               element={<ApplicationsPage />} />
          <Route
            path="/settings/*"
            element={<SettingsPage service={DEMO_SERVICE} user={DEMO_USER} />}
          />
          {/* 그 외 모든 경로 → 목록으로 */}
          <Route path="*" element={<Navigate to="/checklist" replace />} />
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
