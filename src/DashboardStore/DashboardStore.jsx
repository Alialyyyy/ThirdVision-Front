import styles from './DashboardStore.module.css';
import { useNavigate } from 'react-router-dom';
import LiveStream from './LiveStream.jsx';
import Status from './Status.jsx';
import { useState, useEffect } from 'react';
import IncidentHistory from './IncidentHistory.jsx';
import DeletedHistory from './DeletedHistory.jsx';
import Sidebar from './Sidebar/Sidebar.jsx';xcxx
    }

    useEffect(() => {
        const storedStoreID = localStorage.getItem('store_ID'); 
        if (storedStoreID) {
            setStoreID(storedStoreID);
        } else {
            console.error('No store ID found in local storage');
            navigate('/'); 
        }
    }, [navigate]); 
    
    return (
        <div className={styles.MainBg}>
            {/* Sidebar */}
            <Sidebar setActivePanel={setActivePanel}  storeID={storeID}/>

            {/* Dashboard Content */}
            <div className={styles.dashboardContent}>
                {/* Display selected sidebar panel */}
                {activePanel === "DashboardStore" && (<IncidentHistory closePanel={() => setActivePanel(null)} />)}
                {activePanel === "DashboardStore" && (<EditHistory closePanel={() => setActivePanel(null)} />)}
                {activePanel === "DashboardStore" && (<DeletedHistory closePanel={() => setActivePanel(null)} />)}                                                      

                {/* Always Visible on Dashboard */}
            <div>
                <div className={styles.dashboardContainer}>
                    <LiveStream storeID={storeID} />
                    <Status storeID={storeID} />
                </div>
                <div>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
}

export default DashboardStore;
