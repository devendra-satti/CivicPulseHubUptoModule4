//Created on 18/12
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'; 
import MarketingPanel from '../components/Auth/MarketingPanel';
import AuthForm from '../components/Auth/AuthForm';
import './MainPage.css'; 

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
          navigate("/admin-dashboard");
      } else if (user.role === 'OFFICER') {
          navigate("/officer-dashboard");
      } else {
          navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="auth-container">
      <MarketingPanel />
      <div className="right-panel">
        <AuthForm view="signup" />
      </div>
    </div>
  );
};

export default SignupPage;