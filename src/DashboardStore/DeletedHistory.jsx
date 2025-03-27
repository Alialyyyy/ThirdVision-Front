import { useState, useEffect } from 'react';
import IR from './DeletedHistory.module.css';

function DeleteHistory({storeID, closePanel}) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredHistory, setFilteredHistory] = useState([]);

        const fetchDetectionHistory = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/incident-history2/${storeID}`);        
                const data = await response.json();
                setFilteredHistory(data);
            } catch (error) {
                console.error("Error fetching detection history:", error);
            }
        };
    
        const fetchDeleteHistory = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/deleted-history2/${storeID}`);
                if (!response.ok) throw new Error("Failed to fetch delete history");
        
                const data = await response.json();
                setHistory(data);  
            } catch (error) {
                console.error("Error fetching delete history:", error);
            }
        };

        useEffect(() => {        
            fetchDetectionHistory();
            fetchDeleteHistory();
        }, [storeID]);

    const handleDelete = async (detection_ID) => {
        const password = prompt("Enter password to delete:");
    
        if (!password) return alert("Password is required!");
    
        try {
            const response = await axios.post('/api/deleted-permanent', {
                password,
                detection_ID
            });
    
            alert(response.data.message);
            window.location.reload(); 
        } catch (error) {
            alert(error.response?.data?.message || "Error deleting record");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minute < 10 ? '0' + minute : minute} ${ampm}`;
    };

    return (
        <div>

                <div className={IR.floatingPanel}>
                <button className={IR.closeButton} onClick={closePanel}>✖</button>
                    <h2 className={IR.title}>Deleted Reports</h2>

                    {loading ? (
                        <p className={IR.loading}>Loading...</p>
                    ) : (
                        <div className={IR.tableContainer}>
                            <table className={IR.table}>
                                <thead>
                                    <tr>
                                        <th>Date Deleted</th>
                                        <th>Time Deleted</th>
                                        <th>ID</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? (
                                        history.map((entry) => (
                                        <tr key={entry.detection_ID}>
                                            <td>{formatDate(entry.date_deleted)}</td>
                                            <td>{formatTime(entry.time_deleted)}</td>
                                            <td>{entry.detection_ID}</td>
                                            <td>{formatDate(entry.date)}</td>
                                            <td>{formatTime(entry.time)}</td>
                                            <td>{entry.store_ID}</td>
                                            <td>
                                                <button className={IR.linkButton} onClick={() => handleDelete(entry.detection_ID)}>Clear</button>
                                            </td>
                                        </tr>
                                    ))
                                ):(
                                        <tr>
                                            <td colSpan="6">No deleted records found.</td>
                                        </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
        </div>
    );
}

export default DeleteHistory;
