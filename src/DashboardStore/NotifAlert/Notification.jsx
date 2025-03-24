import React, { useEffect } from "react";
import { io } from "socket.io-client";
import styles from "./Notification.module.css";
import eye from "../../assets/eye.png";

const socket = io("http://localhost:5001");

function Notification({ setLatestReports, latestReports }) { 

    useEffect(() => {
    const fetchLatestReports = async () => {
        try {
            const response = await fetch("http://localhost:5001/latest-reports2");
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setLatestReports(data);  
        } catch (error) {
            console.error("Error fetching latest reports:", error);
        }
    };
    
    fetchLatestReports();
    const interval = setInterval(fetchLatestReports, 1000);

    return () => clearInterval(interval);
}, [setLatestReports]);

    useEffect(() => {
        socket.on("new-detection", (newReport) => {
            console.log("🚨 New detection received:", newReport);
            setLatestReports((prevReports) => [newReport, ...prevReports].slice(0, 2));
        });

        return () => socket.off("new-detection");
    }, [setLatestReports]);

    if (!latestReports || latestReports.length === 0) return 
    
    <div className={styles.RepFound}>No reports found.</div>;

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

    const openImage = () => {
        if (latestReports[0].image) {
            window.open(latestReports[0].image, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className={styles.notificationPanel}>
            <h1>Latest Reports</h1>
            {latestReports.map((report, index) => (
                <div key={index} className={styles.repCardPanel}>
                    <h3><strong>{report.threat_level}</strong></h3>
                    <h3><strong>{report.detection_type}</strong></h3>
                    <h1><strong>{formatDate(report.date)} {formatTime(report.time)}</strong></h1>
                    <button className={styles.reportImage} onClick={openImage}><strong>VIEW THREAT</strong></button>
                </div>
            ))}
        </div>
    );
}

export default Notification;
