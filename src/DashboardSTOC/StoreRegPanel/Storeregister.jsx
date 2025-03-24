import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StoreregPanel.module.css';
import AdminVerify from '../../Others/AdminPassword.jsx';

function AccountRegistrationPanel({ closePanel }) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        store_name: '',
        store_location: '',
        store_contact: '',
    });

    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);
    const [status, setStatus] = useState(null); 

    const isFormComplete = Object.values(formData).every(value => value.trim() !== "");

    const locations = [
        'Putatan',
        'Tunasan',
        'Ayala-Alabang',
        'Alabang',
        'Poblacion',
        'Cupang',
        'Sucat',
        'Bayanan',
        'Buli',
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    const registerStore = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/register-store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
                setTimeout(() => navigate('/DashboardStore'), 2000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    const handleVerifyClick = () => {
        if (!isFormComplete) {
            alert("Please fill in all required fields before verifying.");
            return; 
        }
        setIsAdminPanelOpen(true);
    };

    return isVisible ? (
        <div className={styles.floatingpanel}>
            <button className={styles.closeButton} onClick={handleClose}>
                &times;
            </button>
            {!isAdminPanelOpen && (
                <>
                    <h2 className={styles.h2}>Account Registration</h2>
                    <form>
                        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                        <input type="text" name="store_name" placeholder="Store Name" value={formData.store_name} onChange={handleChange} required />
                        <select name="store_location" value={formData.store_location} onChange={handleChange} required>
                            <option value="" disabled>Select Barangay</option>
                            {locations.map((location) => (
                                <option key={location} value={location}>
                                    {location}
                                </option>
                            ))}
                        </select>
                        <input type="text" name="store_contact" placeholder="Store Contact" value={formData.store_contact} onChange={handleChange} required />
                        
                        <div>
                            <button 
                            className={styles.buttons} 
                            type="button" 
                            onClick={() => {
                                handleVerifyClick(); 
                            }}
                        >
                            Verify
                           </button>
                        </div>
                    </form>
                </>
            )}

            {isAdminPanelOpen && <AdminVerify closePanel={() => setIsAdminPanelOpen(false)} onSuccess={registerStore} />}

            {status === 'success' && <p className={styles.successMessage}>✅ Store Registered! Redirecting...</p>}
            {status === 'error' && <p className={styles.errorMessage}>❌ Registration failed. Try again.</p>}
        </div>
    ) : null;
}

export default AccountRegistrationPanel;
