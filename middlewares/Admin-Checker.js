var jwt = require('jsonwebtoken');
var config = require('../config');


var verifyFn = {
    checkadmin: function (token, callback) {
        if (!token || !token.includes("Bearer ")) {
            return callback(1, 0)
        } else {
            token = token.substring(7);
            jwt.verify(token, config.jwt.secret, function (err, decoded) {
                if (err) {
                    return callback(1, 0)
                } else {
                    if (decoded.admin != 1) {
                        return callback(1, 0)
                    } else {
                        return callback(null, 1)
                    }
                }
            });
        }
    }
}

module.exports = verifyFn;