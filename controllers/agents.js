const express = require('express');
const router = express.Router();
const fs = require("fs")
const archiver = require('archiver');
const agents = require('../Models/agents')
var child_process = require('child_process');
const { createHash } = require('crypto');
const https = require('https');
var mime = require('mime');

router.get('/get_agents', function(req, res){
    agents.get_agents((err, result) => {
        if (err) return res.status(500).send({ message: 'an error had occurred' });
        return res.status(200).send(result)
    })
});

router.get('/get_installer', function(req,res){
    var file = __dirname + `/downloads/installer.sh`
    var stat = fs.statSync(file);
    res.setHeader('Content-disposition', 'attachment; filename=install.sh');
    res.setHeader('Content-Length', stat.size);
    var mimetype = mime.getType(file)
    res.setHeader('Content-disposition', 'attachment; filename=install.sh');
    res.setHeader('Content-type', mimetype);
    var filestream = fs.createReadStream(file)
    filestream.pipe(res)
})

router.post('/validate', function(req, res){
    var agent_ip = req.body.agent_ip
    var agent_nickname = req.body.agent_nickname
    var passcode = req.body.passcode
    var retype_passcode = req.body.retype_passcode
    var scope = req.body.scope
    if (passcode == retype_passcode){
        if (agent_nickname.length < 21 && agent_nickname.length > 4){
            try {
                var output = child_process.execSync(`ping ${agent_ip} -n 1`).toString();
                output = output.split('\r\n')
                if (output[2].includes(`Reply from ${agent_ip}`)){
                    agents.agent_creation(agent_ip, agent_nickname, scope, hash(passcode), (err) => {
                        if (err) return res.status(500).send()
                        return res.status(200).send()
                    })
                }
                else{
                    return res.status(500).send({ 'message': 'an error had occurred' })
                }
            }
            catch (error) {
                return res.status(500).send({ 'message': 'IP is unreachable!' })
            }
        }
        else{
            return res.status(500).send({ 'message': 'Agent Name is must be 5-20 characters long!' })
        }
    }
    else{
        return res.status(500).send({ 'message': 'Passwords do not match!' })
    }

})

router.post('/create_agent', function(req, res){
    var agent_name = req.body.agent_name
    var passcode = req.body.passcode
    var retype_passcode = req.body.retype_passcode
    var username = req.body.username
    var password = req.body.password
    console.log(passcode, retype_passcode)
    if (passcode == retype_passcode){
        agents.agent_creation(agent_name, hash(passcode), username, hash(password), (err, results) => {
            if (err) return res.status(500).send()
            if (results == "Authentication failed"){
                return res.status(402).send()
            }
            return res.status(200).send()
        })
    }
    else{
        return res.status(401).send()
    }
})

router.post('/delete_agent', function(req, res){
    var agent_name = req.body.agent_name
    var username = req.body.username
    var password = req.body.password
    agents.delete_agent(agent_name, username, hash(password), (err, results) => {
        if (err) return res.status(500).send()
        if (results == "Authentication failed"){
            return res.status(401).send()
        }
        return res.status(200).send()
    })
})

router.post('/download_agent', function(req, res){
    var adminurl = "https://172.22.92.129"
    var agent_name = req.body.agent_name
    var passcode = req.body.passcode
    var scope = ''
    console.log(req.body)
    if (req.body.analytics=="1"){
        scope += '1'
    }
    if (req.body.intrusion=="1"){
        scope += '2'
    }
    if (req.body.permission=="1"){
        scope += '3'
    }
    if (req.body.integrity=="1"){
        scope += '4'
    }

    agents.agent_authentication(agent_name, passcode, scope, req.body.port_number, (err, results) => {
        if (err) return res.status(500).send()
        var base_server = fs.readFileSync("controllers\\downloads\\base_server.py", "utf8")
        var base_push = fs.readFileSync("controllers\\downloads\\base_push.py", "utf8")
        if (req.body.analytics=="1"){
            base_push+="\nget_processes()\nsecurity_analytics()"
        }
        else{
            base_push+="\n#get_processes()\n#security_analytics()"    
        }
        if (req.body.intrusion=="1"){
            base_push+="\nchkroot_command()"
            base_server+=`

# intrusion detection_chkrootkit
@app.route("/chkrootkit_command", methods = ['POST'])
def chkroot_command():
# Retreive JSON data + Assign variables
    checksum = request.headers['Digest']
    request_data = request.get_json()
    command = request_data['cmd']
    output_destination = request_data['command_output']

    if hash_string(command, nickname, xn, checksum):
        print("checksum pass")
        chk_output = subprocess.check_output(command, shell=True)
        os.system(f'{command} > {output_destination}')
        response = make_response(send_file(output_destination))
        # response.headers['Digest','datetime'] = hash_file(output_destination,nickname,xn),timestamp
        response.headers.add('Digest',hash_file(output_destination,nickname,xn))
        response.headers.add('datetime',timestamp)
        return response
    return Response(status=404)`
        }
        else{
            base_push+="\n# chkroot_command()"
            base_server+=`
    
# intrusion detection_chkrootkit
# @app.route("/chkrootkit_command", methods = ['POST'])
def chkroot_command():
# Retreive JSON data + Assign variables
    checksum = request.headers['Digest']
    request_data = request.get_json()
    command = request_data['cmd']
    output_destination = request_data['command_output']

    if hash_string(command, nickname, xn, checksum):
        print("checksum pass")
        chk_output = subprocess.check_output(command, shell=True)
        os.system(f'{command} > {output_destination}')
        response = make_response(send_file(output_destination))
        # response.headers['Digest','datetime'] = hash_file(output_destination,nickname,xn),timestamp
        response.headers.add('Digest',hash_file(output_destination,nickname,xn))
        response.headers.add('datetime',timestamp)
        return response
    return Response(status=404)`
        }
        if (req.body.permission=="1"){
            base_push+="\nfile_permission()"
            base_server+=`
    
# File permission config
@app.route("/permconfig", methods = ['GET','POST'])
def getPermConfig():
    config_path = '/etc/audit/rules.d/audit.rules'
    if request.method == 'GET':
        f = open(config_path, 'r', encoding="UTF-8")
        config_content = f.read()
        f.close()
        index1 = config_content.find('Custom Monitoring')
        index2 = config_content.find('End of Custom Monitoring')
        config_content = config_content[index1:index2]
        customRules = config_content.split('\\n')
        data = {"id":agent_ip, "customRules":customRules}
        return data, 201

    elif request.method == 'POST':
        f = open(config_path, 'r', encoding="UTF-8")
        config_content = f.read()
        f.close()
        customRules = config_content.split('\\n')

        requestdata = request.get_json()
        newdata = requestdata['newRules']
        newdata.reverse()
        for n in range(len(customRules)):
            if customRules[n] == "## Custom Monitoring":
                index1 = n
            if customRules[n] == "## End of Custom Monitoring":
                index2 = n 
        customRules.insert((index1+1),'')
        confContent = index1
        for n in range(index2-index1-1):
            customRules.pop(index1+1)
        for n in range(len(newdata)):
            customRules.insert((index1+1),newdata[n])
        with open(config_path, "w") as f:
            for line in customRules:
                f.writelines(line)
                f.writelines('\\n')
        f.close()
        os.system('service auditd restart')
        return 201
`
        }
        else{
            base_push+="\n# file_permission()"
            base_server+=`
    
# File permission config
#@app.route("/permconfig", methods = ['GET','POST'])
def getPermConfig():
    config_path = '/etc/audit/rules.d/audit.rules'
    if request.method == 'GET':
        f = open(config_path, 'r', encoding="UTF-8")
        config_content = f.read()
        f.close()
        index1 = config_content.find('Custom Monitoring')
        index2 = config_content.find('End of Custom Monitoring')
        config_content = config_content[index1:index2]
        customRules = config_content.split('\\n')
        data = {"id":agent_ip, "customRules":customRules}
        return data, 201

    elif request.method == 'POST':
        f = open(config_path, 'r', encoding="UTF-8")
        config_content = f.read()
        f.close()
        customRules = config_content.split('\\n')

        requestdata = request.get_json()
        newdata = requestdata['newRules']
        newdata.reverse()
        for n in range(len(customRules)):
            if customRules[n] == "## Custom Monitoring":
                index1 = n
            if customRules[n] == "## End of Custom Monitoring":
                index2 = n 
        customRules.insert((index1+1),'')
        confContent = index1
        for n in range(index2-index1-1):
            customRules.pop(index1+1)
        for n in range(len(newdata)):
            customRules.insert((index1+1),newdata[n])
        with open(config_path, "w") as f:
            for line in customRules:
                f.writelines(line)
                f.writelines('\\n')
        f.close()
        os.system('service auditd restart')
        return 201
`
        }
        if (req.body.integrity=="1"){
            base_server+=`

#File Integrity endpoints

#6. run ad hoc integrity check via bash script
@app.route("/integrity_check", methods = ['POST'])
def integrity_checks():
    print("Integrity check running soon...")
    request_data = request.get_json()
    os.system('sh /var/lib/agent/scripts_tripwire/auto')
    print("Ran integrity check!")
    return Response(status=201)

#7. get user account
@app.route("/whoami", methods = ['GET'])
def whoami():
    print("i am you")
    user_account = subprocess.check_output("whoami", shell=True)
    data = {"whoami": json.dumps(user_account.decode('utf-8'))}
    return data, 201

#8. create new report
@app.route("/create_new", methods = ['POST'])
def gen_new():
    request_data = request.get_json()
    os.system('sudo tripwire --check')
    os.system('sudo twprint -m r --twrfile /var/lib/tripwire/report/$(sudo ls /var/lib/tripwire/report -rt | tail -n 1) > /var/lib/agent/tripwire/$(hostname)-$(date +"%Y%m%d-%H%M%S").txt')
    os.system('sudo python3 /var/lib/agent/scripts_tripwire/firstextraction_linux.py /var/lib/agent/tripwire/$(sudo ls /var/lib/agent/tripwire -rt | tail -n 1)')
    print('creating new report...')
    return Response(status=201)
                `
    
        }
        else{
            base_server+=`
#File Integrity endpoints

#6. run ad hoc integrity check via bash script
#@app.route("/integrity_check", methods = ['POST'])
def integrity_checks():
    print("Integrity check running soon...")
    request_data = request.get_json()
    os.system('sh /var/lib/agent/scripts_tripwire/auto')
    print("Ran integrity check!")
    return Response(status=201)

#7. get user account
#@app.route("/whoami", methods = ['GET'])
def whoami():
    print("i am you")
    user_account = subprocess.check_output("whoami", shell=True)
    data = {"whoami": json.dumps(user_account.decode('utf-8'))}
    return data, 201

#8. create new report
#@app.route("/create_new", methods = ['POST'])
def gen_new():
    request_data = request.get_json()
    os.system('sudo tripwire --check')
    os.system('sudo twprint -m r --twrfile /var/lib/tripwire/report/$(sudo ls /var/lib/tripwire/report -rt | tail -n 1) > /var/lib/agent/tripwire/$(hostname)-$(date +"%Y%m%d-%H%M%S").txt')
    os.system('sudo python3 /var/lib/agent/scripts_tripwire/firstextraction_linux.py /var/lib/agent/tripwire/$(sudo ls /var/lib/agent/tripwire -rt | tail -n 1)')
    print('creating new report...')
    return Response(status=201)
`
    
        }
        json_data = {
            "agent_name": `${agent_name}`,
            "passcode": `${passcode}`,
            "adminurl": `${adminurl}`,
            "port": `${req.body.port_number}`
        }
        base_push += "\nupdate_ip()"
        base_server += `
if __name__ == "__main__":   
    context = ('/var/lib/agent/https/cert.pem', '/var/lib/agent/https/key.pem')
    app.run(host='0.0.0.0', port=port_number, ssl_context=context)`
        fs.writeFile(`./controllers/downloads/agent/agent/server.py`, base_server, (err) => {
            if (err) {
                throw err
            }
        })
        fs.writeFile(`./controllers/downloads/agent/agent/push.py`, base_push, (err) => {
            if (err) {
                return res.status(500).send()

            }
        })
        fs.writeFile(`./controllers/downloads/agent/config/config.json`, JSON.stringify(json_data), (err) => {
            if (err) {
                return res.status(500).send()

            }
        })
        zipDirectory(`./controllers/downloads/agent`, `./controllers/downloads/${agent_name}.zip`).then((err)=>{
            if (err){
                return res.status(500).send()
            }
            return res.status(200).send()
        })
    })
    
    
})

router.get('/get_agent_file/:agent_name', function(req, res){
    var file = __dirname + `/downloads/${req.params.agent_name}.zip`
    var stat = fs.statSync(file);
    res.setHeader('Content-disposition', 'attachment; filename=agent.zip');
    res.setHeader('Content-Length', stat.size);
    var mimetype = mime.getType(file)
    res.setHeader('Content-disposition', 'attachment; filename=agent.zip');
    res.setHeader('Content-type', mimetype);
    var filestream = fs.createReadStream(file)
    filestream.pipe(res)
})

router.get('/delete_agent_installer/:agent_name', function(req, res){
    console.log('dd')
    child_process.exec(`del /f controllers\\downloads\\${req.params.agent_name}.zip`)
    return res.status(200).send()
})

router.post(`/check_status`, function(req,res){
    var agent_ip = req.body.agent_ip
    try{
        var output = child_process.execSync(`ping ${agent_ip} -n 1 -w 2`).toString();
        output = output.split('\r\n')
        if (output[2].includes(`Reply from ${agent_ip}`)){
            return res.status(200).send({"status":"Reachable"})
        }
        else{
            return res.status(200).send({"status":"Unreachable"})
        }
    }
    catch{
        return res.status(200).send({"status":"Unreachable"})
    }
})

router.post('/update_ip', function(req, res){
    var agent_name = req.body.agent_name
    var agent_ip = req.body.ip
    var passcode = req.body.passcode
    var uptime = req.body.uptime
    var port_number = req.body.port_number
    agents.update_ip(agent_ip, agent_name, passcode, uptime, port_number, (err) => {
        if (err) return res.status(500).send()
        return res.status(200).send()
    })
})

function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}

//to zip folders
function zipDirectory(sourceDir, outPath) {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(outPath);

    return new Promise((resolve, reject) => {
    archive
        .directory(sourceDir, false)
        .on('error', err => reject(err))
        .pipe(stream)
    ;

    stream.on('close', () => resolve());
    archive.finalize();
    });
}
module.exports = router;