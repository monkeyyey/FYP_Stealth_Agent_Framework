const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');

const agent = new https.Agent({  
    rejectUnauthorized: false
});
const options = {method: 'GET'}; 
router.post('/checkMalicious', function(req, res){
    var scanResult
    var info = req.body
    var resource = info['hash']['data']
    // resource = '708e6cefe635204f3903d61dd0bcaefd4e919a8675e600652b3c8697ea0aa42d' //test line
    var link = `https://www.virustotal.com/vtapi/v2/file/report?apikey=85b0b8a0e59db5d0d843e66a0117cbbd0354128b4886befe4953eba16182d171&resource=${resource}&allinfo=false`
    fetch(`${link}`, options)
    .then(response => response.json())
    .then(response => {
        scanResult = response
        return res.status(200).send(scanResult['scans']) 
    })
    .catch(err => console.error(err));

    
});

router.post('/get_filehash', function(req, res){
    console.log(req.body);
    baseUrl = req.body["baseUrl"];
    filepath = req.body["filepath"];
    requestBody = {filepath : filepath};
    axios.post(`${baseUrl}/get_fileHash`,requestBody,{ httpsAgent: agent }).then((response)=>{
        console.log(response)
        return res.status(200).send(response.data);
        })
    
});

module.exports = router;