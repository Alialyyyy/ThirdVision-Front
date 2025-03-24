import { useRef, useState, useEffect } from 'react';
import EditIncidentPanel from './EditPanel.jsx';
import IR from './IncidentHistory.module.css';
import { FaEye } from 'react-icons/fa';
import ThreatDropdown from './ThreatDropdown.jsx';
import TypeDropdown from './TypeDropdown.jsx';
import dropdown from './Dropdown.module.css';

function IncidentHistory({ onClose, isOpen, storeID, onHistoryUpdate }) {
    const [history, setHistory] = useState([]); 
    const [loading, setLoading] = useState(false); 
    const [search, setSearch] = useState(''); 
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [selectedThreatLevel, setSelectedThreatlevel] = useState([]); 
    const [selectedType, setSelectedType] = useState([]); 

    useEffect(() => {
        if (!isOpen || !storeID) return;

        setLoading(true);
        fetch(`http://localhost:5001/api/incident-history/${storeID}`)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched incident history:', data);
                setHistory(data); 
                onHistoryUpdate(data.length); 
            })
            .catch(error => console.error('Error fetching incident history:', error))
            .finally(() => setLoading(false));
    }, [isOpen, storeID, selectedThreatLevel, selectedType]); 

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handleDelete = async (detection_ID) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
    
        try {
            const response = await fetch(`http://localhost:5001/api/delete-detection2/${storeID}/${detection_ID}`, {
                method: "DELETE",
            });
    
            if (!response.ok) throw new Error("Failed to delete record");
    
            alert("Record deleted successfully!");
    
            fetchDetectionHistory();  
            fetchDeleteHistory();     
        } catch (error) {
            console.error("Error deleting record:", error);
        }
    };
    
    const handleButtonClick = (event, image) => {
        event.preventDefault();
        let newUrl = image;

        if (image.includes('drive.google.com')) {
            newUrl = image.replace('drive.google.com', 'yourdomain.com');
        }

        window.open(newUrl, '_blank', 'noopener,noreferrer'); 
    };
    
    const exportToExcel = () => {
            if (filteredHistory.length === 0) {
                alert("No data to export!");
                return;
            }
    
            const currentDate = new Date().toISOString().split("T")[0];
        
            const dataToExport = filteredHistory.map(entry => ({
                "ID": entry.shared_detection_id,
                "Date": formatDate(entry.date),
                "Time": formatTime(entry.time),
                "Threat Level": entry.threat_level,
                "Type": entry.detection_type
            }));
        
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "IncidentHistory");
        
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(data, `Incident_Report_${currentDate}.xlsx`);
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

    const filteredHistory = history.filter((entry) => {
        const detectionIdStr = String(entry.detection_ID);
        const sharedIdStr = String(entry.shared_detection_id);
        const dateStr = entry.date; 
        const timeStr = entry.time; 
        const threatLevelStr = String(entry.threat_level).toLowerCase(); 
        const typeStr = String(entry.detection_type).toLowerCase();
        
        const matchesSearch = search.toLowerCase() === '' || (
            detectionIdStr.includes(search) ||
            sharedIdStr.includes(search) ||
            formatDate(dateStr).includes(search) ||
            formatTime(timeStr).includes(search) ||
            threatLevelStr.includes(search) ||
            typeStr.includes(search)
        );

        const matchesThreatLevel = selectedThreatLevel.length === 0 || selectedThreatLevel.includes(entry.threat_level);
        const matchesType = selectedType.length === 0 || selectedType.includes(entry.detection_type);

        return matchesSearch && matchesThreatLevel && matchesType;
    });

    if (!isOpen) return null;

    return (
        <div className={IR.floatingPanel}>
            <button className={IR.closeButton} onClick={onClose}>✖</button>
            <h2 className={IR.title}>Incident History</h2>
            <div className={IR.searchContainer}>            
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={handleSearchChange}
                    className={IR.searchInput} 
                />
                <button className={IR.exportButton} onClick={exportToExcel} >
                 📤 Export to Excel
                </button>
            </div>
            <div className={dropdown.dropdownContainer}>
                <ThreatDropdown onSelect={setSelectedThreatlevel}/>
                <TypeDropdown onSelect={setSelectedType}/>
            </div>
            {loading ? (
                <p className={IR.loading}>Loading...</p>
            ) : (
                <div  className={IR.tableContainer}>
                    <table className={IR.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Threat Level</th>
                                <th>Type</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((entry) => (
                                    <tr key={entry.detection_ID}>
                                        <td>{entry.shared_detection_id}</td>
                                        <td>
                                            <button className={IR.eyeButton} onClick={(event) => handleButtonClick(event, entry.image)}>
                                                <FaEye size={18} />
                                            </button>
                                        </td>
                                        <td>{formatDate(entry.date)}</td>
                                        <td>{formatTime(entry.time)}</td>
                                        <td>{entry.threat_level}</td>
                                        <td>{entry.detection_type}</td>
                                        <td>
                                            <button className={IR.editButton} onClick={() => handleEditClick(entry)}>Edit</button>
                                            <button className={IR.deleteButton} onClick={() => handleDelete(entry.detection_ID)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7">No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedIncident && (
                <EditIncidentPanel
                    incident={selectedIncident}
                    onClose={() => setSelectedIncident(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
}

export default IncidentHistory;