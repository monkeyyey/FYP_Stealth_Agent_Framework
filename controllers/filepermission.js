const express = require("express");
const router = express.Router();
const perm1 = require("../Models/perm_monitoring");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const config = require("../config");
const https = require("https");
const { request } = require("http");
const agent = new https.Agent({
    rejectUnauthorized: false,
});

router.post("/getconfig", function (req, res) {
    const baseUrl = req.body.baseUrl;
    console.log(baseUrl);
    axios
        .get(`${baseUrl}/permconfig`, { httpsAgent: agent })
        .then((response) => {
            if (response.status == 201) {
                const myObject = response.data;
                myObject["customRules"].pop(0);
                myObject["customRules"].shift();
                customRules = myObject["customRules"];
                var resBody = {
                    customRules: customRules,
                    agent_ip: req.body.agent_ip,
                    agent_name: req.body.nickname,
                };
                res.status(200).send(resBody);
            }
        })
        .catch((error) => {
            console.log(error);
        });
});

router.put("/resolved/:id/", function (req, res, next) {
    jwt_token = req.body.jwt_token.split(" ")[1];
    user = jwt.decode(jwt_token);
    console.log(user.id);
    console.log(user.username);

    var reqBody = {
        log_id: req.body.log_id,
        timestamp: req.body.timestamp,
        userid: user.id,
        username: user.username,
    };
    perm1.flagResolved(reqBody, (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send({ Result: "Internal Error" });
            return;
        }
        console.log(results);
        res.status(204).send();
    });
});

router.get("/history", (req, res, next) => {
    perm1.getHistory((error, logs) => {
        if (error) {
            console.log(error);
            res.status(500).send({ Result: "Internal Error" });
            return;
        }
        res.status(200).send(logs);
    });
});

router.post("/postconfig", function (req, res) {
    const baseUrl = req.body.baseUrl;

    var reqBody = {
        newRules: req.body.newdata,
    };

    axios
        .post(`${baseUrl}/permconfig`, reqBody, { httpsAgent: agent })
        .then((response) => {
            if (response.status == 201) {
                const myObject = response.data;
                console.log(reqBody);
                res.status(200).send(reqBody);
            }
        })
        .catch((error) => {
            console.log(error);
        });
});

router.post("/getpermlogs", function (req, res) {
    var info = req.body;
    var logarray = info["loglist"].split("----");

    for (i = 0; i < logarray.length; i++) {
        var currentLog = logarray[i];
        var time = "";
        var command = "";
        var risklvl = "";
        var logkeyword = "";

        var indexTime = currentLog.indexOf("msg=audit");
        var indexCommand1 = currentLog.indexOf(": proctitle=");
        var indexCommand2 = currentLog.indexOf("type=PATH");
        var indexKeyword = currentLog.indexOf("key=");

        // raw log date and time
        time = currentLog.substr(indexTime + 10, 27);

        // raw command date and time
        command = currentLog.substr(
            indexCommand1 + 12,
            indexCommand2 - indexCommand1 - 15
        );
        if (command == "") {
            command = "--No Command--";
        }

        // command risklvl level
        if (command.includes("chmod") || command.includes("chown")) {
            risklvl = "--critical--";
        } else {
            risklvl = "--low--";
        }

        // keyword of the log
        logkeyword = currentLog.substr(indexKeyword + 4);

        if (time.length != 0 && command != "/usr/libexec/tracker-extract") {
            // convert time format to sql format
            time = time.split(" ");
            date = time[0].split("/");
            date =
                date[2] +
                "-" +
                date[0] +
                "-" +
                date[1] +
                " " +
                time[1].slice(0, -8);

            // requestbody for post
            var requestBody = {
                name: info["agent_name"],
                ipaddr: info["id"],
                command: command,
                created_at: date,
                risk: risklvl,
            };
            console.log(requestBody);
            perm1.postLogs(requestBody, (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send();
                    return;
                } else {
                    res.status(201).send();
                    return;
                }
            });
        }
    }
});

router.get("/getperm", (req, res, next) => {
    const agent_ip = "all";
    perm1.getLogs(agent_ip, (error, logs) => {
        if (error) {
            console.log(error);
            res.status(500).send({ Result: "Internal Error" });
            return;
        }
        res.status(200).send(logs);
    });
});

router.get("/getperms/:ip/", (req, res, next) => {
    const agent_ip = req.params.ip;
    perm1.getLogs(agent_ip, (err, result) => {
        if (err)
            return res.status(500).send({ message: "an error had occurred" });
        res.status(200).send(result);
    });
});

router.get("/getrisk/:nickname/:risk/", (req, res, next) => {
    const nickname = req.params.nickname;
    const risk = req.params.risk;
    var requestbody = {
        nickname: nickname,
        risk: risk,
    };

    perm1.getRisk(requestbody, (error, logs) => {
        if (error) {
            console.log(error);
            res.status(500).send({ Result: "Internal Error" });
            return;
        }
        res.status(200).send(logs);
    });
});

router.get("/getnames", (req, res, next) => {
    perm1.getNames((error, names) => {
        if (error) {
            console.log(error);
            res.status(500).send({ Result: "Internal Error" });
            return;
        }
        // var results = []
        // for (x in names){
        //     if (names[x]['scope'].includes("3")){
        //         results.push(names[x])
        //     }
        // }
        res.status(200).send(names);
    });
});

router.get("/getfirst", (req, res, next) => {
    perm1.getFirstLog((error, log) => {
        if (error) {
            console.log(error);
            res.status(500).send({ Result: "Internal Error" });
            return;
        }
        res.status(200).send(log);
    });
});
module.exports = router;
