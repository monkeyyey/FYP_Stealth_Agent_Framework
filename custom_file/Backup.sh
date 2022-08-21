
#!/bin/bash

#make backup directory if dosent exists
if [ -d "./backup" ]; then
    echo "Backup directory already exists"
else
    mkdir backup
fi
#hardcoded nickname for current system
nickname="yrdemo_agent"

#declaring variables for backup
ssh_ip="192.168.88.200" 
ssh_user="kali"
ssh_pass="kali"
ssh_output="/home/kali/Desktop/backups"
#zipping up files for backup
date=$(date +%d%B%Y)

backupname="${date}_${nickname}"
zip -r ${backupname} backup
#ssh -o StrictHostKeychecking=no kali@${ssh_ip} -p ${ssh_pass}
#sshpass -p ${ssh_pass} scp ${backupname}.zip ${ssh_user}@${ssh_ip}:${ssh_output}
sshpass -p ${ssh_pass} ssh -o StrictHostKeyChecking=no ${ssh_user}@${ssh_ip} exit
sshpass -p ${ssh_pass} scp ${backupname}.zip ${ssh_user}@${ssh_ip}:${ssh_output}

