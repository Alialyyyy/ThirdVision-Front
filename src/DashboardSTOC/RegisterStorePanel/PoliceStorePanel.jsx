import { useState, useEffect } from "react";
import IR from "./RegisterStoreButton.module.css";
import AdminVerify from "../../Others/AdminPassword.jsx";

function PoliceAccs({ closePanel }) {
    const [policeAccounts, setPoliceAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [targetDeleteId, setTargetDeleteId] = useState(null);

    useEffect(() => {
        fetchPoliceAccounts();
    }, []);

    const fetchPoliceAccounts = () => {
        setLoading(true);
        fetch("https://backendthirdv-n0dx.onrender.com/api/police-accounts")
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then((data) => setPoliceAccounts(data))
            .catch((error) => console.error("Error fetching police accounts:", error))
            .finally(() => setLoading(false));
    };

    const confirmDelete = (id) => {
        setTargetDeleteId(id);
        setShowAdminPanel(true);
    };

    const handleVerifiedDelete = async () => {
        try {
            const response = await fetch(`https://backendthirdv.onrender.com/api/delete-police/${targetDeleteId}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error(`Failed to delete. Status: ${response.status}`);
            setPoliceAccounts(prev => prev.filter(entry => entry.stoc_ID !== targetDeleteId));
        } catch (error) {
            console.error("Error deleting:", error);
        } finally {
            setTargetDeleteId(null);
        }
    };

    return (
        <div className={IR.overlay}>
            <div className={IR.floatingPanel}>
                <button className={IR.closeButton} onClick={closePanel}>✖</button>
                <h2 className={IR.title}>Authorized Admin</h2>

                {loading ? (
                    <p className={IR.loading}>Loading...</p>
                ) : (
                    <div className={IR.tableContainer}>
                        <table className={IR.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Contact</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {policeAccounts.length > 0 ? (
                                    policeAccounts.map((entry) => (
                                        <tr key={entry.stoc_ID}>
                                            <td>{entry.stoc_ID}</td>
                                            <td>{entry.username}</td>
                                            <td>{entry.stoc_contact}</td>
                                            <td>{entry.stoc_email}</td>
                                            <td>
                                                <button className={IR.deleteButton} onClick={() => confirmDelete(entry.stoc_ID)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No registered accounts found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showAdminPanel && (
                <AdminVerify
                    closePanel={() => setShowAdminPanel(false)}
                    onVerified={handleVerifiedDelete}
                />
            )}
        </div>
    );
}

export default PoliceAccs;
