import json
import os, shutil, io
import requests
import threading
from datetime import datetime, timedelta
import subprocess
import socket
from hashlib import sha256
import hashlib

import time

time.sleep(3)

with open('/var/lib/agent/config/config.json') as f:
    data = json.load(f)
    agent_name = data['agent_name']
    xn = data['passcode']
    admin_url = data['adminurl']
    port_number = data['port']

# agent info
agent_ip = subprocess.check_output("hostname -I | awk '{print $1}'", shell=True)[0:-1].decode('utf-8')

def security_analytics():
    threading.Timer(20.0, security_analytics).start()
    # Get CPU usage
    cpu_usage = subprocess.check_output("echo $[100-$(vmstat 1 2|tail -1|awk '{print $15}')]", shell=True)

    # Get Memory usage
    mem_usage = subprocess.check_output("free", shell=True)

    # Create data object to return
    data = {"id": agent_name, "cpu": json.dumps(cpu_usage.decode('utf-8')), "mem": json.dumps(mem_usage.decode('utf-8'))}
    r=requests.post(f"{admin_url}/api/analytics/cpu_mem"    , data=data, verify=False)


def get_processes():
    threading.Timer(60.0, get_processes).start()
    # Get process list
    process_list = subprocess.check_output('ps au', shell=True)

    # Create data object to return
    data = {"id": agent_name, "passcode": xn, "process_list": process_list}
    r=requests.post(f"{admin_url}/api/analytics/insert_process_list", data=data, verify=False)

def file_permission():
    threading.Timer(10.0, file_permission).start()
    lastentry = str(subprocess.check_output('tail -1 /var/lib/agent/logresult.txt', shell=True))
    timeindex = lastentry.find('msg=audit(')
    starttime = lastentry[timeindex+10:timeindex+29]
    starttime = starttime[:11] + "'" + starttime[11:] + "'"
    endtime = datetime.now().strftime("%d-%m-%Y %H:%M:%S").replace('-','/')
    endtime = endtime[:11] + "'" + endtime[11:] + "'"

    updatelogresultnow = os.system('ausearch --start %s --end %s -i --key monitor >> /var/lib/agent/logresult.txt' % (starttime, endtime))
    getlogs = subprocess.check_output('tail -26 /var/lib/agent/logresult.txt', shell=True)
    data = {"agent_name": agent_name, "id": agent_ip, "loglist": json.dumps(getlogs.decode('utf-8'))}
    r= requests.post(f"{admin_url}/api/perm/getpermlogs", data=data, verify=False)

# update ip to admin, runs on startup^M
def update_ip():
    threading.Timer(30.0, update_ip).start()
    uptime = subprocess.check_output("systemctl status agent.service | grep Active -m 1| cut -d ';' -f 2", shell=True)
    request_body = {"ip": agent_ip, "agent_name": agent_name, "uptime": uptime, "port_number": port_number, "passcode": xn}
    r=requests.post(f"{admin_url}/api/agents/update_ip", data=request_body, verify=False)

def chkroot_command():
    threading.Timer(50.0, chkroot_command).start()
    # chk_output = subprocess.check_output(command, shell=True)
    timestamp = '{:%Y-%m-%d_%H.%M.%S}'.format(datetime.now())
    chkreport = subprocess.check_output(f"/var/lib/agent/chkrootkit-0.55/chkrootkit", shell=True)
    request_body = {'report':chkreport.decode('utf-8'), 'datetime':timestamp, "agent": agent_name, 'filename':f"{agent_name}_{timestamp}"}
    headers = {'Digest': hash_json(json.dumps(request_body, separators=(',', ':')), agent_name, xn)}
    r=requests.post(f"{admin_url}/api/intrusion/retrieve_chkrootkit",headers=headers, data=request_body, verify=False)

def snort():    
    threading.Timer(10.0, snort).start()
    alertlogs = ''
    endtime = datetime.now()
    starttime = endtime - timedelta(seconds=10)
    starttime2 = starttime.strftime("%m-%d-%H:%M").replace('-','/',1)
    alertlogs = subprocess.check_output(f"grep -A 100 {starttime2} /var/log/snort/alert", shell=True)
    if alertlogs:
        request_body = {'alert':json.dumps(alertlogs.decode('utf-8')), "agent": agent_name}
        headers = {'Digest': hash_json(json.dumps(request_body, separators=(',', ':')), agent_name, xn)}
        print(headers)
        r=requests.post(f"{admin_url}/api/intrusion/retrieve_snort",headers=headers, data=request_body, verify=False)


def hash_bytes(bytes,nickname,xn):
    bytes = bytes.decode("utf-8") 
    toHash = bytes + nickname + xn
    filehash = hashlib.sha256(toHash.encode('utf-8')).hexdigest()
    print('file hash: '+ filehash)
    return filehash

def hash_file(filename,nickname,xn):
    with open(filename, 'rb') as f:
        bytes = f.read()
        bytes = bytes.decode("utf-8") 
    toHash = bytes + nickname + xn
    filehash = hashlib.sha256(toHash.encode('utf-8')).hexdigest()
    print('file hash: '+ filehash)
    return filehash

def hash_string(string, nickname, xn, original_hash):
    concatString = string + nickname + xn
    print(concatString)
    hash = hashlib.sha256(concatString.encode('utf-8')).hexdigest()
    print(' hash check hash:'+ hash)
    return check_hash(original_hash,hash)
    
def check_hash(original_hash, calculated_hash):
    check = False
    if original_hash == calculated_hash:
        check = True
        return bool(check)

def hash_json(request,nickname,xn):
    concat = request + nickname + xn
    hash = hashlib.sha256(concat.encode('utf-8')).hexdigest()
    print(' hash check hash:'+ hash)
    return hash