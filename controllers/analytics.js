const express = require('express');
const router = express.Router();
const analytics = require('../Models/analytics')

router.get('/cpu_mem/:agent', function(req, res){
    const agent = req.params.agent
    analytics.get_cpu_mem(agent, (err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        res.status(200).send(result)
    })
});

router.post('/cpu_mem', function(req, res){
    info = req.body
    analytics.insert_cpu_mem(info, (err) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        return res.status(200).send();
    })
});

router.get('/get_process_report/:agent_name', function(req, res){
    var agent_name = req.params.agent_name
    analytics.get_process_list(agent_name, (err, results) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        try{
            if (results.report){
                return res.status(200).send(results.report);
            }
            return res.status(200).send();
        }
        catch{
            return res.status(200).send();
        }
    })
})

router.post('/insert_process_list', function(req, res){
    var agent_name = req.body.id
    var passcode = req.body.passcode
    var report = req.body.process_list    
    analytics.insert_process_list(agent_name, passcode, report, (err) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        return res.status(201).send();
    })
})

module.exports = router;
1