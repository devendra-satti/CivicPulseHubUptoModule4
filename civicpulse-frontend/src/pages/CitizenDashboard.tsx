// Location: src/pages/CitizenDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from '../components/Complaints/ComplaintForm';
import ComplaintList from '../components/Complaints/ComplaintList';
import { getUserComplaints } from '../api/complaint'; // Ensure this import exists
import NotificationBell from '../components/Common/NotificationBell'; // Adjust path

const CitizenDashboard: React.FC = () => {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'FORM' | 'HISTORY'>('DASHBOARD');
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);

  // --- FETCH STATS ---
  useEffect(() => {
    const fetchStats = async () => {
        if (!user?.id) return;
        try {
            const data = await getUserComplaints(parseInt(user.id));
            
            const total = data.length;
            const resolved = data.filter((c: any) => c.status === 'RESOLVED').length;
            const pending = total - resolved;
            
            // Calculate Rating (Only for complaints that have a rating)
            const ratedComplaints = data.filter((c: any) => c.citizen_rating && c.citizen_rating > 0);
            const totalStars = ratedComplaints.reduce((acc: number, curr: any) => acc + curr.citizen_rating, 0);
            const avgRating = ratedComplaints.length ? (totalStars / ratedComplaints.length).toFixed(1) : "0.0";

            setStats({ total, pending, resolved, avgRating: parseFloat(avgRating as string) });
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    fetchStats();
  }, [user]);

  // Helper to get initials
  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'C';

  // --- STYLES ---
  const styles = {
    container: { display: 'flex', height: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: '#f0f9ff' },
    
    // SIDEBAR
    sidebar: {
      width: '280px',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '30px 20px',
      boxShadow: '4px 0 20px rgba(0, 191, 255, 0.08)',
      zIndex: 10,
      borderRight: '1px solid #e0f2fe'
    },
    brand: { 
            fontSize: '22px', 
            fontWeight: 800, 
            color: '#0288d1', 
            marginBottom: '35px', 
            paddingLeft: '10px',
            // --- FLEXBOX ALIGNMENT FIX ---
            display: 'flex', 
            justifyContent: 'space-between', // Pushes items to edges
            alignItems: 'center'    ,         // Vertically centers them
            width: '100%'
    },
    
    profileCard: {
      backgroundColor: '#f8fafc',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '30px',
      border: '1px solid #e2e8f0',
      textAlign: 'center' as const
    },
    avatar: {
        width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e0f7fa', color: '#00bcd4',
        fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 15px auto', border: '2px solid #b2ebf2'
    },
    userName: { fontSize: '16px', fontWeight: 700, color: '#334155', margin: '0 0 5px 0' },
    userEmail: { fontSize: '12px', color: '#64748b', marginBottom: '10px', fontWeight: 500 },
    wardBadge: { display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0288d1', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' },

    navGroup: { display: 'flex', flexDirection: 'column' as const, gap: '8px', flex: 1 },
    navItem: (isActive: boolean) => ({
      padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s ease',
      backgroundColor: isActive ? '#00bfff' : 'transparent',
      color: isActive ? 'white' : '#64748b',
      boxShadow: isActive ? '0 4px 12px rgba(0, 191, 255, 0.3)' : 'none'
    }),

    logoutBtn: {
      padding: '12px', marginTop: 'auto', backgroundColor: '#fff1f2', color: '#e11d48',
      border: '1px solid #ffe4e6', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px'
    },

    // MAIN CONTENT
    main: { flex: 1, padding: '40px', overflowY: 'auto' as const, backgroundColor: '#f0f9ff' },
    pageHeader: { maxWidth: '1000px', margin: '0 auto 30px auto' },
    pageTitle: { fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' },
    pageSubtitle: { fontSize: '14px', color: '#64748b' },

    // DASHBOARD WIDGETS
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' },
    statCard: { backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' },
    statLabel: { fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
    statValue: (color: string) => ({ fontSize: '32px', fontWeight: 800, color: color, lineHeight: 1 }),

    // CHART SECTION
    chartsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' },
    chartCard: { backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
    chartTitle: { fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '20px', alignSelf: 'flex-start' },
  };

  // --- SVG PIE CHART COMPONENT ---
  const DonutChart = ({ pending, resolved }: { pending: number, resolved: number }) => {
    const total = pending + resolved;
    if (total === 0) return <div style={{height: '150px', display: 'flex', alignItems: 'center', color: '#cbd5e1'}}>No Data</div>;
    
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const resolvedPercent = (resolved / total) * 100;
    const strokeDashoffset = circumference - (resolvedPercent / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Circle (Pending Color) */}
                <circle cx="80" cy="80" r={radius} stroke="#fee2e2" strokeWidth="20" fill="transparent" />
                {/* Foreground Circle (Resolved Color) */}
                <circle cx="80" cy="80" r={radius} stroke="#22c55e" strokeWidth="20" fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#334155' }}>{total}</div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>TOTAL</div>
            </div>
        </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.brand}> <span style={{fontSize:'24px'}}>🏛️</span> CivicPulse  <NotificationBell /></div>

        <div style={styles.profileCard}>
          <div style={styles.avatar}>{getInitials(user?.name || '')}</div>
          <div style={styles.userName}>{user?.name || 'Citizen'}</div>
          <div style={styles.userEmail}>{user?.email || 'No Email'}</div> 
          <div style={styles.wardBadge}>📍 Ward {user?.wardNumber || 'N/A'}</div>
        </div>

        <div style={styles.navGroup}>
          <div style={styles.navItem(activeTab === 'DASHBOARD')} onClick={() => setActiveTab('DASHBOARD')}>
            <span>📊</span> Dashboard
          </div>
          <div style={styles.navItem(activeTab === 'FORM')} onClick={() => setActiveTab('FORM')}>
            <span>📝</span> Lodge Complaint
          </div>
          <div style={styles.navItem(activeTab === 'HISTORY')} onClick={() => setActiveTab('HISTORY')}>
            <span>📂</span> My History
          </div>
        </div>

        <button style={styles.logoutBtn} onClick={() => { signout(); navigate("/"); }}>Sign Out</button>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        
        {/* --- 1. DASHBOARD VIEW --- */}
        {activeTab === 'DASHBOARD' && (
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Dashboard Overview</h1>
            <p style={styles.pageSubtitle}>Welcome back! Here is a summary of your civic engagement.</p>
            
            {loading ? <p>Loading stats...</p> : (
                <>
                    {/* TOP STATS ROW */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statLabel}>Total Complaints</div>
                            <div style={styles.statValue('#0f172a')}>{stats.total}</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statLabel}>Active / Pending</div>
                            <div style={styles.statValue('#ef4444')}>{stats.pending}</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statLabel}>Resolved</div>
                            <div style={styles.statValue('#22c55e')}>{stats.resolved}</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statLabel}>Satisfaction</div>
                            <div style={styles.statValue('#eab308')}>{stats.avgRating} <span style={{fontSize:'16px'}}>★</span></div>
                        </div>
                    </div>

                    {/* CHARTS ROW */}
                    <div style={styles.chartsContainer}>
                        {/* CHART 1: STATUS */}
                        <div style={styles.chartCard}>
                            <div style={styles.chartTitle}>Complaint Status</div>
                            <DonutChart pending={stats.pending} resolved={stats.resolved} />
                            <div style={{display:'flex', gap:'20px', marginTop:'20px'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'#64748b'}}>
                                    <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#22c55e'}}></div> Resolved
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'#64748b'}}>
                                    <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#fee2e2'}}></div> Pending
                                </div>
                            </div>
                        </div>

                        {/* CHART 2: SATISFACTION */}
                        <div style={styles.chartCard}>
                            <div style={styles.chartTitle}>Avg. Satisfaction Rate</div>
                            <div style={{fontSize:'48px', fontWeight:800, color:'#eab308', marginBottom:'10px'}}>
                                {stats.avgRating}
                            </div>
                            <div style={{color:'#cbd5e1', fontSize:'24px', letterSpacing:'5px'}}>
                                {[1,2,3,4,5].map(star => (
                                    <span key={star} style={{color: star <= Math.round(stats.avgRating) ? '#eab308' : '#e2e8f0'}}>★</span>
                                ))}
                            </div>
                            <p style={{fontSize:'12px', color:'#64748b', marginTop:'15px'}}>Based on your feedback</p>
                        </div>
                    </div>
                </>
            )}
          </div>
        )}

        {/* --- 2. FORM VIEW --- */}
        {activeTab === 'FORM' && (
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>New Grievance</h1>
            <p style={styles.pageSubtitle}>Fill out the form below to report a civic issue.</p>
            <ComplaintForm onSuccess={() => setActiveTab('HISTORY')} /> 
          </div>
        )}

        {/* --- 3. HISTORY VIEW --- */}
        {activeTab === 'HISTORY' && (
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Complaint History</h1>
            <p style={styles.pageSubtitle}>Track the status and resolution of your reports.</p>
            <ComplaintList />
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;