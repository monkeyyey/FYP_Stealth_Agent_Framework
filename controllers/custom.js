const path = require('path');
const { exec } = require('child_process');
var FormData = require('form-data');
var multer = require('multer');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');
const Custom = require('../models/custom');

const agent = new https.Agent({  
    rejectUnauthorized: false
});

// handle storage using multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
       cb(null, './custom_file');
    },
    filename: function (req, file, cb) {
       cb(null, `${file.originalname}`);
    }
 });
  
var upload = multer({ storage: storage });

router.post(`/remote`, function(req,res){
    RA_info = req.body;
    baseUrl = RA_info['baseUrl'];
    axios.post(`${baseUrl}/command`, RA_info, { httpsAgent: agent }).then((response)=>{
        console.log(response.data)
        var output = (response.data).replaceAll("\\n",' ');
        if (output.match(`^b'`)){
            output = output.slice(2)
        }
        console.log(output)
        return res.status(200).send(output)

    }).catch((error) => {
        console.log(error);
    });

})


router.post(`/send_file`, upload.single('file'), function(req,res){
    console.log("received");
    agent_name = req.body.agent_name
    filename = req.file.originalname;
    baseUrl = req.body['baseUrl'];
    adminName = req.body['adminName'];
    console.log(baseUrl)
    let today = new Date().toLocaleDateString()

    // var file_tosend = fs.readFileSync(`./custom_file/${filename}`);
    const formData = new FormData();
    formData.append("file",  fs.createReadStream(`./custom_file/${filename}`));
    axios.post(`${baseUrl}/uploader`, formData,{ headers: { "Content-Type": "multipart/form-data" },httpsAgent: agent }).then((response)=>{
        var data = {
            agent_name: agent_name,
            file: filename,
            status: response.data,
            date : today,
            sent_by : adminName
        }
        Custom.insert(data, (err, result) => {
            if (err) return res.status(500).send({ message: 'an error had occurred' });
            // console.log(err)
            return
        })

        return res.status(200).send(response.data)
    }).catch((error) => {
        console.log(error);
    });
    // return res.status(200).send("rec")
})
router.get(`/records/:name`, function(req,res){
    let agentName = req.params.name;
    Custom.findbyAgent(agentName,(err,results) =>{
        if (err) {
            console.log(err)
            return res.status(500).send({ message: 'an error had occurred' });
        } else{
            res.status(200).send(results);
        }
    })
    
})

router.post(`/retrieve_file`, function(req,res){
    var file_location = req.body.filepath
    var baseUrl = req.body.baseUrl
    var save_filename = req.body.save_filename
    //var agent_ip = req.body.agent_ip
    console.log(baseUrl)
    axios.post(`${baseUrl}/retrieve_file`, req.body, { httpsAgent: agent }).then((response)=>{
        var result = response.data
        fs.writeFile(`./custom_retrieve/${save_filename}`, result, err => {
            if (err) {
              console.error(err);
            }
            // file written successfully
        });
        return res.status(200).send(response.data)
    }).catch((error) => {
        console.log(error);
    });
})
module.exports = router;