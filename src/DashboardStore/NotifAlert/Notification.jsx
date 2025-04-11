import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import styles from "./Notification.module.css";

const socket = io("http://backendthirdv.onrender.com");

function Notification({ storeID, setLatestReports, latestReports }) {
    const [highlight, setHighlight] = useState(false);
    const clearTimerRef = useRef(null);
    const prevReportRef = useRef(null);
    const hasMountedRef = useRef(false); // Track if it's the initial mount

    // Fetch loop
    useEffect(() => {
        const fetchLatestReports = async () => {
            try {
                // Include storeID in the API request
                const response = await fetch(`http://backendthirdv.onrender.com/latest-reports2?storeID=${storeID}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setLatestReports(data.slice(0, 1)); // Keep only the latest report
            } catch (error) {
                console.error("Error fetching latest reports:", error);
            }
        };

        fetchLatestReports();
        const interval = setInterval(fetchLatestReports, 1000);
        return () => clearInterval(interval);
    }, [setLatestReports, storeID]); // Depend on storeID to refetch when it changes

    // Socket listener
    useEffect(() => {
        socket.on("new-detection", (newReport) => {
            // Only update if the new report is for the same storeID
            if (newReport.storeID === storeID) {
                console.log("🚨 New detection received:", newReport);
                setLatestReports([newReport]);
            }
        });

        return () => socket.off("new-detection");
    }, [setLatestReports, storeID]);

    useEffect(() => {
        if (!latestReports || latestReports.length === 0) return;

        const current = latestReports[0];
        const prev = prevReportRef.current;

        const isNewReport =
            !prev ||
            prev.id !== current.id ||
            prev.date !== current.date ||
            prev.time !== current.time;

        if (isNewReport) {
            prevReportRef.current = current;

            // Skip highlight on initial load
            if (!hasMountedRef.current) {
                hasMountedRef.current = true;
                return;
            }

            setHighlight(true);

            if (clearTimerRef.current) {
                clearTimeout(clearTimerRef.current);
            }

            clearTimerRef.current = setTimeout(() => {
                setHighlight(false);
            }, 10000);
        }
    }, [latestReports]);

    if (!latestReports || latestReports.length === 0) return null;

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

    const panelStyle = {
        backgroundColor: highlight ? "#ff4d4d" : "#ffffff",
        transition: "background-color 0.5s ease",
        color: "black",
        width: "100%",
        padding: "1rem",
        borderRadius: "8px",
    };

    return (
        <div style={panelStyle}>
            <h1>LATEST DETECTION</h1>
            <div className={styles.repCardPanel}>
                <h3>❗<strong>{latestReports[0].detection_type}</strong>❗</h3>
                <h1>
                    <strong>
                        {formatDate(latestReports[0].date)} {formatTime(latestReports[0].time)}
                    </strong>
                </h1>
            </div>
        </div>
    );
}

export default Notification;
