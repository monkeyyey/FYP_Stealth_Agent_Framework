const db = require('./DatabaseConfig');
module.exports = {
    
    get_agents: function(callback){
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
            let sql = `SELECT agent_id, agent_ip, agent_name, scope, last_process_report, last_status_update, uptime, port_number FROM agent.agents`;
            conn.query(sql,(err, results) => {
                conn.end();
                if (err) {
                    return callback(err, null);
                }
                else{
                    return callback(null, results)
                }
            });
        });
    },
    getAgentByID: function(id, callback){
        let conn = db.getConnection();
        console.log(id)
        conn.connect((err) => {
            if (err) return callback(err, null);
            let sql = `SELECT agent_name, passcode, agent_ip FROM agent.agents WHERE agent_id = ?`;
            let params = [id];
            conn.query(sql, params,(err, results) => {
                conn.end();
                console.log(results)
                if (err) {
                    return callback(err, null);
                }
                else{
                    return callback(null, results)
                }
            });
        }); 
    }, 

    getAgentByName: function(agent, callback){
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
            let sql = `SELECT agent_name, passcode, agent_ip FROM agent.agents WHERE agent_name = ?`;
            let params = [agent];
            conn.query(sql, params,(err, results) => {
                conn.end();
                if (err) {
                    return callback(err, null);
                }
                else{
                    return callback(null, results)
                }
            });
        });
    }, 
    agent_creation: function (agent_name, passcode, username, password, callback) {
        let conn = db.getConnection();
        conn.connect((error) => {
            if (error) {
                console.log(error)
                return callback(error,null)
            }
            let sql = `SELECT username FROM agent.admins WHERE username = ? and password = ?`;
            conn.query(sql, [username, password], (err, results) => {
                if (err) {
                    conn.end();
                    console.log(err)
                    return callback(err, null);
                }
                if (results.length == 0){
                    conn.end();
                    console.log("auth")
                    return callback(null, "Authentication failed")
                }
                let sql = `INSERT INTO agent.agents(agent_name, passcode, online) VALUES(?, ?, ?)`;
                conn.query(sql, [agent_name, passcode, 0], (err) => {
                    conn.end();
                    if (err) {
                        console.log(err)
                        return callback(err, null);
                    }
                    return callback(null, 1)
                    
                });
            })
        });
    },
    delete_agent: function (agent_name, username, password, callback){
        let conn = db.getConnection();
        conn.connect((error) => {
            if (error) {
                console.log(error)
                return callback(error,null)
            }
            let sql = `SELECT username FROM agent.admins WHERE username = ? and password = ?`;
            conn.query(sql, [username, password], (err, results) => {
                if (err) {
                    conn.end();
                    console.log(err)
                    return callback(err, null);
                }
                if (results.length == 0){
                    conn.end();
                    console.log("auth")
                    return callback(null, "Authentication failed")
                }
                let delete_sql = `DELETE from agent.agents WHERE agent_name = ?`
                conn.query(delete_sql, [agent_name], (err2) => {
                    conn.end();
                    if (err2) {
                        console.log(err2)
                        return callback(err2, null);
                    }
                    return callback(null, null)
                })
                
            });
        });
    },
    agent_authentication: function(agent_name, passcode, scope, port_number, callback){
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
            let sql = `SELECT passcode FROM agent.agents WHERE agent_name = ?`;
            conn.query(sql, [agent_name], (err, results) => {
                if (err) {
                    conn.end()
                    return callback(err,null);
                }
                if (results.length < 1){
                    conn.end()
                    return callback(err,null);
                } 
                if (results[0]['passcode'] != passcode){
                    conn.end()
                    return callback(err,null)
                }
                if (results[0]['passcode'] == passcode) {
                    let sql2 = `UPDATE agent.agents SET scope = ?, port_number = ? WHERE agent_name = ?`;
                    conn.query(sql2, [scope, port_number, agent_name], (err) => {
                        conn.end();
                        if (err) {
                            console.log(err)
                            return callback(err, null);
                        }
                        else {
                            return callback(null, null);
                        }
                    });
                }
            });
        });
    },
    update_ip: function (agent_ip, agent_name, passcode, uptime, port_number, callback){
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
            let sql = `SELECT agent_ip FROM agent.agents WHERE agent_name = ? and passcode = ?`;
            conn.query(sql, [agent_name, passcode], (err, results) => {
                if (err) {
                    conn.end()
                    return callback(err);
                }
                if (results.length < 1){
                    conn.end()
                    return callback(null);
                } 
                else {
                    var date = new Date,
                    date = date.getFullYear() + '-' +
                    ('00' + (date.getMonth()+1)).slice(-2) + '-' +
                    ('00' + date.getDate()).slice(-2) + ' ' + 
                    ('00' + date.getHours()).slice(-2) + ':' + 
                    ('00' + date.getMinutes()).slice(-2) + ':' + 
                    ('00' + date.getSeconds()).slice(-2) + '|' +
                    Math.floor(Date.now() / 1000)
                    console.log(date)
                    let sql2 = `UPDATE agent.agents SET agent_ip = ?, online = ?, last_status_update = ?, uptime = ?, port_number = ? WHERE agent_name = ?`;
                    conn.query(sql2, [agent_ip, 2, date, uptime, port_number, agent_name], (err) => {
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

    change_status: function (status, agent_ip, agent_name, callback){
        let conn = db.getConnection();
        conn.connect((error) => {
            if (error){
                console.log(error)
                return callback(error, 'unreachable')
            };
            let sql = `Update agent.agents set online = ?, agent_ip = ? WHERE agent_name = ?`;
                conn.query(sql, [status, agent_ip, agent_name], (err) => {
                    conn.end();
                    if (err) {
                        console.log(err)
                        return callback(err, 'unreachable')
                    }
                    if (status == 2){
                        return callback(null, 'running')
                    }
                    if (status == 1){
                        return callback(null, 'reachable')
                    }
                    if (status == 0){
                        return callback(null, 'unreachable')
                    }
                    
                });
            
        });
    },
}
