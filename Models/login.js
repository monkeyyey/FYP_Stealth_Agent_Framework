const db = require('./DatabaseConfig');
const { createHash } = require('crypto');
const { authenticator } = require('otplib')

module.exports = {
    // verify if user is valid
    verify: function (username, password, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
    
            let sql = `SELECT id, username, admin FROM agent.admins WHERE username = ? and password=?`;
            conn.query(sql, [username, hash(password)], (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                if (results.length < 1) return callback(null, null);
                else {
                    const user = results[0]
                    return callback(null, user)
                }
            });
        });
    },

    // verify the code entered
    verifyAuthLogin: function (id, code, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
    
            let sql = `SELECT secret, id, username,admin FROM agent.admins WHERE id = ?`;
            conn.query(sql, [id], (err, results) => {
                conn.end();
                console.log(results[0].secret+"1") 
                console.log(results.length)
                if (err) return callback(err, null);
                if (results.length < 1) return callback(null, null);

                if (!authenticator.check(code, results[0].secret)) {
                    console.log("ddd")
                    return callback(null, null)
                }
                return callback(null, results[0]);

            });
        });
    },

    // verify if forget password email is valid
    forgetPassOTP: function (email, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
    
            let sql = `SELECT id FROM agent.admins WHERE email = ?`;
            conn.query(sql, [email], (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                if (results.length < 1) return callback(null, null);
                else {
                    return callback(null, results[0])
                }
            });
        });
    },
    // update newly generated OTP to user row
    updateOTP: function (otp, id, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                return callback(err);
            }
            const sql = `UPDATE agent.admins SET otp = ? where id = ?`;
            conn.query(sql, [ otp, id], (error,result) => {
                    conn.end();
                    
                    if (error) {
                        console.log(error)
                        return callback(error);
                    }
              
                    return callback(null, id)
                }
            );
            
        });
    },

    // verifies forget password email OTP entered by user
    verifyEmailOTP: function (id, code, callback) {
 
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);
    
            let sql = `SELECT otp, id, username, admin FROM agent.admins WHERE id = ?`;
            conn.query(sql, [id], (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                if (results.length < 1) return callback(null, null);

                if (code == results[0].otp){
                    return callback(null, results[0]);
                }

                return callback(null, null);

            });
        });
    }, 

    //update new user password
    updatePass: function (password, callback) {
        let conn = db.getConnection();
        conn.connect((err) => {
            if (err) return callback(err, null);

            let sql = `UPDATE agent.admins SET password = ? WHERE id = ?`;
            let params = [hash(password)];
            conn.query(sql, params, (err, results) => {
                conn.end();
                if (err) return callback(err, null);
                if (results.affectedRows < 1) return callback(null, null);
                callback(null, { id: results.id });
            });
        });
    },

}
function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}