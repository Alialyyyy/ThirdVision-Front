import React, { useState, useEffect } from "react";
import redW from "../../assets/alarm.gif";
import styles from "./PopUp.module.css";

function PopUpNotif({ latestReports }) { 
    const [isVisible, setIsVisible] = useState(false);
    const [lastReportId, setLastReportId] = useState(null);

    useEffect(() => {
        if (latestReports.length > 0) {
            const latestReportId = latestReports[0].detection_ID;
            console.log("🆕 New Report ID:", latestReportId);

            const dismissedReportId = sessionStorage.getItem("dismissedReportId");
            console.log("🔄 Previously Dismissed Report ID:", dismissedReportId);

            if (!dismissedReportId || latestReportId !== parseInt(dismissedReportId, 10)) {
                console.log("✅ Showing PopUp!");
                setIsVisible(true);
                setLastReportId(latestReportId);
            } else {
                console.log("🚫 PopUp is already dismissed, not showing again.");
            }
        }
    }, [latestReports]);

    const closePopup = () => {
        if (lastReportId) {
            sessionStorage.setItem("dismissedReportId", lastReportId);  // ✅ Store properly
        }
        setIsVisible(false);
    };

    const openImage = () => {
        if (latestReports[0].image) {
            window.open(latestReports[0].image, '_blank', 'noopener,noreferrer');
        }
    };

    if (!isVisible || latestReports.length === 0) return null;

    const latestReport = latestReports[0];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour % 12 || 12}:${minutes} ${ampm}`;
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <div className={styles.reportCard}>
                    <h1 className={styles.alertHeader}> 🚨 THREAT DETECTED! </h1>
                    <h3><strong>{latestReport.threat_level}</strong></h3>
                    <img src={redW} className={styles.warning} />
                    <button className={styles.imageBtn} onClick={openImage}>VIEW THREAT</button>
                    <h3><strong>{latestReport.detection_type}</strong></h3>
                    <h2><strong>{latestReport.store_name} {latestReport.store_location}</strong></h2>
                    <h1>{formatDate(latestReport.date)}</h1>
                    <h1>{formatTime(latestReport.time)}</h1>
                    <button className={styles.actionButton} onClick={closePopup}>🚔 TAKE ACTION</button>
                </div>
            </div>
        </div>
    );
}

export default PopUpNotif;
