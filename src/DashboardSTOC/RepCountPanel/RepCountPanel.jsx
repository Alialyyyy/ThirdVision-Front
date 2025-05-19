import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Legend, CartesianGrid, Label, PieChart, Pie, Cell
} from "recharts";
import styles from "./RepCountPanel.module.css";

const COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#ff6384", "#36a2eb"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function RepCountPanel() {
    const [monthlyData, setMonthlyData] = useState([]);
    const [locationData, setLocationData] = useState([]);
    const [totalReports, setTotalReports] = useState(0);
    const today = new Date().toLocaleDateString();
    const currentYear = new Date().getFullYear();

    // ✅ Fill bar chart with all 12 months (0s where missing)
    useEffect(() => {
        fetch("https://backendthirdv.onrender.com/api/reports-by-month")
            .then((res) => res.json())
            .then((data) => {
                const monthMap = new Map(data.map(item => [item.monthName, item.count]));
                const filledData = MONTHS.map(month => ({
                    monthName: month,
                    count: monthMap.get(month) || 0
                }));
                setMonthlyData(filledData);
            })
            .catch((err) => console.error("Monthly fetch error:", err));
    }, []);

    // ✅ Accurate total count (from backend)
    useEffect(() => {
        fetch("https://backendthirdv.onrender.com/api/history-count")
            .then(res => res.json())
            .then(data => setTotalReports(data.count || 0))
            .catch(err => console.error("Count fetch error:", err));
    }, []);

    // 📊 Pie Chart Data (Reports by location)
    useEffect(() => {
        fetch("https://backendthirdv-n0dx.onrender.com/api/reports-by-location")
            .then((res) => res.json())
            .then((data) => {
                const formatted = data.map(item => ({
                    name: item.name || item.store_location || "Unknown",
                    value: item.value || item.count || 0,
                }));
                setLocationData(formatted);
            })
            .catch((err) => {
                console.error("Location fetch error:", err);
                setLocationData([]);
            });
    }, []);

    return (
        <div className={styles.RepCountPanel}>
            <h2>📊 Report Statistics - {currentYear}</h2>
            <div className={styles.chartsWrapper}>
                {/* Bar Chart */}
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
                            <Bar name="Report Count" dataKey="count" fill="darkred" barSize={24} isAnimationActive />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
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

            {/* Summary */}
            <div className={styles.reportSummary}>
                <p1 className={styles.totalCount}>{totalReports}</p1>
                <p><strong>Total Reports</strong></p>
            </div>
        </div>
    );
}

export default RepCountPanel;
