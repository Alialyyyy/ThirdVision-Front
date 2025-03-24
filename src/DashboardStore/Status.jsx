import styles from './Status.module.css';
import React, { useState, useEffect } from 'react';
import ReportLineGraph from "./ReportLineGraph.jsx";
import IncidentHistory from './IncidentHistory.jsx';
import DeleteHistory from './DeletedHistory.jsx';
import Notification from "./NotifAlert/Notification.jsx";
import PopUpNotif from "./NotifAlert/PopupNotif.jsx";
import EventLog from './NotifAlert/EventLog.jsx';

function Status({ storeID, isLoggedIn }) {
    const [isOpen, setIsOpen] = useState(false);
    const [time, setTime] = useState(new Date());
    const [count, setCount] = useState(0);
    const [latestReports, setLatestReports] = useState([]); 

    useEffect(() => {
        if (storeID) {
            console.log("Fetching count for storeID:", storeID);
            fetch(`http://localhost:5001/api/history-count2/${storeID}`)
                .then(response => response.json())
                .then(data => {
                    setCount(data.count);
                })
                .catch(error => console.error('Error fetching incident count:', error));
        }
    }, [storeID]);

    useEffect(() => {
        if (!storeID) return;

        const fetchReportData = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/report-count-per-month/${storeID}`);
                if (!response.ok) throw new Error("Failed to fetch data");
                const data = await response.json();
                setReportData(data);
            } catch (error) {
                console.error("Error fetching report count data:", error);
            }
        };

        fetchReportData();
    }, [storeID]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    function formatTime() {
        let hours = time.getHours();
        const mins = time.getMinutes();
        const secs = time.getSeconds();
        const merid = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;

        return `${hours}:${mins}:${secs} ${merid}`;
    }

    function formatDate() {
        const currentDate = new Date();
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const month = monthNames[currentDate.getMonth()];
        const date = currentDate.getDate();
        return `${month} ${date}, `;
    }

    return (
        <>
            <div className={styles.MainPanel}>
                {/* ✅ Row 1 - Event Section */}
                <div className={styles.event}>
                    <EventLog/>
                    <Notification setLatestReports={setLatestReports} latestReports={latestReports} />
                    <PopUpNotif latestReports={latestReports} />
                </div>

                {/* ✅ Row 2 - Alarm Section 
                <div className={styles.alarm}>
                    <p className={styles.reportCount}>Report Count</p>
                    <p className={styles.reportNum}>{count}</p>
                    <button className={styles.inci} onClick={() => setIsOpen(true)}>Incident Records</button>
                    <DeleteHistory/>
                </div>*/}
            </div>

            <IncidentHistory 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
                storeID={storeID}
                onHistoryUpdate={(count) => setCount(count)}
            />
        </>
    );
}

export default Status;
