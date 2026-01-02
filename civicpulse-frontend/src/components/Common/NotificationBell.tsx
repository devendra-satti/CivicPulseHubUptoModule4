import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

const NotificationBell: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Poll for notifications every 30 seconds
    useEffect(() => {
        if (!user?.id) return; // Check strictly for ID
        
        fetchNotifications(); // Initial fetch
        
        const interval = setInterval(fetchNotifications, 30000); 
        return () => clearInterval(interval);
        
    }, [user?.id]); // <--- CHANGED: Only re-run if the ID changes

    const fetchNotifications = async () => {
        try {
            if(!user?.id) return;
            const res = await api.get(`/notifications/${user.id}`);
            setNotifications(res.data);
            const unread = res.data.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (e) { console.error("Notify Error", e); }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/read/${id}`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    };

    const markAllRead = async () => {
        try {
            if(!user?.id) return;
            await api.put(`/notifications/read-all/${user.id}`);
            setNotifications(prev => prev.map(n => ({...n, isRead: true})));
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    // --- STYLES ---
    const styles = {
        container: { 
            position: 'relative' as const,
            display: 'inline-block' 
        },
        bellBtn: { 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            position: 'relative' as const, 
            fontSize: '20px',
            padding: '5px', // Add touch target area
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        badge: { 
            position: 'absolute' as const, 
            top: '0', 
            right: '0', 
            background: '#ef4444', 
            color: 'white', 
            borderRadius: '50%', 
            width: '16px', 
            height: '16px', 
            fontSize: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        },
        dropdown: { 
            position: 'absolute' as const, 
            right: '-10px', // Aligns right edge with bell, slight offset
            top: '100%', 
            marginTop: '10px',
            width: '280px', 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)', // Stronger shadow to pop out
            zIndex: 9999, // Ensure it's on top
            overflow: 'hidden' 
        },
        header: { 
            padding: '12px 16px', 
            borderBottom: '1px solid #f1f5f9', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: '#f8fafc' 
        },
        clearBtn: { fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' },
        list: { maxHeight: '300px', overflowY: 'auto' as const },
        item: (isRead: boolean, type: string) => ({ 
            padding: '12px 16px', 
            borderBottom: '1px solid #f1f5f9', 
            cursor: 'pointer', 
            backgroundColor: isRead ? 'white' : '#f0f9ff',
            borderLeft: `4px solid ${type === 'ALERT' ? '#ef4444' : type === 'SUCCESS' ? '#22c55e' : '#3b82f6'}`,
            transition: 'background-color 0.2s'
        }),
        time: { fontSize: '10px', color: '#94a3b8', marginTop: '4px' },
        msg: { fontSize: '13px', color: '#334155', fontWeight: 500, lineHeight: '1.4' }
    };

    return (
        <div style={styles.container} ref={dropdownRef}>
            <button style={styles.bellBtn} onClick={() => setIsOpen(!isOpen)}>
                🔔
                {unreadCount > 0 && <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {isOpen && (
                <div style={styles.dropdown}>
                    <div style={styles.header}>
                        <span style={{fontSize:'13px', fontWeight:700, color:'#0f172a'}}>Notifications</span>
                        <button style={styles.clearBtn} onClick={markAllRead}>Mark all read</button>
                    </div>
                    <div style={styles.list}>
                        {notifications.length === 0 ? (
                            <div style={{padding:'30px', textAlign:'center', color:'#94a3b8', fontSize:'13px'}}>
                                <div style={{fontSize:'20px', marginBottom:'5px'}}>🔕</div>
                                No new notifications
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} style={styles.item(n.isRead, n.type)} onClick={() => markAsRead(n.id)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.isRead ? 'white' : '#f0f9ff'}>
                                    <div style={styles.msg}>{n.message}</div>
                                    <div style={styles.time}>
                                        {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;