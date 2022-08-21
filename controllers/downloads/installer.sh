#!/bin/bash
ADMINURL="172.22.92.129"
INSTALLED="no"
ANALYTICS="0"
INTRUSION="0"
PERMISSION="0"
INTEGRITY="0"
port_number=""

while true; do
    read -p "Do you wish to install Stealth Agent Framework? (y/n) " yn
    case $yn in
        [Yy]* )
            printf "\nEnter agent name: "
            read agent_name
            printf "\nChoose agent passcode: "
            read rawcode
            passcode1=$(echo -n $rawcode | sha256sum | cut -c 1-64)
            while true; do
                printf "\nDo you want the Security Analytics Feature? (y/n) "
                read yn1
                case $yn1 in
                    [Yy]* )
                        ANALYTICS="1"
                        echo "Added Security Analytics to installation"
                        break;;
                    [Nn]* )
                        echo "Security Analytics excluded from installation"
                        break;;
                    * ) echo "Please answer yes (y) or no (n)."
                esac
            done
            while true; do
                printf "\nDo you want the Intrusion Detection Feature? (y/n) "
                read yn2
                case $yn2 in
                    [Yy]* )
                        INTRUSION="1"
                        echo "Added Intrusion Detection to installation"
                        break;;
                    [Nn]* )
                        echo "Intrusion Detection excluded from installation"
                        break;;
                    * ) echo "Please answer yes (y) or no (n)."
                esac
            done
            while true; do
                printf "\nDo you want the File Permission Feature? (y/n) "
                read yn3
                case $yn3 in
                    [Yy]* )
                        PERMISSION="1"
                        echo "Added File Permission to installation"
                        break;;
                    [Nn]* )
                        echo "File Permission excluded from installation"
                        break;;
                    * ) echo "Please answer yes (y) or no (n)."
                esac
            done
            while true; do
                printf "\nDo you want the File Integrity Feature? (y/n) "
                read yn4
                case $yn4 in
                    [Yy]* )
                        INTEGRITY="1"
                        echo "Added File Integrity to installation"
                        break;;
                    [Nn]* )
                        echo "File integrity excluded from installation"
                        break;;
                    * ) echo "Please answer yes (y) or no (n)."
                esac
            done 
	    echo "(1) Generating port number..."
            while true; do
                PORT_IN_USE=0
                port_number=$(echo `shuf -i 42511-44175 -n 1`)
                services=$(echo `cat /etc/services | grep $port_number`)
                services_in_use=$(echo `netstat -tupln | grep LISTEN`)
                case $services in
                    *"$port_number"*)
                        PORT_IN_USE=1
                        ;;
                esac
                case $services_in_use in
                    *"$port_number"*)
                        PORT_IN_USE=1
                        ;;
                esac
                if [[ "$PORT_IN_USE" == "0" ]]; then
                    break
                fi
            done 
            echo "(2) Sending installation configuration..."
            curl --insecure -d "agent_name=$agent_name&passcode=$passcode1&analytics=$ANALYTICS&intrusion=$INTRUSION&permission=$PERMISSION&integrity=$INTEGRITY&port_number=$port_number" https://$ADMINURL/api/agents/download_agent
            echo "(3) Configuring firewall..."
            sudo firewall-cmd --permanent --zone=public --add-port=$port_number/tcp
            sudo firewall-cmd --permanent --zone=public --add-service=https
            sudo systemctl start firewalld.service
            sudo systemctl enable firewalld.service
            echo "(4) Installing python3 dependencies..."
            pip3 install flask
            pip3 install flask_cors
            echo "(5) Getting agent installation zip file..."
            wget -O agent.zip --no-check-certificate https://$ADMINURL/api/agents/get_agent_file/$agent_name
            curl --insecure https://$ADMINURL/api/agents/delete_agent_installer/$agent_name
            echo "(6) Unzipping agent..."
            sudo mkdir /var/lib/agent
            sudo unzip ./agent.zip -d /var/lib/agent
            echo "(7) Deleting zipfile..."
            sudo rm ./agent.zip
            echo "(8) Configuring intrusion detection..."
            sudo chmod +x /var/lib/agent/chkrootkit-0.55/chkrootkit
            # echo "(9) Configuring File Permission Monitoring..."
            # sudo echo "" > /etc/audit/rules.d/audit.rules
            # sudo echo "## First rule - delete all" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-D" >> /etc/audit/rules.d/audit.rules
            # sudo echo "## Increase the buffers to survive stress events." >> /etc/audit/rules.d/audit.rules
            # sudo echo "## Make this bigger for busy systems" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-b 8192" >> /etc/audit/rules.d/audit.rules
            # sudo echo "## Failure mode: 0 (silent), 1 (printk, print a failure message), (2, panic, will halt system)" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-f 1" >> /etc/audit/rules.d/audit.rules
            # sudo echo "## user, group, password databases" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /etc/group -p wa -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /etc/passwd -p wa -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /etc/gshadow -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /etc/shadow -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /etc/security/opasswd -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "## login configuration and information" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /etc/ssh/sshd_config -p rwx -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /etc/login.defs -p wa -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /etc/securetty -p wa -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /var/log/faillog -p wa -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /var/log/lastlog -p wa -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /var/log/tallylog -p wa -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "## Monitor for use of process ID change (switching accounts) applications" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /bin/su -p x -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /usr/bin/sudo -p x -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-w /etc/sudoers -p rw -k monitor" >> /etc/audit/rules.d/audit.rules
            # sudo echo "## Custom Monitoring" >> /etc/audit/rules.d/audit.rules
            # sudo echo "\n" >> /etc/audit/rules.d/audit.rules
            # sudo echo "## End of Custom Monitoring" >> /etc/audit/rules.d/audit.rules
            # sudo echo "# To disable adding additional rules. *New rules will require reboot" >> /etc/audit/rules.d/audit.rules
            # sudo echo "-e 2" >> /etc/audit/rules.d/audit.rules
            sudo service auditd restart
            if [[ "$INTEGRITY" == "1" ]]; then
                echo "(10) Configuring file integrity monitoring"
                # Install tripwire
                sudo yum localinstall -y /var/lib/agent/tripwire-2.4.3.7-5.el8.x86_64.rpm 
                sudo rm /var/lib/agent/tripwire-2.4.3.7-5.el8.x86_64.rpm
                sudo tripwire-setup-keyfiles
                sudo tripwire --init
                #write out current crontab
                crontab -l > mycron
                #echo new cron into cron file 
                sudo echo "0 14 * * * /var/lib/agent/integrity/auto" >> mycron
                #install new cron file
                crontab mycron
                rm mycron
            fi
            sudo chmod +x /var/lib/agent/scripts_tripwire/auto
            sudo chmod +x /var/lib/agent/scripts_tripwire/gen_new
            echo "(11) Configuring systemd..."
            sudo mv /var/lib/agent/agent.service /etc/systemd/system/agent.service
            sudo systemctl daemon-reload
            sudo systemctl enable agent.service
            sudo systemctl start agent.service
            break;;
        [Nn]* )
           echo "Cancelled Installation of Stealth Agent Framework"
           exit;;
        * ) echo "Please answer yes (y) or no (n).";;
    esac
done




