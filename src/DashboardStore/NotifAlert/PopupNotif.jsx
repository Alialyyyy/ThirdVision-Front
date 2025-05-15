import React, { useState, useEffect } from "react";
import redW from "../../assets/alarm.gif"; // Alarm GIF
import styles from "./PopUp.module.css";

function PopUpNotif({ latestReports }) {
    const [lastSeenReportId, setLastSeenReportId] = useState(() => {
        return localStorage.getItem("lastSeenReportId") || null;
    });

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn", "false");

        // 🛑 Skip if login state is unknown or user is logged in
        if (isLoggedIn === null) {
            console.log("⏳ Login state not yet determined. Waiting...");
            return;
        }

        if (isLoggedIn === "true") {
            console.log("🚫 User is logged in, skipping popup.");
            return;
        }

        // ✅ Proceed only if logged out and we have reports
        if (latestReports.length > 0) {
            const filteredReports = latestReports.filter(
                (report) =>
                    report.threat_level === "1st Warning" ||
                    report.threat_level === "2nd Warning" ||
                    report.threat_level === "3rd Warning"
            );

            if (filteredReports.length > 0) {
                const latestReport = filteredReports[0];
                const latestReportId = latestReport.detection_ID;

                console.log("🆕 New Warning Report ID:", latestReportId);

                const dismissedReportId = parseInt(sessionStorage.getItem("dismissedReportId"), 10);
                const lastSeenId = parseInt(lastSeenReportId, 10);

                console.log("🔄 Previously Dismissed Report ID:", dismissedReportId);
                console.log("👁 Last Seen Report ID:", lastSeenId);

                const shouldShow =
                    (!dismissedReportId || latestReportId !== dismissedReportId) &&
                    latestReportId !== lastSeenId;

                if (shouldShow) {
                    openPopupWindow(latestReport, latestReportId);
                    setLastSeenReportId(latestReportId);
                    localStorage.setItem("lastSeenReportId", latestReportId);
                } else {
                    console.log("🚫 Popup not shown (already dismissed or seen).");
                }
            } else {
                console.log("✅ No relevant warning threats found.");
            }
        }
    }, [latestReports, lastSeenReportId]);

    const formatTime = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")} ${ampm}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const openPopupWindow = (report, reportId) => {
        const popupWindow = window.open("", "Report Notification", "width=500,height=750");

        if (popupWindow) {
            popupWindow.document.write(`
                <html>
                    <head>
                        <title>THREAT DETECTED</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                padding: 30px;
                                text-align: center;
                                background-color: rgb(0, 0, 0);
                            }
                            .alert-container {
                                background: white;
                                padding: 3px;
                                border-radius: 12px;
                                box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
                                max-width: 500px;
                                margin: auto;
                            }
                            h1, h3, h2 {
                                font-size: 28px;
                                color: #222;
                            }
                            h3 { color: red; font-weight: bold; }
                            h2 { color: #444; }
                            img {
                                width: 120px;
                                margin: 5px 0;
                            }
                            .btn {
                                display: inline-block;
                                padding: 12px 20px;
                                font-size: 16px;
                                font-weight: bold;
                                text-transform: uppercase;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s ease-in-out;
                                margin: 10px;
                            }
                            .view-btn {
                                background-color: #007bff;
                                color: white;
                            }
                            .view-btn:hover {
                                background-color: #0056b3;
                            }
                            .close-btn {
                                background-color: #dc3545;
                                color: white;
                            }
                            .close-btn:hover {
                                background-color: #b02a37;
                            }
                            .date-time {
                                font-size: 20px;
                                font-weight: bold;
                                color: #333;
                            }
                        </style>
                        <script>
                            function closePopup() {
                                window.opener.postMessage({ reportId: ${reportId} }, "*");
                                window.close();
                            }

                            window.addEventListener("beforeunload", closePopup);
                        </script>
                    </head>
                    <body>
                        <div class="alert-container">
                            <img src="${redW}" alt="Alarm" />
                            <h3>${report.threat_level}</h3>
                            <h3>${report.detection_type.replace(/\n/g,"<br>")}</h3>  
                            <h2>${report.store_name}, ${report.store_location}</h2>
                            <div class="date-time">${formatDate(report.date)} | ${formatTime(report.time)}</div>
                            <button class="btn close-btn" onclick="closePopup()">TAKE ACTION</button>
                        </div>
                    </body>
                </html>
            `);
            popupWindow.document.close();
        }
    };

    useEffect(() => {
        const handlePopupClose = (event) => {
            if (event.data?.reportId) {
                sessionStorage.setItem("dismissedReportId", event.data.reportId);
                console.log("✅ Report dismissed and stored:", event.data.reportId);
            }
        };

        window.addEventListener("message", handlePopupClose);
        return () => window.removeEventListener("message", handlePopupClose);
    }, []);

    return null;
}

export default PopUpNotif;
