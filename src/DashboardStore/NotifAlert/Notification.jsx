import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import styles from "./Notification.module.css";

const socket = io("http://localhost:5001");

function Notification({ setLatestReports, latestReports }) {
    const clearTimerRef = useRef(null);


useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (justLoggedIn) {
        console.log("🚀 Just logged in, skipping immediate fetch.");
        sessionStorage.removeItem("justLoggedIn");
        return;
    }

    const fetchOnce = async () => {
        try {
            const response = await fetch("http://localhost:5001/latest-reports2");
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setLatestReports(data.slice(0, 1));
        } catch (error) {
            console.error("Error fetching latest reports:", error);
        }
    };

    fetchOnce();
}, [setLatestReports]);
    useEffect(() => {
        socket.on("new-detection", (newReport) => {
            console.log("🚨 New detection received:", newReport);
            setLatestReports([newReport]);

            // Clear existing timer if any
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

            // Set timer to clear report after 20 seconds
            clearTimerRef.current = setTimeout(() => {
                setLatestReports([]);
            }, 20000);
        });

        return () => {
            socket.off("new-detection");
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        };
    }, [setLatestReports]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes}:${seconds} ${ampm}`;
    };

    return (
        <div className={styles.notificationPanel}>
            <h1>FACE COVER DETECTION</h1>
            {latestReports.length > 0 ? (
                <div className={styles.repCardPanel}>
                    <h3>❗<strong>{latestReports[0].detection_type}</strong>❗</h3>
                    <h1>
                        <strong>
                            {formatDate(latestReports[0].date)} {formatTime(latestReports[0].time)}
                        </strong>
                    </h1>
                </div>
            ) : (
                <div className={styles.noThreat}>✅ No current threat detected.</div>
            )}
        </div>
    );
}

export default Notification;
