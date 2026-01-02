//Created on 18/12
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'; 
import MarketingPanel from '../components/Auth/MarketingPanel';
import AuthForm from '../components/Auth/AuthForm';
import './MainPage.css'; // Re-use your existing CSS file

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  // 1. Logic: Auto-redirect if already logged in (Copied from MainPage)
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
          navigate("/admin-dashboard");
      } else if (user.role === 'OFFICER') {
          navigate("/officer-dashboard");
      } else {
          navigate("/dashboard"); // Citizen
      }
    }
  }, [user, navigate]);

  return (
    // 2. Layout: Use the exact class names from MainPage to keep styling
    <div className="auth-container">
      <MarketingPanel />
      <div className="right-panel">
        {/* 3. Component: Pass the specific view prop */}
        <AuthForm view="login" />
      </div>
    </div>
  );
};

export default LoginPage;