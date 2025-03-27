

import { useState, useEffect } from 'react';
import IR from './EditHistory.module.css';

function EditHistory ({ onClose, isOpen }){
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isVisible, setIsVisible] = useState(true);
    
        const handleClose = () => {
            setIsVisible(false); 
        };

    useEffect(() => {
        setLoading(true); 
                fetch(`${import.meta.env.VITE_API_URL}/api/edit-history`)
        .then(response => response.json())
        .then(data => setHistory(data))
        .catch(error => console.error('Error fetching data:', error))
        .finally(() => setLoading(false));
    }, []);


if (!isOpen) return null;

    return isVisible ? (
        <div className={IR.floatingPanel}>
                <button className={IR.closeButton} onClick={handleClose}>✖</button>
                <h2 className={IR.title}>Edit History</h2>
        
                {loading ? (
                    <p className={IR.loading}>Loading...</p>
                ) : (
                    <div className={IR.tableContainer}>
                        <table className={IR.table}>
                            <thead>
                                <tr>
                                    <th>Detection ID</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Action</th>
                                    <th>Edited By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((entry) => {
                                    return (
                                        <tr key={entry.detection_ID}>
                                            <td>{entry.detection_ID}</td>
                                            <td>{entry.date}</td>
                                            <td>{entry.time}</td>
                                            <td>{entry.edited_by}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>)}
        </div>
    ): null;
}

export default EditHistory;