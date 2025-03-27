import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Label } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import styles from "./RepCountPanel.module.css";

const COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c"];

function RepCountPanel() {
    const [count, setCount] = useState(0);
    const [monthlyData, setMonthlyData] = useState([]);
    const [locationData, setLocationData] = useState([]);

    useEffect(() => {
        const fetchReportCount = () => {
            fetch(`${import.meta.env.VITE_API_URL}/api/history-count`)
                .then((response) => response.json())
                .then((data) => setCount(data.count))
                .catch((error) => console.error("Error fetching count:", error));
        };
    
        fetchReportCount(); 
    
        const interval = setInterval(fetchReportCount, 1000);
    
        return () => clearInterval(interval);
    }, []);
    

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/reports-per-month`)
            .then((response) => response.json())
            .then((data) => setMonthlyData(data))
            .catch((error) => console.error("Error fetching monthly data:", error));
    }, []);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/reports-by-location`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("📊 Location Data Received:", data); 
                if (Array.isArray(data)) {
                    setLocationData(data); // Ensure it is an array
                } else {
                    console.error("❌ Unexpected data format:", data);
                    setLocationData([]);
                }
            })
            .catch((error) => {
                console.error("❌ Error fetching location data:", error);
                setLocationData([]); // Prevents frontend crashes
            });
    }, []);

    return (
        <div className={styles.RepCountPanel}>
            <h2>📊 Report Statistics - {new Date().getFullYear()}</h2>
            <p className={styles.totalCount}>Total Reports: {count}</p>
    
            <div className={styles.chartsWrapper}>
                {/* Bar Chart */}
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="10 10" />
                            <XAxis dataKey="monthName">
                                <Label offset={-10} position="insideBottom" />
                            </XAxis>
                            <YAxis>
                                <Label value="Total Reports" angle={-90} position="insideLeft" />
                            </YAxis>
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="darkred" barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
    
                {/* Pie Chart */}
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={locationData}
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#8884d8"
                            label={({ name, value }) => `${name || "Unknown"} (${value || 0})`} 
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
        </div>
    );
    
}

export default RepCountPanel;
