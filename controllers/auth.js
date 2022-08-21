const express = require("express");
const router = express.Router();
const users = require("../Models/login");
const jwt = require("jsonwebtoken");
const config = require("../config");
const adminChecker = require("../middlewares/Admin-Checker");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

//-----------------------------------//
// -------- Login endpoints--------- //
//-----------------------------------//

// verifies that user exist in database
// if user exists, return user ID, username and admin status
router.post("/authLogin", (req, res) => {
    let { username, password } = req.body;
    users.verify(username, password, (err, result) => {
        if (err)
            return res.status(500).send({ message: "an error had occurred" });
        if (!result)
            return res
                .status(401)
                .send({ message: "invalid user credentials" });
        let user = {
            id: result.id,
            username: result.username,
            admin: result.admin,
        };
        return res.status(201).send(user);
    });
});

// verifies the OTP entered and return user info and token if otp is valid
router.post("/sign-in-otp", (req, res) => {
    var code = req.body.code;
    var id = req.body.id;
    users.verifyAuthLogin(id, code, (err, result) => {
        if (err)
            return res.status(500).send({ message: "an error had occurred" });
        if (!result){
            console.log(result)
            return res
            .status(401)
            .send({ message: "invalid user credentials" });
        }
            
        let user = {
            id: result.id,
            username: result.username,
            admin: result.admin,
        };
        jwt.sign(
            user,
            config.jwt.secret,
            { expiresIn: 86400 },
            (err, token) => {
                if (err)
                    return res
                        .status(500)
                        .send({ message: "an error had occurred" });
                res.status(200).send({ user, token: "Bearer " + token });
            }
        );
    });
});

//---------------------------------------------//
// -------- Forget Password endpoints--------- //
//---------------------------------------------//

router.post("/forgetPass", (req, res) => {
    let email = req.body.email;
    // checks if email entered is a valid account email from the database
    // returns user does not exist message if not
    users.forgetPassOTP(email, (err, result) => {
        if (err) {
            console.log("1"+err);
            return res.status(500).send({ message: "an error had occurred" });
        }
        if (!result)
            return res.status(401).send({ message: "user does not exist" });
        var id = result.id;

        //generates OTP
        var otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        // if user exists sends OTP to email
        users.updateOTP(otp, id, (error, result) => {
            if (error) {
                console.log("121"+error);
                return res
                    .status(500)
                    .send({ message: "an error had occurred" });
            }
            if (!result)
                return res
                    .status(401)
                    .send({ message: "invalid user credentials" });

            let transporter = nodemailer.createTransport({
                service: "hotmail",
                // host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: "test1ng2022@outlook.com", // generated ethereal user
                    pass: "1qwer$#@!", // generated ethereal password
                },
            });
            let mailOptions = {
                from: "test1ng2022@outlook.com", // sender address
                to: email, // list of receivers
                subject: "OTP ✔", // Subject line
                text: "Reset Password OTP", // plain text body
                html: `Your OTP is <b>${otp}</b>`, // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("444"+error);
                    return console.log(error);
                }
            });

            return res.status(201).send({ id: result });
        });
    });
});

// verify email OTP entered by user
router.post("/email-otp", (req, res) => {
    var code = req.body.code;
    var id = req.body.id;
    users.verifyEmailOTP(id, code, (err, result) => {
        if (err)
            return res.status(500).send({ message: "an error had occurred" });
        if (!result)
            return res
                .status(401)
                .send({ message: "invalid user credentials" });
        res.status(200).send({ message: "otp validated" });
    });
});

// update database with new password
router.put("/newPass", (req, res) => {
    // let param_id = req.params.id
    let id = req.body.id;
    let password = req.body.password;

    users.updatePass(id, password, (err, result) => {
        if (err)
            return res.status(500).send({ message: "an error had occurred" });
        if (!result) return res.status(400).send({ message: "no user found" });
        res.status(200).send(result);
    });
});

router.post("/login", (req, res) => {
    let { username, password } = req.body;
    users.verify(username, password, (err, result) => {
        if (err)
            return res.status(500).send({ message: "an error had occurred" });
        if (!result)
            return res
                .status(401)
                .send({ message: "invalid user credentials" });
        let user = {
            id: result.id,
            username: result.username,
        };
        jwt.sign(
            user,
            config.jwt.secret,
            { expiresIn: 3600 },
            (err, token) => {
                if (err)
                    return res
                        .status(500)
                        .send({ message: "an error had occurred" });
                res.status(200).send({ user, token: "Bearer " + token });
            }
        );
    });
});

router.post("/adminaccess", (req, res) => {
    var token = req.body.token;
    adminChecker.checkadmin(token, (err, result) => {
        if (err) {
            return res.status(201).send({ access: result });
        }
        res.status(201).send({ access: result });
    });
});

module.exports = router;
