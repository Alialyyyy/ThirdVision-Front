import { useState } from "react";
import styles from "./Sidebar.module.css";

import bin from "../../assets/bin.png";
import report from "../../assets/report.png";

function Sidebar({ setActivePanel, storeID }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
            <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
                ☰ <span>{storeID}</span>
            </button>
    
            {isOpen && (
                <div className={styles.menu}>
                    <img src={report} className={styles.logo} />
                    <h3 className={styles.title2}>THIRDVISION</h3>

                    <button onClick={() => setActivePanel("IncidentHistory")}>
                        <img src={report} className={styles.icon} /> Incident History
                    </button>

                    <button onClick={() => setActivePanel("EditHistory")}>
                        <img src={report} className={styles.icon} /> Edited Reports
                    </button>

                    <button onClick={() => setActivePanel("DeletedHistory")}>
                        <img src={bin} className={styles.icon} /> Trash
                    </button>
                </div>
            )}
        </div>
    );
}    

export default Sidebar;
