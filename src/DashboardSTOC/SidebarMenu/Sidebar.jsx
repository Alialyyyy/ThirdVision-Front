import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

import report from "../../assets/report.png"; 
import registered from "../../assets/customer.png";
import bin from "../../assets/bin.png";
import policeBadge from "../../assets/policeBadge.png";
import logoutIcon from "../../assets/logoutIcon.png";
import acc from "../../assets/account.png";

function Sidebar({ setActivePanel }) {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

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
            {/* Toggle Button Showing App Name */}
            <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
                ☰ <span>ThirdVision</span>
            </button>

            {/* Sidebar Panel */}
            <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
                <div className={styles.menu}>
                    <img src={policeBadge} className={styles.logo} alt="Logo" />
                    <h3 className={styles.title2}>POLICE STATION</h3>

                    <div className={styles.date}>
                        {formatDate()}
                    </div> 

                    <button onClick={() => setActivePanel("IncidentReportPanel")}> 
                        <img src={report} className={styles.icon} /> Incident Reports
                    </button>
                    <button onClick={() => setActivePanel("RegisterStorePanel")}> 
                        <img src={registered} className={styles.icon} /> Verified Stores
                    </button>
                    <button onClick={() => setActivePanel("PoliceStorePanel")}> 
                        <img src={report} className={styles.icon} /> Authorized Police Users
                    </button>
                    <button onClick={() => setActivePanel("DeleteHistory")}> 
                        <img src={bin} className={styles.icon} /> Delete History
                    </button>

                    <p className={styles.p}>© 2025 ThirdVision</p>
                </div>

                {/* Footer of the sidebar */}
                <footer className={styles.footer}>
                    <div className={styles.storeInfo}>
                        <img src={acc} className={styles.icon} alt="User Icon" />
                        <span className={styles.storeName}>Police HQ</span>
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
