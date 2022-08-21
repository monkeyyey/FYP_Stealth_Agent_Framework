const database = require('./DatabaseConfig');

const custom = {
    findbyAgent: function (agent_name,callback) {
        let conn = database.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);

            let sql = `SELECT * FROM scripts_sent WHERE scripts_sent.agent_name = ?`;
            conn.query(sql, [agent_name], (err, results) => {
                conn.end();
                callback(err, results);
            });
        });
    },
    insert: function (data, callback) {
        let conn = database.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
            console.log(data);
            let sql = `INSERT INTO agent.scripts_sent (agent_name, script_sent, status, date, sent_by) VALUES (?, ?, ?, ?, ?)`;
            let params = [data.agent_name, data.file, data.status, data.date, data.sent_by];
            conn.query(sql, params, (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                callback(null, { id: results.insertId });
            });
        });
    },
}

module.exports = custom;