const express = require('express');
const router = express.Router();
const fs = require("fs")
const archiver = require('archiver');
const agents = require('../Models/agents')
var child_process = require('child_process');
const { createHash } = require('crypto');
const axios = require('axios');
const https = require('https');
var path = require("path")
const { stderr } = require('process');
const agent = new https.Agent({  
    rejectUnauthorized: false
});


var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + "." + today.getMinutes() + "." + today.getSeconds();
var dateTime = date+'_'+time;

router.get('/getChecksum/:agent_id', function(req, res){
    let id = req.params.agent_id;
    agents.getAgentByID(id, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        if (!result) return res.status(404).send({ message: 'no user found' });
        // get agent name and pass from result and hash them together. send the result as response
        var name = result[0].agent_nickname
        var passcode = result[0].passcode
        var cmd = "../chkrootkit-0.55/chkrootkit"
        var concatString = cmd + name + passcode
        var checksum = createHash('sha256').update(concatString).digest('hex');
        console.log(checksum)
        var agent_ip = result[0].agent_ip
        
        var filename = `${name}_${dateTime}.txt`
        var output = `../chkrootkit/${filename}`
        var requestBody = {
            cmd: cmd,
            command_output: output,
        }

        var port = '5000'
        
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
            var result = response.data
            // console.log(response)
            
            var checksum = response.headers['digest'];
            var check = result + name + passcode
            var checkdata = createHash('sha256').update(check).digest('hex')
            console.log(checksum)
            console.log(checkdata)

            if (checksum != checkdata){
                var errmsg = "this file has been modified"
                console.log(errmsg)
                return res.status(400).send({meg:errmsg})

            }
            fs.writeFile(`./chkrootkit_scan/${filename}`, result, err => {
                if (err) {
                  console.error(err);
                }
                // file written successfully
            });
        }).catch((error)=>{

        })
    
    
    }); 

});

module.exports = router;