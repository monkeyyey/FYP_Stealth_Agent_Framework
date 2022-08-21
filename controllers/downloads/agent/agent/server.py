import json
import os, shutil, io
import requests
from flask import Flask, send_file, request, make_response
from flask import Response
from flask_cors import CORS
import platform
from datetime import datetime
import subprocess
import socket
from multiprocessing import Process
from hashlib import sha256
from werkzeug.utils import secure_filename
import hashlib

# Initialize + Enable Cross origin resource sharing
app = Flask(__name__)
CORS(app)
# agent info
agent_ip = subprocess.check_output("hostname -I | awk '{print $1}'", shell=True)[0:-1].decode('utf-8')

with open('/var/lib/agent/config/config.json') as f:
    data = json.load(f)
    nickname = data['agent_name']
    xn = data['passcode']
    admin_url = data['adminurl']
    port_number = data['port']

@app.route('/status', methods=['GET'])
def status_check():
    print('here')

# Retrieve file 
@app.route("/file_retrieval_file", methods = ['GET'])
def file_retrieval_file():
    file = request.args.get("file")
    return send_file(file)

# remote command execution
@app.route("/command", methods = ['POST'])
def command():

    # Retreive JSON data + Assign variables
    request_data = request.get_json()
    command = request_data['command']
    output_destination = '/var/lib/agent/output.txt'

    errorMsg = "There was an error executing the command"
    
    try:
        open('/var/lib/agent/output.txt', 'w').close()
        os.system(f'{command} > {output_destination}')
        with open(output_destination, 'r') as file:
            data = file.read().replace('\n', '')

        return data, 201
    except:
        return errorMsg

#get script
@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['file']
        f.save(secure_filename(f.filename))
        if f.filename[-3:] == '.py':
            try:
                os.system(f'python3 {f.filename}')
                return 'file received and ran successfully'
            except:
                return ' An error occurred while executing the file'
        elif f.filename[-4:] == '.exe' or f.filename[-3:] == '.sh':
            try:
                os.system(f'chmod +x {f.filename}')
                subprocess.run(f"./{f.filename}", shell=True, check=True)
                return 'file received and ran successfully'
            except:
                return ' An error occurred while executing the file'
        else:
            return 'file received and saved.'

# file hashing
@app.route('/get_fileHash', methods=['POST'])
def rtn_fileHash():
    requestdata = request.get_json()
    filepath = requestdata['filepath']
    filepath = str(filepath)

    h = hashlib.sha1()
    with open(f'{filepath}','rb') as file:

        # loop till the end of the file
        chunk = 0
        while chunk != b'':
            # read only 1024 bytes at a time
            chunk = file.read(1024)
            h.update(chunk)

    return h.hexdigest()

# Retrieve file 
@app.route("/retrieve_file", methods = ['POST'])
def retrieve_file():
    try:
        request_data = request.get_json()
        filepath = request_data['filepath']
        print(filepath)
        return send_file(filepath)
    except:
        return send_file(filepath)

def hash_file(filename,nickname,xn):
    with open(filename, 'rb') as f:
        bytes = f.read()
        bytes = bytes.decode("utf-8") 
    toHash = bytes + nickname + xn
    filehash = hashlib.sha256(toHash.encode('utf-8')).hexdigest()

    return filehash

def hash_string(string, nickname, xn, original_hash):
    concatString = string + nickname + xn
    print(concatString)
    hash = hashlib.sha256(concatString.encode('utf-8')).hexdigest()
    return check_hash(original_hash,hash)
    
def check_hash(original_hash, calculated_hash):
    check = False
    if original_hash == calculated_hash:
        check = True
        return bool(check)

    
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
    return Response(status=404)
    
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
        customRules = config_content.split('\n')
        data = {"id":agent_ip, "customRules":customRules}
        return data, 201

    elif request.method == 'POST':
        f = open(config_path, 'r', encoding="UTF-8")
        config_content = f.read()
        f.close()
        customRules = config_content.split('\n')

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
                f.writelines('\n')
        f.close()
        os.system('service auditd restart')
        return 201

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

if __name__ == "__main__":   
    context = ('/var/lib/agent/https/cert.pem', '/var/lib/agent/https/key.pem')
    app.run(host='0.0.0.0', port=port_number, ssl_context=context)