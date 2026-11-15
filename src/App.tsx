import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SymptomCheckerPage } from './pages/SymptomCheckerPage';
import { FindHealthcarePage } from './pages/FindHealthcarePage';
import { FacilityDetailsPage } from './pages/FacilityDetailsPage';
import { CompareFacilitiesPage } from './pages/CompareFacilitiesPage';
import { EmergencyHelpPage } from './pages/EmergencyHelpPage';
import { HealthResourcesPage } from './pages/HealthResourcesPage';
import { AuthPage } from './pages/AuthPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { HealthAssistantPage } from './pages/HealthAssistantPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
            <Route path="/find-healthcare" element={<FindHealthcarePage />} />
            <Route path="/facilities/:id" element={<FacilityDetailsPage />} />
            <Route path="/compare" element={<CompareFacilitiesPage />} />
            <Route path="/emergency" element={<EmergencyHelpPage />} />
            <Route path="/resources" element={<HealthResourcesPage />} />
            <Route path="/health-assistant" element={<HealthAssistantPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
