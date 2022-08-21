const db = require('./DatabaseConfig');

const Intrusion = {
    findAll: function (callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);

            let sql = `SELECT * FROM chkrootkit ORDER BY id DESC`;
            conn.query(sql, (err, results) => {
                conn.end();
                callback(err, results);
            });
        });
    },

    findAllAssociated: function (agent,callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);

            let sql = `SELECT * FROM chkrootkit WHERE chkrootkit.agent_name = ?`;
            conn.query(sql, [agent], (err, results) => {
                conn.end();
                callback(err, results);
            });
        });
    },

    findAllSnort: function (callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);

            let sql = `SELECT * FROM snort ORDER BY id DESC`;
            conn.query(sql, (err, results) => {
                conn.end();
                callback(err, results);
            });
        });
    },

    insert: function (data, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
            let sql = `INSERT INTO chkrootkit (ip_address, agent_name, results, report_id) VALUES (?, ?, ?, ?)`;
            let params = [data.agent_ip, data.agent_name ,data.text, data.report_id];
            conn.query(sql, params, (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                callback(null, { id: results.insertId });
            });
        });
    },

    insertSnort: function (data, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);

            let sql = `INSERT INTO snort (agent_ip, agent_name, datetime, src_port, dest_port, src_ip, dest_ip, priority, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            let params = [data.agent_ip, data.agent_name, data.datetime, data.src_port, data.dest_port, data.src_ip, data.dest_ip, data.priority, data.message];
            conn.query(sql, params, (err, results) => {
                conn.end();
                if (err) return callback(err, null);
            
                callback(null, { id: results.insertId });
            });
        });
    },
    insert_report: function (data, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
            let sql = "INSERT INTO chkrootkit_report(ip_address, agent_name, report) VALUES (?, ?, ?)";
            // let sql = `INSERT INTO chkrootkit_report (ip_addres, report) VALUES (?, ?, LOAD_FILE(?))`;
            let params = [data.ip_address, data.agent_name, data.file];
            conn.query(sql, params, (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                callback(null, { id: results.insertId });
            });
        });
    },
    findReport: function (report_id,callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);

            let sql = `SELECT report FROM chkrootkit_report WHERE chkrootkit_report.report_id = ?`;
            conn.query(sql, [report_id], (err, results) => {
                conn.end();
                callback(err, results);
            });
        });
    },

    findLatestReport: function (callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);

            let sql = `SELECT report FROM agent.chkrootkit_report ORDER BY report_id DESC LIMIT 1;`;
            conn.query(sql, (err, results) => {
                conn.end();
                callback(err, results);
            });
        });
    },

    filterAgent: function (agent, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            let sql = `SELECT * from agent.chkrootkit where agent_name = ? `;
            conn.query(sql, [agent], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                return callback(err, result);
            });
        });
    },

    filterSearch: function (search, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            let sql = `SELECT * from agent.chkrootkit where results LIKE ?`;
            search = '%' + search + '%';
            conn.query(sql, [search], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                return callback(err, result);
            });
        });
    },

    filterDate: function (date, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            let sql = `SELECT * from agent.chkrootkit where created_at LIKE ?`;
            conn.query(sql, [date + '%'], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                return callback(err, result);
            });
        });
    }, 



    

}

module.exports = Intrusion;