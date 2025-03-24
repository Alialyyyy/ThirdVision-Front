import { useState } from "react";
import styles from "./EditIncidentPanel.module.css";

function EditIncidentPanel({ incident, onClose, onSave }) {
    const [editedData, setEditedData] = useState({
        date: incident.date,
        time: incident.time,
        detection_type: incident.detection_type,
    });

    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (e) => {
        setEditedData({ ...editedData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log("Sending edit request for:", incident.detection_ID, editedData);

            const response = await fetch(`http://localhost:5001/api/edit-incident/${incident.detection_ID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editedData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to edit incident");

            onSave({ ...incident, ...editedData });

            setSuccessMessage("Saved!");
            setTimeout(() => {
                setSuccessMessage(null);
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Error updating incident:", error);
        }
    };

    return (
        <div className={styles.floatingPanel}>
            <button className={styles.closeButton} onClick={onClose}>✖</button>
            <h2>Edit Incident</h2>
            <form onSubmit={handleSubmit}>
                <label>Date:</label>
                <input type="date" name="date" value={editedData.date} onChange={handleChange}/>

                <label>Time:</label>
                <input type="time" name="time" value={editedData.time} onChange={handleChange}/>

                <label>Threat Level:</label>
                <input type="text" name="threat_level" value={editedData.threat_level} onChange={handleChange}/>

                <label>Detection Type:</label>
                <input type="text" name="detection_type" value={editedData.detection_type} onChange={handleChange}/>

                <button type="submit" className={styles.saveButton}>Save</button>

                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
            </form>
        </div>
    );
}

export default EditIncidentPanel;
