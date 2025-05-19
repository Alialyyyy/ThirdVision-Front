import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

import bin from "../../assets/bin.png";
import report from "../../assets/report.png";
import eye2 from "../../assets/eye2.png";
import user from "../../assets/user.png";
import acc from "../../assets/account.png";

function Sidebar({ setActivePanel, storeID }) {
    const [isOpen, setIsOpen] = useState(true);
    const [storeName, setStoreName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStoreName = async () => {
            try {
                const response = await fetch("https://backendthirdv-n0dx.onrender.com/api/store-accounts");
                if (!response.ok) throw new Error("Failed to fetch store accounts.");

                const data = await response.json();
                const store = data.find(store => store.store_ID.toString() === storeID.toString());

                if (store) {
                    setStoreName(store.store_name);
                } else {
                    setStoreName(`Store ${storeID}`); // Fallback if not found
                }
            } catch (error) {
                console.error("Error fetching store name:", error);
                setStoreName(`Store ${storeID}`); // Fallback in case of error
            }
        };

        if (storeID) fetchStoreName();
    }, [storeID]);

    function formatDate() {
        return new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <>
            {/* ✅ Toggle Button Showing Store Name */}
            <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
                ☰ <span>ThirdVision</span>
            </button>

            <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
                <div className={styles.menu}>
                    <img src={eye2} className={styles.logo} alt="Logo" />
                    <h3 className={styles.title2}>THIRDVISION</h3>

                    <div className={styles.date}>
                        {formatDate()}
                    </div>   

                    <button onClick={() => setActivePanel("StoreProfile")}>
                        <img src={user} className={styles.icon} alt="Store Profile" /> Store Profile
                    </button>

                    <button onClick={() => setActivePanel("IncidentHistory")}>
                        <img src={report} className={styles.icon} alt="Incident History" /> Incident History
                    </button>

                    <button onClick={() => setActivePanel("DeletedHistory")}>
                        <img src={bin} className={styles.icon} alt="Trash" /> Trash
                    </button>

                    <p className={styles.p}>© 2025 ThirdVision</p>

                    {/* Footer of the sidebar */}
                </div>
                <footer className={styles.footer}>
                        <div className={styles.storeInfo}>
                            <img src={acc} className={styles.icon} alt="User Icon" />
                            <span className={styles.storeName}>{storeName}</span>
                        </div>
                        <button1 className={styles.logoutButton} onClick={handleLogout}>
                             Logout
                        </button1>
                </footer>
            </div>
        </>
    );
}

export default Sidebar;
