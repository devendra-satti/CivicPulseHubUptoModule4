// Location: src/components/Complaints/ComplaintForm.tsx
import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'; 
import { getCategories, submitComplaint } from '../../api/complaint';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

//Custom marker icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

//Overriding the default marker icon with custom icon
L.Marker.prototype.options.icon = DefaultIcon;

// 1. Define Props Interface
interface ComplaintFormProps {
    onSuccess?: () => void;
}

// programmatically move the map when latitude/longitude props change.
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.flyTo([lat, lng], 15); // smoothly pans/zooms to new coords
    }, [lat, lng, map]);  // runs whenever lat/lng change
    return null;  // no visible UI, just side effect
};

// for letting users drop a marker by clicking on the map.
//Without setPos, you wouldn’t see the marker.
// Without setPosition, the parent wouldn’t know where the user clicked.
const LocationMarker = ({ setPosition }: { setPosition: (lat: number, lng: number) => void }) => {
    const [position, setPos] = useState<L.LatLng | null>(null);
    useMapEvents({
        click(e) {
            setPos(e.latlng);
            setPosition(e.latlng.lat, e.latlng.lng);
        },
    });
    return position === null ? null : <Marker position={position} />;
};

// 2. Accept Props here
const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [locationName, setLocationName] = useState('');
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([17.3850, 78.4867]);
    const [categories, setCategories] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) { console.error("Failed to load categories"); }
        };
        fetchCats();
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    //For setting Current location(Use My Location)
    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setLat(latitude);
                setLng(longitude);
                setMapCenter([latitude, longitude]);
                setLocationName("My Current Location");
            }, () => alert("Unable to retrieve location"));
        }
    };

    //Searches location by name
    const handleSearchLocation = async () => {
        if (!locationName) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationName}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const newLat = parseFloat(data[0].lat);
                const newLng = parseFloat(data[0].lon);
                setLat(newLat);
                setLng(newLng);
                setMapCenter([newLat, newLng]);
            } else {
                alert("Location not found on map");
            }
        } catch (error) { console.error("Geocoding error", error); }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, action?: 'search') => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            if (action === 'search') {
                handleSearchLocation(); 
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const authStr = localStorage.getItem('auth');
        const authData = authStr ? JSON.parse(authStr) : null;
        const userId = authData?.id || authData?.user?.id;

        if (!userId) {
            setMessage("Error: User session invalid. Please login again.");
            setLoading(false);
            return;
        }

        if (lat === null || lng === null) {
            setMessage("Error: Please select a location on the map.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('location', locationName);
        formData.append('categoryId', categoryId);
        formData.append('userId', userId.toString());
        formData.append('latitude', lat!.toString());
        formData.append('longitude', lng!.toString());
        
        if (image) formData.append('image', image);

        try {
            await submitComplaint(formData);
            setMessage('Success! Complaint submitted successfully.');
            
            // 3. Trigger Tab Switch after short delay
            if (onSuccess) {
                setTimeout(() => onSuccess(), 1500);
            }

            // Reset
            setTitle(''); setDescription(''); setLocationName('');
            setLat(null); setLng(null); setImage(null); setPreviewUrl(null); setCategoryId('');
        } catch (error) {
            console.error(error);
            setMessage('Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- REFINED UI STYLES ---
    const styles = {
        container: { maxWidth: '900px', margin: '0 auto', padding: '30px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontFamily: "'Inter', sans-serif" },
        header: { borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '30px', color: '#1e293b', fontSize: '20px', fontWeight: 700 },
        formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' },
        column: { display: 'flex', flexDirection: 'column' as const, gap: '24px' },
        inputGroup: { display: 'flex', flexDirection: 'column' as const },
        
        // Better Label Typography
        label: { marginBottom: '8px', fontWeight: 600, fontSize: '13px', color: '#475569', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
        
        // Better Input Styling
        input: { 
            padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', width: '100%', 
            boxSizing: 'border-box' as const, outline: 'none', backgroundColor: '#f8fafc', color: '#334155',
            transition: 'border-color 0.2s'
        },
        
        mapContainer: { height: '280px', width: '100%', border: '2px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' },
        
        button: { 
            width: '100%', padding: '15px', backgroundColor: '#00bfff', color: 'white', border: 'none', 
            borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 700, marginTop: '30px',
            boxShadow: '0 4px 12px rgba(0, 191, 255, 0.3)', transition: 'background 0.2s'
        },
        secondaryBtn: { padding: '8px 14px', backgroundColor: '#e0f7fa', color: '#006064', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, marginLeft: '10px' },
        
        previewImg: { marginTop: '15px', height: '120px', width: '120px', objectFit: 'cover' as const, borderRadius: '8px', border: '2px solid #e2e8f0' }
    };

    return (
        <div style={styles.container}>
            {message && <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textAlign: 'center', backgroundColor: message.includes('Success') ? '#dcfce7' : '#fee2e2', color: message.includes('Success') ? '#166534' : '#991b1b' }}>{message}</div>}

            <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                    <div style={styles.column}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Category</label>
                            <select style={styles.input} value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                                <option value="">Select Category</option>
                                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Title</label>
                            <input type="text" style={styles.input} placeholder="Brief summary of the issue..." value={title} onChange={e => setTitle(e.target.value)} onKeyDown={(e) => handleKeyDown(e)} required />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Description</label>
                            <textarea rows={5} style={{...styles.input, resize: 'vertical'}} placeholder="Provide detailed information..." value={description} onChange={e => setDescription(e.target.value)} required />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Location Address</label>
                            
                            {/* 1. THE CONTAINER: Draws the border and rounded corners */}
                            <div style={{ 
                                display: 'flex', 
                                height: '45px',                // Fixed height for stability
                                border: '1px solid #cbd5e1',   // The ONLY border
                                borderRadius: '8px', 
                                overflow: 'hidden',            // Clips corners
                                backgroundColor: '#f8fafc',
                                alignItems: 'center'
                            }}>
                                
                                {/* 2. THE INPUT: No border, fills space */}
                                <input 
                                    type="text" 
                                    style={{ 
                                        border: 'none',        // REMOVE border
                                        outline: 'none',       // REMOVE focus ring
                                        boxShadow: 'none',     // REMOVE shadow
                                        background: 'transparent',
                                        height: '100%',        // Fill height
                                        flex: 1,               // Fill width
                                        padding: '0 15px',     // Text padding
                                        fontSize: '14px',
                                        color: '#334155'
                                    }} 
                                    placeholder="e.g. Tadepalligudem" 
                                    value={locationName} 
                                    onChange={e => setLocationName(e.target.value)} 
                                    onKeyDown={(e) => handleKeyDown(e, 'search')} 
                                    required 
                                />

                                {/* 3. THE BUTTON: No border, square edges */}
                                <button 
                                    type="button" 
                                    onClick={handleSearchLocation} 
                                    style={{ 
                                        border: 'none',        // REMOVE border
                                        height: '100%',        // Fill height
                                        padding: '0 25px',     // Width of button
                                        backgroundColor: '#0ea5e9', 
                                        color: 'white',
                                        fontSize: '14px', 
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        borderRadius: 0        // Square corners
                                    }}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={styles.column}>
                        <div style={styles.inputGroup}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={styles.label}>Pin Location <span style={{color: '#ef4444'}}>*</span></label>
                                <button type="button" onClick={handleCurrentLocation} style={{...styles.secondaryBtn, margin: 0}}>📍 Use My Location</button>
                            </div>
                            
                            <div style={styles.mapContainer}>
                                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                    <LocationMarker setPosition={(lat, lng) => { setLat(lat); setLng(lng); }} />
                                    <RecenterMap lat={lat!} lng={lng!} />
                                </MapContainer>
                            </div>
                            {lat ? (
                                <small style={{color: '#059669', marginTop: '8px', fontWeight: 600, display:'block'}}>✓ Location Pinned: {lat.toFixed(4)}, {lng?.toFixed(4)}</small>
                            ) : (
                                <small style={{color: '#ef4444', marginTop: '8px', display:'block'}}>Please click on the map to pin exact location</small>
                            )}
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Upload Evidence</label>
                            <input type="file" onChange={handleFileChange} accept="image/*" style={{...styles.input, padding: '8px'}} />
                            {previewUrl && <img src={previewUrl} alt="Preview" style={styles.previewImg} />}
                        </div>
                    </div>
                </div>

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Grievance'}
                </button>
            </form>
        </div>
    );
};

export default ComplaintForm;