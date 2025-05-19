import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Legend, CartesianGrid, Label, PieChart, Pie, Cell
} from "recharts";
import styles from "./RepCountPanel.module.css";

const COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#ff6384", "#36a2eb"];

function RepCountPanel() {
    const [monthlyData, setMonthlyData] = useState([]);
    const [locationData, setLocationData] = useState([]);
    const [totalReports, setTotalReports] = useState(0);
    const today = new Date().toLocaleDateString();
    const currentYear = new Date().getFullYear();

    // 📊 Monthly Bar Chart Data (full 12 months)
    useEffect(() => {
        fetch("https://backendthirdv-n0dx.onrender.com/api/full-reports-by-month")
            .then((res) => res.json())
            .then((data) => {
                console.log("📊 Full Monthly Data:", data);
                setMonthlyData(data || []);
            })
            .catch((err) => console.error("Monthly fetch error:", err));
    }, []);

    // 📊 Pie Chart Data (reports by location)
    useEffect(() => {
        fetch("https://backendthirdv-n0dx.onrender.com/api/reports-by-location")
            .then((res) => res.json())
            .then((data) => {
                const formatted = data.map(item => ({
                    name: item.store_location || item.name || "Unknown",
                    value: item.count || item.value || 0,
                }));
                setLocationData(formatted);
            })
            .catch((err) => {
                console.error("Location fetch error:", err);
                setLocationData([]);
            });
    }, []);

    // 📈 Total Reports Count
    useEffect(() => {
        fetch("https://backendthirdv-n0dx.onrender.com/api/total-reports-this-year")
            .then((res) => res.json())
            .then((data) => {
                setTotalReports(data.count || 0);
            })
            .catch((err) => {
                console.error("Total reports fetch error:", err);
                setTotalReports(0);
            });
    }, []);

    return (
        <div className={styles.RepCountPanel}>
            <h2>📊 Report Statistics - {currentYear}</h2>
            <div className={styles.chartsWrapper}>
                {/* Bar Chart - Reports per Month */}
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={375}>
                        <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="monthName">
                                <Label offset={-5} position="insideBottom" />
                            </XAxis>
                            <YAxis allowDecimals={false}>
                                <Label angle={-90} position="insideLeft" />
                            </YAxis>
                            <Tooltip />
                            <Legend />
                            <Bar name="Report Count" dataKey="count" fill="darkred" barSize={20} isAnimationActive />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart - Reports by Location */}
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={375}>
                        <PieChart>
                            <Pie
                                data={locationData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                label={({ name, value }) => `${name} (${value})`}
                            >
                                {locationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} reports`, name]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 📅 Summary at Bottom */}
            <div className={styles.reportSummary}>
                <p1 className={styles.totalCount}>{totalReports}</p1>
                <p><strong>Total Reports</strong></p>
            </div>
        </div>
    );
}

export default RepCountPanel;
