//This File not required after Seperating LoginPage.tsx,SignupPage.tsx

// // import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../auth/AuthContext'; 
// import MarketingPanel from '../components/Auth/MarketingPanel';
// import AuthForm from '../components/Auth/AuthForm';
// import './MainPage.css'; // Keep the CSS here as it styles the layout containers

// const MainPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth(); 

//   // Auto-redirect if already logged in
//   useEffect(() => {
//     if (user) {
//       if (user.role === 'ADMIN') {
//           navigate("/admin-dashboard");
//       } else if (user.role === 'OFFICER') {
//           navigate("/officer-dashboard");
//       } else {
//           navigate("/dashboard"); // Citizen
//       }
//     }
//   }, [user, navigate]);

//   return (
//     <div className="auth-container">
//       {/* Static Marketing Left Panel */}
//       <MarketingPanel />

//       {/* Dynamic Form Right Panel */}
//       <div className="right-panel">
//         <AuthForm />
//       </div>
//     </div>
//   );
// };

// export default MainPage;