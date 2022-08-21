const db = require('./DatabaseConfig');

module.exports = {
    agent_creation: function (agent_ip, agent_nickname, passcode, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err);
            let sql = `INSERT INTO agent.agents(agent_ip, agent_nickname, passcode, online) VALUES(?, ?, ?, ?)`;
            conn.query(sql, [agent_ip, agent_nickname, passcode, 0], (err) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                return callback(null)
                
            });
        });
    },
    update_ip: function (agent_ip, agent_nickname, passcode, callback){
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
            let sql = `SELECT agent_ip FROM agent.agents WHERE agent_nickname = ? and passcode = ?`;
            conn.query(sql, [agent_nickname, passcode], (err, results) => {
                if (err) {
                    conn.end()
                    this.mark_offline(agent_nickname, passcode)
                    return callback(err);
                }
                if (results.length < 1){
                    conn.end()
                    this.mark_offline(agent_nickname, passcode)
                    return callback(null);
                } 
                else {
                    let sql2 = `UPDATE agent.agents SET agent_ip = ?, online = ? WHERE agent_nickname = ?`;
                    conn.query(sql2, [agent_ip, 1, agent_nickname], (err) => {
                        conn.end();
                        if (err) {
                            console.log(err)
                            return callback(err);
                        }
                        else {
                            return callback(null);
                        }
                    });
                }
            });
        });
    },
    mark_offline_inbuilt: function (agent_nickname, passcode){
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err){
                console.log(err)
                return
            };
            let sql = `Update agent.agents set online = ? WHERE agent_nickname = ? and passcode = ?`;
            conn.query(sql, [0, agent_nickname, passcode], (err) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return
                }
                return
            });
        });
    },
    mark_offline_manual: function (agent_ip, agent_nickname, passcode, callback){
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err){
                console.log(err)
                return callback(err)
            };
            let sql = `Update agent.agents set online = ?, agent_ip = ? WHERE agent_nickname = ? and passcode = ?`;
            conn.query(sql, [0, agent_ip, agent_nickname, passcode], (err) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err)
                }
                return callback(null)
            });
        });
    },
    change_status: function (status, agent_ip, agent_nickname, callback){
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err){
                console.log(err)
                return callback(err)
            };
            let sql = `Update agent.agents set online = ?, agent_ip = ? WHERE agent_nickname = ?`;
            conn.query(sql, [status, agent_ip, agent_nickname], (err) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err)
                }
                return callback(null)
            });
        });
    },
}
