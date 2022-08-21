const express = require('express');
const axios = require('axios')
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const Intrusion = require('../Models/intrusion');
const Agents = require('../Models/agents')
var absolutePath = path.join(__dirname, '../chkrootkit_scan');
const { createHash } = require('crypto');
var multer = require('multer');
const https = require('https')
const otpGenerator = require('otp-generator');
const { url } = require('inspector');


const agent = new https.Agent({  
    rejectUnauthorized: false
});


var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + "." + today.getMinutes() + "." + today.getSeconds();
var dateTime = date+'_'+time;



router.get('/getChecksum/:agent_id/:port', function(req, res){
    let id = req.params.agent_id;
    var port = req.params.port
    Agents.getAgentByID(id, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        if (!result) return res.status(404).send({ message: 'no user found' });
        // get agent name and pass from result and hash them together. send the result as response
       
        var name = result[0].agent_name
        var passcode = result[0].passcode
        var cmd = "./chkrootkit-0.55/chkrootkit"
        var concatString = cmd + name + passcode
        var checksum = createHash('sha256').update(concatString).digest('hex');
        var agent_ip = result[0].agent_ip
        var filename = `${name}_${dateTime}.txt`
        var output = `../chkrootkit/${filename}`
        var requestBody = {
            cmd: cmd,
            command_output: output,
        }
        console.log(port)
        const options = {
            url: `https://${agent_ip}:${port}/chkrootkit_command`,  
            method: "POST",
            httpsAgent : agent,
            headers: {
                Digest: checksum
            },
            data: requestBody
        };

        axios(options).then((response)=>{
            const result = response.data
            var filename = result.filename
            var report_result = result.report
            var agent_name = result.agent
            var agent_ip = result.agent_ip
           
            // var timestamp = response.headers['datetime'];

            // var checksum = response.headers['digest'];
            // var check = result + name + passcode
            // var checkdata = createHash('sha256').update(check).digest('hex')
            var filename = `${filename}.txt`
            data2 = {
                ip_address: agent_ip,
                agent_name: agent_name,
                file: filename,
            }
            
            // if (checksum != checkdata){
            //     var errmsg = "this file has been modified"
            //     console.log(errmsg)
            //     return res.status(400).send({meg:errmsg})

            // }

            fs.writeFile(`./chkrootkit_scan/${filename}`, report_result, err => {
                if (err) {
                    console.log(err)
                
                    return
                }
            });
            Intrusion.insert_report(data2, (err, result) => {
                if (err) {
                    console.log(err)
                    return
                };
                
                var absolutePath = path.join(__dirname, '../chkrootkit_scan')
                var filepath = `${absolutePath}`+`\\${filename}`  

                const allFileContents = fs.readFileSync(filepath, 'utf-8');
                allFileContents.split(/\r?\n/).forEach(line =>  {
                    var text = line
                    if (text.includes("INFECTED") || text.includes("Vulnerable")){
                        var data = {
                            agent_ip: agent_ip,
                            agent_name: agent_name,
                            text: text,
                            report_id: result.id
                        }
                        Intrusion.insert(data, (err, result) => {
                            if (err) return res.status(500).send({ message: 'an error had occurred' });
        
                            // return res.status(201).send(result);
                                
                        })
                    }
                });
            
         
            })
   
    
        }).catch((error)=>{

        })
        return res.status(201).send({ message: 'success' });
    
    }); 

});

router.post('/getChk', function(req, res){
    var name = req.body.agent_name
    var ip_address = req.body.ip_address
    var port = req.body.port
    var passcode = req.body.pass
    var cmd = "../chkrootkit-0.55/chkrootkit"

    var concatString = cmd + name + passcode
    var checksum = createHash('sha256').update(concatString).digest('hex');

    var filename = `${name}_${dateTime}.txt`
    var output = `../chkrootkit/${filename}`

    var requestBody = {
        cmd: cmd,
        command_output: output,
    }
    const options = {
        url: `https://${ip_address}:${port}/chkrootkit_command`,  
        method: "POST",
        httpsAgent : agent,
        headers: {
            Digest: checksum
        },
        data: requestBody
    };
    axios(options).then((response)=>{
        var result = response.data
        var checksum = response.headers['digest'];
        var timestamp = response.headers['datetime'];
        // var agent_name = response.headers['agent'];
        // var ip_address = response.headers['ip'];
        var check = result + name + passcode
        var checkdata = createHash('sha256').update(check).digest('hex')
        var filename = `${name}_${timestamp}.txt`

        if (checksum != checkdata){
            var errmsg = "this file has been modified"
            console.log(errmsg)
            return res.status(400).send({meg:errmsg})

        }
        
        fs.writeFile(`./chkrootkit_scan/${filename}`, result, err => {
            if (err) {
                console.log(err)
            
                return
            }
    

        })
 
        data2 = {
            ip_address: ip_address,
            agent_name: name,
            file: filename,
        }
        
        Intrusion.insert_report(data2, (err, result) => {
            if (err) {
                console.log(err)
                return
            };
            
            // var absolutePath = path.resolve("../chkrootkit_scan");
            var absolutePath = path.join(__dirname, '../chkrootkit_scan')
            var filepath = `${absolutePath}`+`\\${filename}`  
            
            const allFileContents = fs.readFileSync(filepath, 'utf-8');
            allFileContents.split(/\r?\n/).forEach(line =>  {
                var text = line
                if (text.includes("INFECTED" || "Vulnerable")){
                    
                    var data = {
                        agent_ip: agent_ip,
                        agent_name: agent_name,
                        text: text,
                        report_id: result.id
                    }
                    Intrusion.insert(data, (err, result) => {
                        if (err) return res.status(500).send({ message: 'an error had occurred' });
    
                        // return res.status(201).send(result);
                            
                    })
                }
            });
        
            return res.status(201).send({ message: "yay"});
        })

    }).catch((error) => {
        // console.log(error)
    });




})



router.post('/retrieve_chkrootkit', function(req, res){
    var checksum = req.headers['digest'];
    var report = req.body.report
    var agent = req.body.agent
    var filename = req.body.filename
    

    Agents.getAgentByName(agent,(err,results) =>{
        if (err) {
            console.log(err)
            // return res.status(500).send({ message: 'an error had occurred' });
        }

        if (results[0].length == 0){
            return
   
        }
        console.log(results)
        var agent_ip = results[0].agent_ip
        var agent_name = results[0].agent_name
        var passcode = results[0].passcode
        
        var check = JSON.stringify(req.body)+ agent_name + passcode
        var checkdata = createHash('sha256').update(check).digest('hex')

        if (checksum == checkdata){
            fs.writeFile(`./chkrootkit_scan/${filename}.txt`, report, err => {
                if (err) {
                  console.error(err);
                }
            });
            
            data2 = {
                ip_address: agent_ip,
                agent_name: agent_name,
                file: filename,
            }
            Intrusion.insert_report(data2, (err, result) => {
                if (err) {
                    console.log(err)
                };
                var absolutePath = path.join(__dirname, '../chkrootkit_scan');
                var filepath = `${absolutePath}`+`\\${filename}.txt`
            
                const allFileContents = fs.readFileSync(filepath, 'utf-8');
                allFileContents.split(/\r?\n/).forEach(line =>  {
                    var text = line
                    if (text.includes("INFECTED")){
                        var data = {
                            agent_ip: agent_ip,
                            agent_name: req.body.agent_name,
                            text: text,
                            report_id: result.id
                        }
                        console.log(data)
                        Intrusion.insert(data, (err, result) => {
                            if (err) return res.status(500).send({ message: 'an error had occurred' });
                                
                        })
                    }
                });
            })
           


        }
       

    })

});

router.get('/chkrootkit_report/:report_id', function(req, res){
    let report_id = req.params.report_id;

    Intrusion.findReport(report_id,(err,results) =>{
        try{
            filepath = `${absolutePath}`+`\\${results[0].report}`
            
            if (err) {
                return res.status(500).send({ message: 'an error had occurred' });
            } else{
                res.status(200).sendFile(filepath);
            }
        }
        catch{
            return res.status(500).send({ message: 'an error had occurred' });
        }
    })

});



router.get('/getchkrootkit', function(req, res){
    Intrusion.findAll((err,results) =>{
        if (err) {
            return res.status(500).send({ message: 'an error had occurred' });
        } else{
            res.status(200).send(results);
        }
    })
});


router.get('/latest_chk', function(req, res){
    Intrusion.findLatestReport((err,results) =>{
        try{
            filepath = `${absolutePath}`+`\\${results[0].report}`
            if (err) {
                return res.status(500).send({ message: 'an error had occurred' });
            } else{
                res.set('filename', results[0].report);
                res.status(200).sendFile(filepath);
            }
        }
        catch{
            return res.status(500).send({ message: 'an error had occurred' });
        }
    })

});


router.get('/getsnort', function(req, res){
    Intrusion.findAllSnort((err,results) =>{
        if (err) {
            return res.status(500).send({ message: 'an error had occurred' });
        } else{
            res.status(200).send(results);
        }
    })

});

// buggy still
router.post('/retrieve_snort', function(req, res){
    var checksum = req.headers['digest'];
    var agent = req.body.agent
    var alert = req.body.alert

    Agents.getAgentByName(agent,(err,results) =>{
        if (err) {
            console.log(err)
        }
    
        if (results[0].length == 0){
            return
   
        }
        var agent_ip = results[0].agent_ip
        var agent_name = results[0].agent_name
        var passcode = results[0].passcode

        var check = JSON.stringify(req.body)+ agent_name + passcode
        var checkdata = createHash('sha256').update(check).digest('hex')

        if (checksum == checkdata){

            // fs.writeFile(`./snort_alert/alert.txt`, alert , err => {
            //     if (err) {
            //       console.error(err);
            //     }
            // });
            alert = alert.replace('"', '')

            var alertarr = []
            alertarr = alert.split(/\r?\\n/)
            var snortRegexp = /^((?:[0-9]{2}[-\/:.]){5}[0-9]{6}).*\](\s[A-Za-z1-9 ]+\s).+\[Priority:\s(\d{1,2})\]\s+.*?\{[A-Z]+\}\s(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):?(\d{1,5})?\s+->\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):?(\d{1,5})?/;
            var srcportreg = /^.*?\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:(\d{1,5})?/g

            for (i = 0; i < alertarr.length; i++){
                if (alertarr[i].match(snortRegexp) != null){
                    var match = alertarr[i].match(snortRegexp);
                    var datetime = match[1];
                    var msg = match[2];
                    var priority = match[3];
                    var src_ip = match[4];
                    var dest_ip = match[6];

                    if (srcportreg.test(alertarr[i])){
                        var src_port = match[5];
                        var dest_port = match[7];
                    } else{
                        var src_port = '--'
                        var dest_port = '--'
                    }
                    

                
                    var data = {
                        agent_ip: agent_ip,
                        agent_name: agent_name,
                        datetime: datetime,
                        src_ip: src_ip,
                        src_port: src_port,
                        dest_ip: dest_ip,
                        dest_port: dest_port,
                        priority: priority,
                        message: msg
                    }
                    Intrusion.insertSnort(data, (err, result) => {
                        if (err) {
                            console.log(err)
                        }
                            // res.status(201).send(result);
                        
                    })
                    
                }

            }

        }
       
    })

});

// filter by agent
router.get('/agent/:agent', function(req, res) {
    var agent = req.params.agent;
    Intrusion.filterAgent(agent, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        res.status(201).send(result);
    })
});

//search in table 
router.get('/search/:search', function (req, res) {
    var search = req.params.search;
    Intrusion.filterSearch(search, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        res.status(201).send(result);
    })
});

// filter by date
router.get('/date/:date', function (req, res) {
    var date = req.params.date;
    Intrusion.filterDate(date, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        res.status(201).send(result);
    })
});

function parseHeaders(output) {
    if(!output || output.length === 0) {
        return null;
    }
    const lines = output.split(/\r\n/);
    let headers = {};
    lines.forEach(line => {
       let values = line.split(/:\s/);
       if(values.length === 2 && typeof values[0] === 'string' && typeof values[1] === 'string') {
           let [key, value] = values;
           headers[key] = value.trim();
       }
    });
    return headers;
}

module.exports = router;