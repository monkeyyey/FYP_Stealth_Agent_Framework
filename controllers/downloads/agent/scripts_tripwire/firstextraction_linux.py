#tripwire never say the date and time for add/removed objects so I am very sad
import re, sys, os

file_input = sys.argv
# change the txt file name. this text file is the ORIGINAL tripwire report that was piped from twprint command.
print("Generating your first report...")

with open(f"{file_input[1]}", "r") as file:
    # check
    read = file.read() #string

    hostname = re.findall(r'(?:Host name:\s+)(\w.+)', read) #gets the hostname, data type list
    ip_addr = re.findall(r'(?:Host IP address:\s+)(\d.+)', read) #gets IP address, data type list
    filename_patt_added = r'(?:Added object name:  )(\/.+)'
    filename_patt_modified = r'(?:Modified object name:  )(\/.+)'
    filename_patt_removed = r'(?:Removed object name:  )(\/.+)'
    modified_time = r'(?:\s{52})(.+)' #this is for modified objects only + it has to be exactly 52 whitespaces or else it will just return the entire report

    added = re.findall(filename_patt_added, read) #list
    modified = re.findall(filename_patt_modified, read)
    removed = re.findall(filename_patt_removed, read)
    time = re.findall(modified_time, read)
    timenew = time[0::2] #only takes the OBSERVED modified times for modified objects syntax: [start index:stop index:count]

    print('Host name: ', hostname)
    print('IP Addr: ', ip_addr)
    print('Added: ', added) #list
    print('Modded: ',modified)
    print('Removed: ',removed)
    print('Date and Time: ',timenew)

    for match in added:
        print(match)
    
    final = added + modified + removed
    print(final)

#this is the txt file in which the extracted contents will be written to. this information will be sent to the database via JS.
with open(f'./firstinfo.txt', 'w') as report:
    for i in final:
        if i in added:
            # print("added", i)
            report.write(f'Host name: {hostname[0]}\n')
            report.write(f'IP Address: {ip_addr[0]}\n')
            report.write(f'Added {i}\n')
        elif i in modified:
            # print("modified", i)
            report.write(f'Host name: {hostname[0]}\n')
            report.write(f'IP Address: {ip_addr[0]}\n')
            report.write(f'Modified {i}\n')
        else:
            # print("removed", i)
            report.write(f'Host name: {hostname[0]}\n')
            report.write(f'IP Address: {ip_addr[0]}\n')
            report.write(f'Removed {i}\n')
    print('firstinfo.txt created!')
    # with open('./stealth_monkey/tripwire/lastupdated.txt', 'w') as lastupdated:
    #     lastupdated.write("Last updated: firstinfo.txt")

#ignore
# with open('./stealth_monkey/tripwire/info2.txt', 'r') as report:
#     poop = report.readlines()
#     for i in poop:
#         print(re.split(r'(Added\s|Modified\s|Removed\s)(?:\/.+)', i))
#         # print(i)
