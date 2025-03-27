import { useState, useEffect } from 'react';

const WiFiStatus = () => {
    const [currentSSID, setCurrentSSID] = useState("Loading...");

    useEffect(() => {
        // Fetch current WiFi SSID when the page loads
        const fetchSSID = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/current-wifi`);
                const text = await res.text();
                setCurrentSSID(text || "Unknown");
            } catch (error) {
                console.error("Error fetching WiFi SSID:", error);
                setCurrentSSID("Error fetching SSID");
            }
        };
    
        fetchSSID();
    }, []);
    
    return (
        <div>
            <h2>Current WiFi: {currentSSID}</h2>
        </div>
    );
};

export default WiFiStatus;