const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const fs = require('fs');
const { exec } = require('child_process');
const readline = require('readline');
const integrity = require('../Models/file_int');
const { route } = require('../app');
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({  
    rejectUnauthorized: false
});
var port = 5000;

//Model for this is inside receive.js

//gets agent details for updates
router.get('/getAllAgents', function (req, res) {
    integrity.getAllAgents((err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        console.log("/getAllAgents");
        res.status(200).send(result);
    })
});


//displays table data 
router.get('/getData', function (req, res) {
    integrity.getData((err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        console.log("/getData");
        res.status(200).send(result);
    })
});

// for pie chart
router.get('/getActions', function (req, res) {
    integrity.getActions((err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        console.log("/getData");
        res.status(200).send(result);
    })
});

// get individual agent pie charts
router.get('/getAgentActions/:agent', function (req, res) {
    var agent = req.params.agent;
    integrity.getAgentActions(agent, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        
        res.status(200).send(result);
    })
});

//filter table by action
router.get('/filter_action/:action', function(req, res) {
    var action = req.params.action;
    integrity.filterAction(action, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        console.log("/filter_action");
        res.status(200).send(result);
    })
});

//search in table 
router.get('/search/:search', function (req, res) {
    var search = req.params.search;
    integrity.filterSearch(search, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        console.log("/search");
        res.status(200).send(result);
    })
});

// filter by date
router.get('/date/:date', function (req, res) {
    var date = req.params.date;
    integrity.dateFilter(date, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        console.log("/date");
        res.status(200).send(result);
    })
});

// filter by time
router.get('/time/:time', function (req, res) {
    var time = req.params.time;
    integrity.timeFilter(time, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        console.log("/time");
        res.status(200).send(result);
    })
});

//Regular update of existing agents
router.post('/integrity_info', function(req, res) {
    var filename = req.body.filename
    var destination = req.body.dest
    var ip = req.body.ip
    var port = req.body.port
    var agent_name = req.body.agent_name

    exec(`curl --insecure https://${ip}:${port}/file_retrieval_file?file=/var/lib/agent/tripwire${filename} > ${destination}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${stderr}`);
            return;
        }
        else{
            var data, hostname, ip_addr, fileName, action;
            var updateInfo = [];
            var readFile = fs.readFileSync(destination, 'utf-8');
            readFile.split("\n").forEach(line => {
                if (line.includes("+Host name")) {
                    hostname = line.split("+Host name: ")[1];
                    data = `{"hostname":"${hostname}",`;
                } else if (line.includes("+Host IP Address")) {
                    ip_addr = line.split("+Host IP Address: ")[1];
                    data += `"ip_addr":"${ip_addr}",`;
                } else if (line.includes("+ Added") || line.includes("+ Modified") || line.includes("+ Removed")) {
                    fileName = line.split(' ')[5];
                    action = line.split(' ')[1];
                    data += `"filename":"${fileName}","action":"${action}"}`;
                    updateInfo.push(data);
                };
                
            });
            
            for (var k in updateInfo) {
                data = JSON.parse(updateInfo[k]);
                console.log(data);
                integrity.file_int(data, agent_name, ip, (err, result) => {
                    if (err) return res.status(500).send({ message: 'an error had occurred' });
                    console.log("data updated in mysql!!");
                    res.status(201).send(result);
                });
            };
        }
    })
    
    
});

//execute the bash script for generating report for ad hoc integrity check
router.post('/integrityCheck', function(req, res) {
    var ip = req.body.ip;
    var port = req.body.port
    const options = {
        url: `https://${ip}:${port}/integrity_check`,
        method: "POST",
        httpsAgent : agent,
    }

    axios(options).then((response) => {
        console.log("Running ad hoc integrity check...");
    }).catch(err => {
        res.status(500).send()
    });
    res.status(200).send();
})

//Create new report for new agents
router.post('/create_new', function(req, res) { 
    var ip = req.body.ip;
    var originFile = req.body.originFile;
    var destination = req.body.dest
    var port = req.body.port
    var agent_name = req.body.agent_name
    const options = {
        url: `https://${ip}:${port}/create_new`,
        method: "POST",
        httpsAgent : agent,
    }
    console.log(destination)
    axios(options).then((response) => {
        console.log("generating report in the agent...");
        axios.get(`https://${ip}:${port}/whoami`, {httpsAgent : agent}).then((response) => {
        var username = response.data.whoami;
        username = username.replace("\\n", "");
        exec(`curl --insecure https://${ip}:${port}/file_retrieval_file?file=/var/lib/agent/${originFile} > ${destination}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`exec error: ${stderr}`);
                return;
            } else {
                var info, hostname, ip_addr, fileName, action;
                var allInfo = [];
                const file = destination;
                readFile = fs.readFileSync(file, 'utf-8');
                readFile.split("\n").forEach(line => {
                    if (line.includes("Host name")) {
                        hostname = line.split("Host name: ")[1];
                        info = `{"hostname":"${hostname}",`;
                    } else if (line.includes("IP Address")) {
                        ip_addr = line.split("IP Address: ")[1]
                        info += `"ip_addr":"${ip_addr}",`;
                    } else if (line.split(' ').includes("Added") || line.split(' ').includes("Modified") || line.split(' ').includes("Removed")) {
                        fileName = line.split(' ')[1];
                        action = line.split(' ')[0];
                        info += `"filename":"${fileName}","action":"${action}"}`;
                        allInfo.push(info);
                    };
                });
                // parse info to be sent to mysql
                for (var k in allInfo) {
                    info = JSON.parse(allInfo[k]);
                    integrity.file_int(info, agent_name, ip, (err, result) => {
                        if (err) return res.status(500).send({ message: 'An error has occurred' });
                        console.log("Data sent to MySQL");
                        res.status(201).send(result);
                    });
                }
            }
        });
    }).catch(err => {
        res.status(500).send()
    });
    });
});

module.exports = router;