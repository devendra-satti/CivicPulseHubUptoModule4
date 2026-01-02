// Location: src/components/Complaints/ComplaintList.tsx
import React, { useEffect, useState } from 'react';
import { getUserComplaints } from '../../api/complaint';
import { api } from '../../api/client'; 

const ComplaintList: React.FC = () => {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Rating Form State
    const [ratingId, setRatingId] = useState<number | null>(null);
    const [stars, setStars] = useState(5);
    const [feedbackText, setFeedbackText] = useState("");

    useEffect(() => { fetchComplaints(); }, []);

    const fetchComplaints = async () => {
        const authStr = localStorage.getItem('auth');
        const authData = authStr ? JSON.parse(authStr) : null;
        if (authData?.id || authData?.user?.id) {
            try {
                const uid = typeof authData.id === 'string' ? parseInt(authData.id) : 
                           (authData.user?.id ? (typeof authData.user.id === 'string' ? parseInt(authData.user.id) : authData.user.id) : null);
                
                if (uid) {
                    const data = await getUserComplaints(uid);
                    setComplaints(data.sort((a: any, b: any) => b.id - a.id));
                }
            } catch (error) { console.error(error); }
        }
        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Just now";
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleReopen = async (id: number) => {
        if (!window.confirm("Send this back to the officer?")) return;
        try {
            await api.put(`/complaints/reopen/${id}`);
            alert("Complaint Reopened!");
            fetchComplaints();
        } catch (error) { alert("Error reopening complaint"); }
    };

    const submitFeedback = async (id: number) => {
        try {
            await api.put(`/complaints/feedback/${id}?rating=${stars}&feedback=${encodeURIComponent(feedbackText)}`);
            alert("Thanks for your rating!");
            
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, citizen_rating: stars, citizen_feedback: feedbackText } : c));
            setRatingId(null);
        } catch (error) { alert("Error submitting feedback"); }
    };

    const filteredComplaints = complaints.filter(c => {
        if (statusFilter === 'ALL') return true;
        return c.status === statusFilter;
    });

    const styles = {
        container: { maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
        toolbar: { display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' },
        filterSelect: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#334155', fontSize: '14px', fontWeight: 600, cursor: 'pointer', outline: 'none' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
        card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, border: '1px solid #f1f5f9' },
        
        // Image Section
        imgContainer: { display: 'flex', borderBottom: '1px solid #f1f5f9', height: '160px' },
        imageHalf: { flex: 1, objectFit: 'cover' as const, cursor: 'pointer' },
        noImage: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8', fontSize: '12px', textAlign: 'center' as const, padding: '10px' },
        
        content: { padding: '20px', flex: 1 },
        statusBadge: (status: string) => ({
            display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, marginBottom: '10px',
            backgroundColor: status === 'RESOLVED' ? '#dcfce7' : status === 'IN_PROGRESS' ? '#fef9c3' : status === 'REOPENED' ? '#fee2e2' : '#f1f5f9',
            color: status === 'IN_PROGRESS' ? '#854d0e' : status === 'RESOLVED' ? '#166534' : status === 'REOPENED' ? '#991b1b' : '#64748b',
        }),
        title: { margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: '#334155' },
        desc: { fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '10px' },
        
        // --- NEW SECTIONS ---
        adminBox: { backgroundColor: '#fff7ed', borderLeft: '4px solid #f97316', padding: '10px', borderRadius: '4px', fontSize: '12px', color: '#7c2d12', marginBottom: '10px' },
        materialsBox: { fontSize: '12px', color: '#475569', padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '6px', marginBottom: '10px' },
        
        metaRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' },
        timeInfo: { fontSize: '11px', color: '#0ea5e9', fontWeight: 600, marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' },
        actionArea: { marginTop: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
        btn: (color: string) => ({ padding: '8px 14px', backgroundColor: color, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginRight: '8px', fontWeight: 600 }),
        input: { padding: '8px', width: '100%', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' },
        emptyState: { textAlign: 'center' as const, padding: '40px', color: '#64748b', fontStyle: 'italic', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }
    };

    if (loading) return <p style={{textAlign: 'center', color: '#64748b'}}>Loading history...</p>;

    return (
        <div style={styles.container}>
            <div style={styles.toolbar}>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
                    <option value="ALL">Show All Statuses</option>
                    <option value="PENDING">🕒 Pending</option>
                    <option value="IN_PROGRESS">⚡ In Progress</option>
                    <option value="RESOLVED">✅ Resolved</option>
                    <option value="REOPENED">🔄 Reopened</option>
                    <option value="REJECTED">❌ Rejected</option>
                </select>
            </div>

            {filteredComplaints.length === 0 ? (
                <div style={styles.emptyState}>No complaints found with status "{statusFilter}".</div>
            ) : (
                <div style={styles.grid}>
                    {filteredComplaints.map((c) => (
                        <div key={c.id} style={styles.card}>
                            {/* --- UPDATED IMAGE SECTION: Show Before (Left) & After (Right) --- */}
                            <div style={styles.imgContainer}>
                                {c.imageUrl ? (
                                    <img src={`http://localhost:8080/uploads/${c.imageUrl}`} alt="Problem" style={styles.imageHalf} title="Your Upload" />
                                ) : <div style={styles.noImage}>No Image</div>}
                                
                                {c.resolution_proof_url ? (
                                    <a href={`http://localhost:8080/uploads/${c.resolution_proof_url}`} target="_blank" rel="noreferrer" style={{flex:1, display:'flex'}}>
                                        <img src={`http://localhost:8080/uploads/${c.resolution_proof_url}`} alt="Proof" style={{...styles.imageHalf, borderLeft:'2px solid white'}} title="Officer's Proof" />
                                    </a>
                                ) : (c.status === 'RESOLVED' && <div style={styles.noImage}>No Proof</div>)}
                            </div>
                            
                            <div style={styles.content}>
                                <span style={styles.statusBadge(c.status)}>{c.status.replace('_', ' ')}</span>
                                <h3 style={styles.title}>{c.title}</h3>
                                <p style={styles.desc}>{c.description}</p>
                                
                                {/* --- NEW: ADMIN COMMENTS SECTION --- */}
                                {c.admin_comment && (
                                    <div style={styles.adminBox}>
                                        <strong>📢 Admin Note:</strong> {c.admin_comment}
                                    </div>
                                )}

                                {/* --- NEW: MATERIALS SECTION --- */}
                                {c.materialsUsed && (
                                    <div style={styles.materialsBox}>
                                        <strong>🏗️ Materials:</strong> {c.materialsUsed}
                                    </div>
                                )}

                                <div style={styles.metaRow}><span>📍</span> {c.location}</div>
                                <div style={styles.timeInfo}>🕒 Updated: {formatDate(c.updatedAt || c.createdAt)}</div>

                                {/* --- ACTION AREA (Rate or Reopen) --- */}
                                {c.status === 'RESOLVED' && (
                                    <div style={styles.actionArea}>
                                        {(c.citizen_rating || c.rating) ? (
                                            <div style={{fontSize:'13px', color:'#166534', fontWeight:'700'}}>
                                                ✓ Rated: <span style={{color:'#eab308'}}>{"⭐".repeat(c.citizen_rating || c.rating)}</span>
                                            </div>
                                        ) : ratingId === c.id ? (
                                            <div>
                                                <div style={{marginBottom:'8px', fontWeight:'700', fontSize:'13px', color:'#334155'}}>Rate Resolution:</div>
                                                <select style={styles.input} value={stars} onChange={e => setStars(parseInt(e.target.value))}>
                                                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                                                    <option value="4">⭐⭐⭐⭐ Good</option>
                                                    <option value="3">⭐⭐⭐ Average</option>
                                                    <option value="2">⭐⭐ Poor</option>
                                                    <option value="1">⭐ Terrible</option>
                                                </select>
                                                <textarea placeholder="Any comments?" style={{...styles.input, height:'60px', fontFamily:'inherit'}} value={feedbackText} onChange={e => setFeedbackText(e.target.value)}/>
                                                <div style={{display:'flex'}}>
                                                    <button style={styles.btn('#22c55e')} onClick={() => submitFeedback(c.id)}>Submit</button>
                                                    <button style={{...styles.btn('transparent'), color:'#64748b', border:'1px solid #cbd5e1'}} onClick={() => setRatingId(null)}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <p style={{fontSize:'13px', fontWeight:'600', marginBottom:'10px', color:'#334155'}}>Is the issue resolved?</p>
                                                <div style={{display:'flex'}}>
                                                    <button style={styles.btn('#22c55e')} onClick={() => { setRatingId(c.id); setStars(5); setFeedbackText(""); }}>✅ Yes, Rate</button>
                                                    <button style={{...styles.btn('#fff'), color:'#ef4444', border:'1px solid #fecaca'}} onClick={() => handleReopen(c.id)}>Reopen</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComplaintList;