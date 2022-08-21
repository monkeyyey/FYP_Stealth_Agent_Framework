const express = require('express');
const router = express.Router();
const users = require('../Models/users')
const { authenticator } = require('otplib')
const QRCode = require("qrcode")
const jwt = require("jsonwebtoken");
const config = require("../config");

router.post("/register", (req, res) => {
    console.log("REGISTER LEH")
      if (req.body.password != req.body.retype_password) {
          res.status(500).send({ message: "Passwords must be the same!" });
      }
      secret = authenticator.generateSecret()
      users.addUser(req.body, secret, (error) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(500).send({
                        message: `The Username ${req.body.username} you provided already exists!`,
                    });
                }
                return res.status(500).send({ message: "Internal Error" });
            }
        QRCode.toDataURL(authenticator.keyuri(req.body.email, '2FA Node App', secret), (err, url) => {
            if (err) {
                return res.status(500).send({ message: "Internal Error" });
            }
            qr = url
            if (!qr) {
                return res.status(500).send({ message: "Internal Error" });
            }
            
            return res.status(201).send(qr);
  
        })
      });
  });
  
router.post('/sign-up-2fa', (req, res) => {
    code = req.body.code
    username=req.body.username
    password=req.body.password
    users.verifyLogin(username, password, code, (err, result) => {
      if (err) {
        console.log(err)
        return res.status(500).send({ message: 'an error had occurred' });
      }
      console.log(result)
      if (!result) return res.status(401).send({ message: 'invalid user credentials' });
      let user = {
          id: result.id,
          username: result.username,
          admin: result.admin
      }
      jwt.sign(user, config.jwt.secret, {expiresIn: 86400}, (err, token) => {
          if (err) return res.status(500).send({ message: 'an error had occurred' });
          res.status(200).send({ message: 'done' });
      })
  })
    
});

router.get("/get_users", (req, res) => {
    users.getUsers((error, result) => {
        if (error) {
            console.log(error)
            return res.status(500).send({ message: "Internal Error" });
        }
        return res.status(201).send(result);
    })
});


module.exports = router;