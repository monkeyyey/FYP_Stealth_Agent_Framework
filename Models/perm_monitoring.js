const db = require('../Models/DatabaseConfig');


module.exports = {
    getLogs: function (agent_name, callback) {

        let conn = db.getConnection();
        if (agent_name == "all") {
            conn.connect((err) => {
                if (err) return callback(err, null);
                let sql = `SELECT * FROM agent.file_permission`;
                conn.query(sql, (err, results) => {
                    conn.end();
                    if (err) return callback(err, null);
                    if (results.length < 1) return callback(null, null);
                    else {
                        return callback(null, results)
                    }
                });
            });
        }
        else {
            conn.connect((err) => {
                if (err) return callback(err, null);
                let sql = `SELECT * FROM agent.file_permission WHERE agent_name = ?`;
                conn.query(sql, [agent_name], (err, results) => {
                    conn.end();
                    if (err) {
                        console.log(err)
                        return callback(err, null);
                    }
                    else {
                        return callback(null, results)
                    }
                });
            });
        }
    },

    getRisk: function (details, callback) {
        let conn = db.getConnection();
        nickname = details.nickname
        risk = '--' + details.risk + '--'

        if (nickname == "all" && risk == "--all--") {
            conn.connect((err) => {
                if (err) return callback(err, null);
                let sql = `SELECT * FROM agent.file_permission`;
                conn.query(sql, (err, results) => {
                    conn.end();
                    if (err) return callback(err, null);
                    if (results.length < 1) return callback(null, null);
                    else {
                        return callback(null, results)
                    }
                });
            });
        }
        else if (nickname == "all" && risk != "--all--") {
            let conn = db.getConnection();
            conn.connect((err) => {
                if (err) return callback(err, null);
                let sql = `SELECT * FROM agent.file_permission WHERE risk = ?`;
                conn.query(sql, [risk], (err, results) => {
                    conn.end();
                    if (err) {
                        console.log(err)
                        return callback(err, null);
                    }
                    else {
                        return callback(null, results)
                    }
                });
            });
        } else if (risk == "--all--" && nickname != "all") {
            let conn = db.getConnection();
            conn.connect((err) => {
                if (err) return callback(err, null);
                let sql = `SELECT * FROM agent.file_permission WHERE agent_name = ?`;
                conn.query(sql, [nickname], (err, results) => {
                    conn.end();
                    if (err) {
                        console.log(err)
                        return callback(err, null);
                    }
                    else {
                        return callback(null, results)
                    }
                });
            });
        } else {
            let conn = db.getConnection();
            conn.connect((err) => {
                if (err) return callback(err, null);
                let sql = `SELECT * FROM agent.file_permission WHERE agent_name = ? AND risk = ?`;
                conn.query(sql, [nickname, risk], (err, results) => {
                    conn.end();
                    if (err) {
                        console.log(err)
                        return callback(err, null);
                    }
                    else {
                        return callback(null, results)
                    }
                });
            });
        }
    },


    postLogs: function (details, callback) {
        let conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {//database connection gt issue!
                console.log(err);
                return callback(err);
            }
            else {
                const sql =
                    `INSERT INTO agent.file_permission (agent_name, ip_address, details, created_at, risk) VALUES (?, ?, ?, ?, ?);`;
                conn.query(
                    sql,
                    [details.name, details.ipaddr, details.command, details.created_at, details.risk],
                    (err) => {
                        conn.end();
                        if (err) {
                            return callback(err);
                        };
                        return callback(null);
                    });
            };
        });
    },

    getNames: function (callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err);
            let sql = `SELECT agent_name FROM agent.agents`;
            conn.query(sql, (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                if (results.length < 1) return callback(null, null);
                else {
                    return callback(null, results)
                }
            });
        });
    },

    getHistory: function (callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
            let sql = `SELECT * FROM agent.resolved`;
            conn.query(sql, (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                if (results.length < 1) return callback(null, null);
                else {
                    return callback(null, results)
                }
            });
        });
    },

    getFirstLog: function (callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err);
            let sql = `SELECT created_at FROM file_permission ORDER BY created_at ASC LIMIT 1`;
            conn.query(sql, (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                if (results.length < 1) return callback(null, null);
                else {
                    return callback(null, results)
                }
            });
        });
    },
    flagResolved: function (details, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err);
            let sql = "UPDATE file_permission SET risk = ? WHERE log_id = ?";

            conn.query(sql, ["--resolved--", details.log_id], (err, results) => {
                if (err) return callback(err, null);
                if (results.length < 1) return callback(null, null);
                else {
                    let sql = "INSERT INTO resolved (log_id_fk, risk, userid_fk, username, resolved_at) VALUES (?, ?, ?, ?, ?);";
                    conn.query(
                        sql,
                        [details.log_id, "--resolved--", details.userid, details.username, details.timestamp],
                        (err) => {
                            conn.end();
                            if (err) {
                                return callback(err);
                            };
                        });

                    return callback(null, results)
                }
            });
        });

    },
}

