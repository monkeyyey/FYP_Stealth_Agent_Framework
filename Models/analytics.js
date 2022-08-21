const db = require('./DatabaseConfig');

module.exports = {
    get_cpu_mem: function (agent, callback) {
        let conn = db.getConnection();
        if (agent == "all"){
            conn.connect((err) => {
                if (err) return callback(err, null);
                let sql = `SELECT * FROM agent.security_analytics`;
                conn.query(sql,(err, results) => {
                    conn.end();
                    if (err) {
                        console.log(err)
                        return callback(err, null);
                    }
                    else{
                        return callback(null, results)
                    }
                });
            });
        }
        else{
            conn.connect((err) => {
                if (err) return callback(err, null);
                let sql = `SELECT * FROM agent.security_analytics WHERE agent_name = ?`;
                conn.query(sql, [agent],(err, results) => {
                    conn.end();
                    if (err) {
                        console.log(err)
                        return callback(err, null);
                    }
                    else{
                        return callback(null, results)
                    }
                });
            });
        }
        
    },
    insert_cpu_mem: function (agent, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err);
            let sql = `INSERT INTO agent.security_analytics(agent_name, cpu_usage, memory_usage) VALUES(?, ?, ?)`;
            cpu = agent.cpu.replace(/\D/g, "");
            data = agent.mem
            data = data.split("\\n")
            var memoryline = data[1]
            memoryline = memoryline.split(/\s+/)
            mem = (parseInt(memoryline[2])/parseInt(memoryline[1]))*100
            conn.query(sql, [agent.id, parseInt(cpu), parseInt(mem)], (err) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                return callback(null)
            });
        });
    },
    insert_process_list: function (agent_name, passcode, report, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err);
            let authenticate = `SELECT agents.passcode FROM agents WHERE agent_name = ?`
            conn.query(authenticate, [agent_name], (error, results) => {
                if (error){
                    conn.end()
                    return callback(error, null)
                }
                if (results[0]['passcode'] == passcode){
                    let sql = `SELECT process_reports.agent_name FROM process_reports WHERE agent_name = ?`
                    conn.query(sql, [agent_name], (err, results2) => {
                        if (err){
                            conn.end()
                            return callback(error, null)
                        }
                        if (results2.length == 0){
                            var sql2 = `INSERT INTO agent.process_reports(report, agent_name) VALUES(?, ?)`
                        }
                        else{
                            var sql2 = `UPDATE agent.process_reports SET report = ? WHERE agent_name = ?`
                        }
                        conn.query(sql2, [report, agent_name], (err2) => {
                            if (err2) {
                                conn.end();
                                console.log(err2)
                                return callback(err2, null);
                            }
                            var sql3 = `UPDATE agent.agents SET last_process_report = ? WHERE agent_name = ?`
                            var date = new Date,
                            date = date.getFullYear() + '-' +
                            ('00' + (date.getMonth()+1)).slice(-2) + '-' +
                            ('00' + date.getDate()).slice(-2) + ' ' + 
                            ('00' + date.getHours()).slice(-2) + ':' + 
                            ('00' + date.getMinutes()).slice(-2) + ':' + 
                            ('00' + date.getSeconds()).slice(-2);
                            conn.query(sql3, [date, agent_name], (err3) => {
                                conn.end()
                                if (err3){
                                    console.log(err3)
                                    return callback(err3, null)
                                }
                                console.log("done!")
                                return callback(null, null)
                            })
                        });
                    })
                }
                else{
                    conn.end()
                    return callback(null, null)
                }
            })
        });
    },
    get_process_list: function (agent_name, callback){
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err);
            let sql = `SELECT report FROM agent.process_reports WHERE agent_name = ?`
            conn.query(sql, [agent_name], (err, results) => {
                conn.end();
                if (err) {
                    console.log(err)
                    return callback(err, null);
                }
                return callback(null, results[0])
            });
        });
    }
   
}
