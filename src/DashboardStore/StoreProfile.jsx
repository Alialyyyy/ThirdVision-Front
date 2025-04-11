import { useState, useEffect } from 'react';
import StoreProfileEdit from './StoreProfileEdit';
import styles from './StoreProfile.module.css'; // StoreProfile styles

function StoreProfile({ onClose, isOpen, storeID }) {
    const [store, setStore] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(true);
    const [showPasswordVerification, setShowPasswordVerification] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        store_location: '',
        username: '',
        password: '',
        store_name: '',
        store_contact: '',
        store_address: '',
    });

    useEffect(() => {
        // Fetch store data
        if (!storeID) return;

        const fetchStoreInfo = async () => {
            setLoading(true); // Start loading
            const response = await fetch("https://backendthirdv.onrender.com/api/store-accounts");
            if (!response.ok) {
                console.error("Failed to fetch store accounts");
                setLoading(false); // Stop loading on error
                return;
            }
            const data = await response.json();
            const matchedStore = data.find((store) => store.store_ID.toString() === storeID.toString());
            setStore(matchedStore);
            if (matchedStore) {
                setFormData({
                    store_location: matchedStore.store_location,
                    username: matchedStore.username,
                    password: matchedStore.password,
                    store_name: matchedStore.store_name,
                    store_contact: matchedStore.store_contact,
                    store_address: matchedStore.store_address,
                });
            }
            setLoading(false); // Stop loading after data is fetched
        };

        fetchStoreInfo();
    }, [storeID]);

    const handlePasswordSubmit = () => {
        if (passwordInput === store.password) {
            setIsPasswordCorrect(true);
            setEditMode(true); // Enable editing after correct password
            setShowPasswordVerification(false);
        } else {
            setIsPasswordCorrect(false);
        }
    };

    const handleEditClick = () => {
        setShowPasswordVerification(true); // Show password verification panel
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`https://backendthirdv.onrender.com/api/store-accounts/${store.store_ID}`, {
                method: 'PUT', // Use PUT or PATCH depending on your API
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Send the updated form data
            });

            if (!response.ok) {
                throw new Error('Failed to update store information');
            }

            const updatedStore = await response.json();
            setStore(updatedStore); // Update local state with the new store data
            setEditMode(false); // Disable edit mode after saving
            console.log('Store information updated successfully:', updatedStore);
        } catch (error) {
            console.error('Error updating store information:', error);
        }
    };

    return (
        <>
            {/* Store Profile Edit - Password Verification */}
            {showPasswordVerification && (
                <div style={{ position: 'fixed', zIndex: 10000 }}>
                    <StoreProfileEdit
                        passwordInput={passwordInput}
                        setPasswordInput={setPasswordInput}
                        handlePasswordSubmit={handlePasswordSubmit}
                        isPasswordCorrect={isPasswordCorrect}
                        setIsPasswordCorrect={setIsPasswordCorrect}
                        setShowPasswordVerification={setShowPasswordVerification}
                    />
                </div>
            )}

            {/* Store Profile Panel */}
            <div className={styles.overlay}>
                <div className={styles.floatingPanel}>
                    <button className={styles.closeButton} onClick={onClose}>✖</button>
                    <h2 className={styles.title}>Store Profile</h2>

                    {loading ? (
                        <p>Loading...</p> // Show loading message while data is being fetched
                    ) : (
                        <div className={styles.profileInfo}>
                            {editMode ? (
                                <>
                                    <div className={styles.row}>
                                        <label>Store ID:</label>
                                        <span>{store.store_ID}</span>
                                    </div>

                                    <div className={styles.row}>
                                        <label>Store Location:</label>
                                        <span>{formData.store_location}</span>
                                    </div>

                                    <div className={styles.row}>
                                        <label>ThirdVision ID:</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.row}>
                                        <label>Password:</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.row}>
                                        <label>Store Name:</label>
                                        <input
                                            type="text"
                                            name="store_name"
                                            value={formData.store_name}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.row}>
                                        <label>Store Contact:</label>
                                        <input
                                            type="text"
                                            name="store_contact"
                                            value={formData.store_contact}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.row}>
                                        <label>Store Address:</label>
                                        <input
                                            type="text"
                                            name="store_address"
                                            value={formData.store_address}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <button className={styles.saveButton} onClick={handleSave}>Save Changes</button>
                                </>
                            ) : (
                                <>
                                    <button className={styles.editButton} onClick={handleEditClick}>Edit</button>

                                    <div className={styles.row}>
                                        <label>Store ID:</label>
                                        <span>{store.store_ID}</span>
                                    </div>

                                    <div className={styles.row}>
                                        <label>Store Location:</label>
                                        <span>{store.store_location}</span>
                                    </div>

                                    <div className={styles.row}>
                                        <label>ThirdVision ID:</label>
                                        <span>{store.username}</span>
                                    </div>

                                    <div className={styles.row}>
                                        <label>Password:</label>
                                        <span>••••••••</span>
                                    </div>

                                    <div className={styles.row}>
                                        <label>Store Name:</label>
                                        <span>{store.store_name}</span>
                                    </div>

                                    <div className={styles.row}>
                                        <label>Store Contact:</label>
                                        <span>{store.store_contact}</span>
                                    </div>

                                    <div className={styles.row}>
                                        <label>Store Address:</label>
                                        <span>{store.store_address}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default StoreProfile;