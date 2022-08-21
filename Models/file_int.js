const db = require('./DatabaseConfig');

module.exports = {
    file_int: function (data, agent_name, ip_address, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            let sql = `INSERT INTO agent.file_integrity(agent_name, ip_address, filename, action) VALUES (?, ?, ?, ?)`;
            conn.query(sql, [agent_name, ip_address, data.filename, data.action], (err) => {
            // conn.query(sql, [data], (err) => {
                console.log(`line`);
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                conn.end();
                return callback(null)
            });
        });
    },

    getData: function (callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            let sql = `SELECT * from agent.file_integrity`;
            conn.query(sql, (err, result) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                return callback(err, result);
            });
        });
    },

    getActions: function (callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            let sql = `SELECT action from agent.file_integrity`;
            conn.query(sql, (err, result) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                return callback(err, result);
            });
        });
    },

    filterAction: function (action, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            let sql = `SELECT * from agent.file_integrity where action = ?`;
            conn.query(sql, [action], (err, result) => {
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
        console.log(search);
        console.log('heyyyyyy');
        conn.connect((err) => {
            let sql = `SELECT * from agent.file_integrity where id LIKE ? or agent_name LIKE ? or ip_address LIKE ? or filename LIKE ?`;
            search = '%' + search + '%';
            conn.query(sql, [search, search, search, search], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                console.log(result);
                return callback(err, result);
            });
        });
    },

    dateFilter: function (date, callback) {
        let conn = db.getConnection();
        console.log(date);
        console.log('heyyyyyy');
        conn.connect((err) => {
            let sql = `SELECT * from agent.file_integrity where created_at LIKE ?`;
            conn.query(sql, ['%' + date + '%'], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                console.log(result);
                return callback(err, result);
            });
        });
    }, 

    timeFilter: function (time, callback) {
        let conn = db.getConnection();
        console.log(time);
        conn.connect((err) => {
            let sql = `SELECT * from agent.file_integrity where created_at LIKE ?`;
            conn.query(sql, ['%' + time + '%'], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                console.log(result);
                return callback(err, result);
            });
        });
    }, 

    getAllAgents: function (callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            let sql = `SELECT agent_ip, agent_name from agent.agents WHERE online = 1`;
            conn.query(sql, [], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                console.log(result);
                return callback(err, result);
            });
        });
    }, 

    getAgentActions: function (agent, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            let sql = `SELECT action from agent.file_integrity where agent_name = ?`;
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
};