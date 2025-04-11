import { useState, useEffect } from "react";
import IR from "./RegisterStoreButton.module.css";
import AdminVerify from "../../Others/AdminPassword.jsx";

function RegisterStorePanel({ closePanel }) {
    const [storeAccounts, setStoreAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showVerify, setShowVerify] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => {
        fetchStoreAccounts();
    }, []);

    const fetchStoreAccounts = () => {
        setLoading(true);
        fetch("http://localhost:5001/api/store-accounts")
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then((data) => setStoreAccounts(data))
            .catch((error) => console.error("Error fetching store accounts:", error))
            .finally(() => setLoading(false));
    };

    const confirmDelete = (id) => {
        setPendingDeleteId(id);
        setShowVerify(true);
    };

    const onVerified = () => {
        if (pendingDeleteId !== null) {
            handleDelete(pendingDeleteId);
            setPendingDeleteId(null);
        }
        setShowVerify(false);
    };

    const onCloseVerify = () => {
        setShowVerify(false);
        setPendingDeleteId(null);
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5001/api/delete-store/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error(`Failed to delete account. Status: ${response.status}`);
            setStoreAccounts((prev) => prev.filter((entry) => entry.store_ID !== id));
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    return (
        <div className={IR.overlay}>
            <div className={IR.floatingPanel}>
                <button className={IR.closeButton} onClick={closePanel}>✖</button>
                <h2 className={IR.title}>Registered Accounts</h2>

                {loading ? (
                    <p className={IR.loading}>Loading...</p>
                ) : (
                    <div className={IR.tableContainer}>
                        <table className={IR.table}>
                            <thead>
                                <tr>
                                    <th>ThirdVision ID</th>
                                    <th>Store Name</th>
                                    <th>Store Address</th>
                                    <th>Location</th>
                                    <th>Contact</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {storeAccounts.length > 0 ? (
                                    storeAccounts.map((entry) => (
                                        <tr key={entry.store_ID}>
                                            <td>{entry.username}</td>
                                            <td>{entry.store_name}</td>
                                            <td>{entry.store_address}</td>
                                            <td>{entry.store_location}</td>
                                            <td>{entry.store_contact}</td>
                                            <td>
                                                <button
                                                    className={IR.deleteButton}
                                                    onClick={() => confirmDelete(entry.store_ID)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No registered accounts found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {showVerify && <AdminVerify closePanel={onCloseVerify} onVerified={onVerified} />}
        </div>
    );
}

export default RegisterStorePanel;
