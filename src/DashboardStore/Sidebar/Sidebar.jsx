import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

import bin from "../../assets/bin.png";
import report from "../../assets/report.png";
import logoutIcon from "../../assets/logoutIcon.png";


function Sidebar({ setActivePanel, storeID }) {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/"); 
    };

    return (
        <>
            {/* ✅ Always Visible Toggle Button */}
            <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
                ☰ <span>{isOpen ? storeID : ""}</span>
            </button>

            {/* ✅ Sidebar Panel */}
            <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
                <div className={styles.menu}>
                    <img src={report} className={styles.logo} alt="Logo" />
                    <h3 className={styles.title2}>THIRDVISION</h3>

                    <button onClick={() => setActivePanel("IncidentHistory")}>
                        <img src={report} className={styles.icon} alt="Incident History" /> Incident History
                    </button>

                    <button onClick={() => setActivePanel("EditHistory")}>
                        <img src={report} className={styles.icon} alt="Edited Reports" /> Edited Reports
                    </button>

                    <button onClick={() => setActivePanel("DeletedHistory")}>
                        <img src={bin} className={styles.icon} alt="Trash" /> Trash
                    </button>

                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <img src={logoutIcon} className={styles.icon} alt="Logout" /> Logout
                    </button>
                </div>
            </div>
        </>
    );
}    

export default Sidebar;
