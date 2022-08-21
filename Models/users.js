const db = require('./DatabaseConfig');
const { createHash } = require('crypto');
const { authenticator } = require('otplib')

module.exports = {
    addUser: function (info, secret, callback) {
        var conn = db.getConnection();
        conn.connect(function (err1) {
            if (err1) {
                console.log(err1);
                return callback(err1);
            } else {
                const sql = `SELECT username FROM agent.admins WHERE username = ? and password = ?`
                conn.query(sql, [info.admin_username, hash(info.admin_password)], (error, result)=> {
                    if (error) {
                        conn.end()
                        console.log(error)
                        return callback(error)
                    }
                    if (result.length == 0){
                        conn.end()
                        return callback(null)
                    }
                    const sql2 = `INSERT INTO agent.admins(username,email,phone,password,secret,admin) VALUES(?,?,?,?,?,?)`;
                    conn.query(
                        sql2,
                        [
                            info.username,
                            info.email,
                            info.contact,
                            hash(info.password),
                            secret,
                            1               
                        ],
                        (error2) => {
                            conn.end();
                            if (error) {
                                console.log(error2)
                                return callback(error2);
                            }
                            return callback(null)
                        }
                    );
                })
                
            }
        });
    },
    verifyLogin: function (username, password, code, callback) {

        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
    
            let sql = `SELECT secret, id, username,admin FROM agent.admins WHERE username = ? and password= ?`;
            conn.query(sql, [username, hash(password)], (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                if (results.length < 1) return callback(null, null);
                console.log(results[0].secret)
                if (!authenticator.check(code, results[0].secret)) {
                    return callback(null, null)
                   
                }
                return callback(null, results[0] );

            });
        });
    },
    getUsers: function (callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                const sql = `SELECT username, phone, email FROM agent.admins`
                conn.query(sql, (error, result)=> {
                    if (error) {
                        conn.end()
                        console.log(error)
                        return callback(error, null)
                    }
                    return callback(null, result)
                })
                
            }
        });
    },
}

function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}