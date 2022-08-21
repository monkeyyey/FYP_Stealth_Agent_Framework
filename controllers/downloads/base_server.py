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
