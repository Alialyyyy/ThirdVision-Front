import React, { useState, useEffect } from "react";
import styles from "./EventLog.module.css"; 

function EventLog({ storeID }) {
    const [warnings, setWarnings] = useState([]);

    useEffect(() => {
        if (!storeID) return;

        const fetchWarnings = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/face-cover-warnings/${storeID}`);
                if (!response.ok) throw new Error("Failed to fetch data");
                const data = await response.json();
                setWarnings(data);
            } catch (error) {
                console.error("Error fetching face cover warnings:", error);
            }
        };

        fetchWarnings();
    }, [storeID]);

    return (
        <div className={styles.eventLogContainer}>
            <h1 className={styles.eventLogTitle}>Face Visibility Warning</h1>
            {warnings.length === 0 ? (
                <p className={styles.noWarnings}>No warnings found.</p>
            ) : (
                <ul className={styles.warningList}>
                    {warnings.map((warning, index) => (
                        <li key={index} className={styles.warningItem}>
                            <strong>Date:</strong> {warning.date} | <strong>Time:</strong> {warning.time}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default EventLog;
