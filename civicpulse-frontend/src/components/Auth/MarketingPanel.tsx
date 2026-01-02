import React from 'react';

const MarketingPanel: React.FC = () => {
  return (
    <div className="left-panel">
      <div className="brand-logo">CivicPulse Hub</div>
      <div className="content-wrapper">
        <h1 className="welcome-title">Welcome Back!</h1>
        <p className="welcome-subtitle">
          A unified smart city platform empowering citizens to share feedback, 
          track issues, and build a better tomorrow.
        </p>
        <button className="cta-btn">Get Started Now</button>

        <div className="cards-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
              <path d="m3 11 18-5v12L3 14v-3z"/>
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
            </svg>
            <h3>Submit Feedback</h3>
            <p>Easily report civic issues like potholes, streetlights, or sanitation directly to local authorities.</p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
              <path d="M10 6h10"/><path d="M10 12h10"/><path d="M10 18h10"/>
              <path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>
            </svg>
            <h3>Track Status</h3>
            <p>Stay updated with real-time tracking. Know exactly when your reported issue is viewed and resolved.</p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h3>Community Power</h3>
            <p>Join forces with other citizens. Upvote critical issues to bring them to immediate attention.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPanel;