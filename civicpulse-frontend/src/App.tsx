import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate
// import MainPage from './pages/MainPage'; // No longer needed
import LoginPage from './pages/LoginPage';   // New Import
import SignupPage from './pages/SignUpPage'; // New Import

import AdminDashboard from './pages/AdminDashBoard';
import OfficerDashboard from './pages/OfficerDashBoard';
import CitizenDashboard from './pages/CitizenDashboard';
import ProtectedRoute from './auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. AUTH ROUTES */}
        {/* Redirect root "/" to "/login" automatically */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* 2. ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* 3. OFFICER ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['OFFICER']} />}>
            <Route path="/officer-dashboard" element={<OfficerDashboard />} />
        </Route>

        {/* 4. CITIZEN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} />}>
            <Route path="/dashboard" element={<CitizenDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;