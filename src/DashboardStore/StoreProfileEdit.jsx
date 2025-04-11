import React from 'react';
import styles from './StoreProfileEdit.module.css'; // Assuming you have styles for this component

function StoreProfileEdit({
    passwordInput,
    setPasswordInput,
    handlePasswordSubmit,
    isPasswordCorrect,
    setIsPasswordCorrect,
    setShowPasswordVerification
}) {
    return (
        <div className={styles.overlay}>
            <div className={styles.panel}>
                <h3>Enter Password to Edit</h3>
                <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className={styles.input}
                />
                <button onClick={handlePasswordSubmit} className={styles.submitButton}>Submit</button>
                {!isPasswordCorrect && <p className={styles.error}>Incorrect password. Try again.</p>}
                <button onClick={() => setShowPasswordVerification(false)} className={styles.closeButton}>Cancel</button>
            </div>
        </div>
    );
}

export default StoreProfileEdit;