import express from 'express';
import cors from 'cors';
import pool from './db.js';
import http from 'http';
import exceljs from "exceljs";
import { Server } from 'socket.io';
import { createServer } from 'http';

const now = new Date();
const formattedDate = now.toISOString().split('T')[0];
const filename = `Incident_Report_${formattedDate}.xlsx`;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*",
        methods: ["GET", "POST"]
     }
});

app.use(express.json());
app.use(cors());

// 🛠 FETCH MYSQL DATA TO EXCEL

// 🛠 LOGIN API STOC
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const [results] = await pool.execute(
            'SELECT * FROM STOC_ACCOUNTS WHERE username = ? AND password = ?',
            [username, password]
        );

        if (results.length > 0) {
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// 🛠 LOGIN API STORE
app.post('/api/login2', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and Password are required' });
    }

    try {
        const [results] = await pool.execute(
            'SELECT * FROM STORE_ACCOUNTS WHERE username = ? AND password = ?',
            [username, password]
        );

        if (results.length > 0) {
            res.json({ message: 'Login successful', store_ID: results[0].store_ID });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// 🛠 REGISTER A STORE ACCOUNT
app.post('/api/register', async (req, res) => {
    const { username, password, store_name, store_location, store_contact } = req.body;

    try {
        // 🛠 Insert new account into STORE_ACCOUNTS table
        await pool.execute(
            `INSERT INTO STORE_ACCOUNTS (username, password, store_name, store_location, store_contact)
             VALUES (?, ?, ?, ?, ?)`,
            [username, password, store_name, store_location, store_contact]
        );

        res.status(201).json({ message: 'Account registered successfully!' });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// 🛠 REGISTER A POLICE ACCOUNT
app.post("/register-police", async (req, res) => {
    const { username, password, stoc_contact, stoc_email } = req.body;

    if (!username || !password || !stoc_contact || !stoc_email) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const [existingUser] = await pool.query(
            "SELECT * FROM STOC_ACCOUNTS WHERE username = ? OR stoc_email = ?",
            [username, stoc_email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Username or email already exists." });
        }

        await pool.query(
            "INSERT INTO STOC_ACCOUNTS (username, password, stoc_contact, stoc_email) VALUES (?, ?, ?, ?)",
            [username, password, stoc_contact, stoc_email]
        );

        res.status(201).json({ message: "Police account registered successfully!" });
    } catch (err) {
        console.error("❌ Error registering police account:", err);
        res.status(500).json({ error: "Database error occurred." });
    }
});

// 🛠 GET STOC INCIDENT HISTORY
app.get('/api/detection-history', async (req, res) => {
    const { search } = req.query; 
    console.log('Received search query:', search);

    try {
        let query = 'SELECT * FROM STOC_DETECTION_HISTORY';
        const params = [];

        if (search) {
            query += ' WHERE store_name LIKE ? OR location LIKE ? OR store_contact LIKE ? OR threat_level LIKE ? OR detection_type LIKE ? OR shared_detection_id ?';
            const searchTerm = `%${search}%`; 
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        console.log('Executing query:', query, 'with params:', params); 

        const [results] = await pool.execute(query, params);
        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Error retrieving history' });
    }
});

// 🛠 GET REPORT COUNT FOR LAST 4 MONTHS (BAR GRAPH)
app.get('/api/reports-per-month', async (req, res) => {
    try {
        const lastFourMonths = [];
        const currentDate = new Date();

        // Generate the last 4 months dynamically
        for (let i = 3; i >= 0; i--) {
            const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            lastFourMonths.push({
                monthNumber: targetMonth.getMonth() + 1, // 1-based month number
                monthName: targetMonth.toLocaleString("default", { month: "short" }), // "Jan", "Feb", etc.
                count: 0
            });
        }

        // Query the database for report counts in the last 4 months
        const query = `
            SELECT MONTH(date) AS monthNumber, COUNT(*) AS count
            FROM STOC_DETECTION_HISTORY
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 4 MONTH)
            GROUP BY MONTH(date)
            ORDER BY MONTH(date);
        `;
        const [rows] = await pool.execute(query);

        // Merge database results into lastFourMonths array
        lastFourMonths.forEach(month => {
            const found = rows.find(row => row.monthNumber === month.monthNumber);
            if (found) month.count = found.count;
        });

        res.json(lastFourMonths);
    } catch (error) {
        console.error("❌ Error fetching monthly reports:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// 🛠 GET REPORT COUNT BY LOCATION (FOR PIE CHART)
app.get('/api/reports-by-location', async (req, res) => {
    try {
        const query = `
            SELECT store_location, COUNT(*) AS count
            FROM STOC_DETECTION_HISTORY
            GROUP BY store_location
        `;
        const [results] = await pool.query(query);

        if (!results.length) {
            return res.status(404).json({ message: "No data found" });
        }

        const locationData = results.map(row => ({
            name: row.store_location,
            value: row.count
        }));

        res.json(locationData);
    } catch (error) {
        console.error("❌ Error fetching location data:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// 🛠 STORE INCIDENT HISTORY
app.get('/api/incident-history/:storeID', async (req, res) => {
    const { storeID } = req.params; 
    const { search } = req.query; 

    try {
        let query = `SELECT * FROM STORE_DETECTION_HISTORY WHERE store_ID = ?`;
        const params = [storeID];

        if (search) {
            query += ' AND (date LIKE ? OR time LIKE ? OR threat_level LIKE ? OR detection_type LIKE ? OR shared_detection_id LIKE ?)';
            const searchTerm = `%${search}%`; 
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        console.log('Executing query:', query, 'with params:', params); 

        const [rows] = await pool.execute(query, params);
        res.json(rows);

    } catch (error) {
        console.error('Error fetching incident history:', error); 
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// 🛠 DELETE STORE ACCOUNT
app.delete('/api/delete-store/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Deleting store ID:", id);
    try {
        const [result] = await pool.execute('DELETE FROM STORE_ACCOUNTS WHERE store_ID = ?', [id]);

        if (result.affectedRows > 0) {
            res.json({ message: 'Account deleted successfully' });
        } else {
            res.status(404).json({ message: 'Account not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

//DELETE POLICE ACCOUNT
app.delete('/api/delete-police/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Deleting stoc ID:", id);
    try {
        const [result] = await pool.execute('DELETE FROM STOC_ACCOUNTS WHERE stoc_ID = ?', [id]);

        if (result.affectedRows > 0) {
            res.json({ message: 'Account deleted successfully' });
        } else {
            res.status(404).json({ message: 'Account not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// 🛠 GET STORE ACCOUNTS
app.get('/api/store-accounts', async (req, res) => {
    try {
        const [results] = await pool.execute('SELECT * FROM STORE_ACCOUNTS');
        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Error retrieving store accounts' });
    }
});

// 🛠 GET POLICE ACCOUNTS
app.get('/api/police-accounts', async (req, res) => {
    try {
        const [results] = await pool.execute('SELECT * FROM STOC_ACCOUNTS');
        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Error retrieving store accounts' });
    }
});

// 🛠 REPORT COUNT STOC 
app.get('/api/history-count', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) AS total_rows FROM STOC_DETECTION_HISTORY');
        res.json({ count: rows[0].total_rows });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// 🛠 REPORT COUNT STORE
app.get('/api/history-count2/:storeID', async (req, res) => {
    try {
        const storeID = req.params.storeID; 
        console.log("Received storeID:", storeID); 

        if (!storeID) {
            return res.status(400).json({ message: "Missing storeID parameter" });
        }

        const [rows] = await pool.execute(
            'SELECT COUNT(*) AS total_rows FROM STORE_DETECTION_HISTORY WHERE store_ID = ?',
            [storeID]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "No records found for this store" });
        }

        res.json({ count: rows[0].total_rows });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// 🛠 REPORT COUNT STORE (MONTH)
app.get('/api/report-count-per-month/:storeID', async (req, res) => {
    try {
        const storeID = req.params.storeID;
        console.log("📡 Received storeID:", storeID);

        if (!storeID) {
            return res.status(400).json({ message: "❌ Missing storeID parameter" });
        }

        const query = `
            SELECT 
                MONTHNAME(date) AS month, 
                COUNT(*) AS count 
            FROM STORE_DETECTION_HISTORY  
            WHERE store_ID = ? 
              AND YEAR(date) = YEAR(CURDATE())  
            GROUP BY MONTH(date) 
            ORDER BY MONTH(date) ASC
        `;

        const [rows] = await pool.execute(query, [storeID]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "❌ No records found for this store" });
        }

        console.log("✅ Report Data Retrieved:", rows);
        res.json(rows);
    } catch (error) {
        console.error("❌ Database error:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
});

// 🛠 GET LIVE STREAM URL BY STORE_ID
app.get('/api/live-stream/:storeID', async (req, res) => {
    const { storeID } = req.params;  

    if (!storeID) {
        return res.status(400).json({ message: "Missing store ID" });
    }

    try {
        const [rows] = await pool.execute(
            'SELECT live_url FROM STORE_ACCOUNTS WHERE store_ID = ? LIMIT 1',
            [storeID]
        );

        if (rows.length > 0) {
            res.json({ live_url: rows[0].live_url });
        } else {
            res.status(404).json({ message: "Live stream not found" });
        }
    } catch (error) {
        console.error("Error fetching live stream URL:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
});

// 🛠 LOG DELETE STOC INCIDENT RECORD
app.get('/api/delete-history', async (req, res) => {
    try {
        const query = 'SELECT * FROM STOC_EDIT_HISTORY ORDER BY date_deleted DESC, time_deleted DESC';
        const [results] = await pool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching delete history:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// 🛠 DELETE STOC INCIDENT RECORD
app.delete('/api/delete-detection/:id', async (req, res) => {
    const detectionId = req.params.id;

    try {
        const query = 'SELECT * FROM STOC_DETECTION_HISTORY WHERE detection_ID = ?';
        const [result] = await pool.query(query, [detectionId]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        const { store_ID, date, time } = result[0];
        const currentDate = new Date();
        const dateDeleted = currentDate.toISOString().split('T')[0]; 
        const timeDeleted = currentDate.toTimeString().split(' ')[0];

        const insertQuery = `
            INSERT INTO STOC_EDIT_HISTORY (date_deleted, time_deleted, detection_ID, date, time, store_ID)
            VALUES (?, ?, ?, ?, ?, ?)`;
        await pool.query(insertQuery, [dateDeleted, timeDeleted, detectionId, date, time, store_ID]);

        const deleteQuery = 'DELETE FROM STOC_DETECTION_HISTORY WHERE detection_ID = ?';
        await pool.query(deleteQuery, [detectionId]);

        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// 🛠 LOG DELETE STORE INCIDENT RECORD
app.get('/api/deleted-history2/:storeID', async (req, res) => {
    const { storeID } = req.params;

    try {
        const query = 'SELECT * FROM STORE_DELETE_HISTORY WHERE store_ID = ? ORDER BY date_deleted DESC, time_deleted DESC';
        const [results] = await pool.query(query, [storeID]);
        res.json(results);
    } catch (error) {
        console.error('Error fetching delete history:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// 🛠 DELETE STORE INCIDENT RECORD
app.delete('/api/delete-detection2/:storeID/:detectionID', async (req, res) => {
    const { storeID, detectionID } = req.params.id;

    try {
        const query = 'SELECT * FROM STORE_DETECTION_HISTORY WHERE detection_ID = ? AND store_ID = ?';
        const [result] = await pool.query(query, [detectionID, storeID]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        // Log deletion
        const { storeID, date, time } = result[0];
        const currentDate = new Date();
        const dateDeleted = currentDate.toISOString().split('T')[0];
        const timeDeleted = currentDate.toTimeString().split(' ')[0];

        const insertQuery = `
            INSERT INTO STORE_DELETE_HISTORY (date_deleted, time_deleted, detection_ID, date, time, store_ID)
            VALUES (?, ?, ?, ?, ?, ?)`;
        await pool.query(insertQuery, [dateDeleted, timeDeleted, detectionID, date, time, storeID]);
        
        const deleteQuery = 'DELETE FROM STORE_DETECTION_HISTORY WHERE detection_ID = ? AND store_ID = ?';
        await pool.query(deleteQuery, [detectionID, storeID]);

        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

//AUTODELETE FUNCTION
const deleteOldRecords = async () => {
    try {
        const query = `
            DELETE FROM STOC_EDIT_HISTORY 
            WHERE date_deleted < DATE_SUB(NOW(), INTERVAL 2 DAY)
        `;
        const [result] = await pool.query(query);
        console.log(`Auto-deleted ${result.affectedRows} records from STOC_EDIT_HISTORY`);
    } catch (error) {
        console.error("Error deleting old records:", error);
    }
};
    setInterval(deleteOldRecords, 24 * 60 * 60 * 1000);
    deleteOldRecords();

// 🛠 PERMANENT DELETION
app.post('/api/delete-permanent', async (req, res) => {
    const { password, detection_ID } = req.body;

    if (!password || !detection_ID) {
        return res.status(400).json({ message: 'Password and detection ID are required' });
    }

    try {
        // Check if the password exists in STOC_ACCOUNTS
        const [results] = await pool.execute(
            'SELECT * FROM STOC_ACCOUNTS WHERE password = ? LIMIT 1',
            [password]
        );

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Perform the permanent delete operation
        const [deleteResult] = await pool.execute(
            'DELETE FROM STOC_EDIT_HISTORY WHERE detection_ID = ?',
            [detection_ID]
        );

        if (deleteResult.affectedRows > 0) {
            res.json({ message: 'Delete Success!' });
        } else {
            res.status(404).json({ message: 'Detection record not found' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

//EXPORT TO EXCEL
app.get("/api/export-excel", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM STOC_DETECTION_HISTORY");

        if (rows.length === 0) {
            return res.status(404).json({ message: "No records found" });
        }

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("Incident History");

        worksheet.columns = [
            { header: "ID", key: "shared_detection_id", width: 10 },
            { header: "Store ID", key: "store_ID", width: 15 },
            { header: "Store Name", key: "store_name", width: 20 },
            { header: "Location", key: "store_location", width: 20 },
            { header: "Contact", key: "store_contact", width: 15 },
            { header: "Date", key: "date", width: 15 },
            { header: "Time", key: "time", width: 15 },
            { header: "Threat Level", key: "threat_level", width: 15 },
            { header: "Type", key: "detection_type", width: 15 }
        ];

        rows.forEach(row => {
            worksheet.addRow(row);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Incident_Report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//WATCHING NEW INCOMING DETECTION (STOC)
app.get('/latest-reports', async (req, res) => {
    const query = `
        SELECT * FROM STOC_DETECTION_HISTORY
        ORDER BY date DESC, time DESC
        LIMIT 2
    `;

    try {
        const [results] = await pool.query(query);
        if (results.length === 0) {
            return res.status(404).json({ message: "No reports found" });
        }
        console.log("✅ Latest Reports Retrieved:", results);
        res.json(results);
    } catch (err) {
        console.error("❌ Database Query Error:", err.message);
        res.status(500).json({ error: `Database query failed: ${err.message}` });
    }
});

//WATCHING NEW INCOMING DETECTION (STORE)
app.get('/latest-reports2', async (req, res) => {
    const query = `
        SELECT * FROM STORE_DETECTION_HISTORY
        ORDER BY date DESC, time DESC
        LIMIT 2
    `;

    try {
        const [results] = await pool.query(query);
        if (results.length === 0) {
            return res.status(404).json({ message: "No reports found" });
        }
        console.log("✅ Latest Reports Retrieved:", results);
        res.json(results);
    } catch (err) {
        console.error("❌ Database Query Error:", err.message);
        res.status(500).json({ error: `Database query failed: ${err.message}` });
    }
});


//NEW INCOMING 1ST WARNING DETECTION (STORE)
app.get('/api/face-cover-warnings/:storeID', async (req, res) => {
    try {
        const storeID = req.params.storeID;

        if (!storeID) {qqqq
            return res.status(400).json({ message: "Missing storeID parameter" });
        }

        const [rows] = await pool.execute(
            'SELECT date, time, store_location FROM STORE_DETECTION_HISTORY WHERE store_ID = ? AND threat_level = ?',
            [storeID, '1st Warning']
        );

        res.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Socket.IO: Handle Client Connection
io.on("connection", (socket) => {
    console.log("🟢 User Connected to WebSocket");

    socket.on("disconnect", () => {
        console.log("🔴 User Disconnected from WebSocket");
    });
});

// 🛠 START SERVER
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
