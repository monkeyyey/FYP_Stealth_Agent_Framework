import difflib, re, sys
from difflib import Differ

files_input = sys.argv

# the first argument is yesterday's file, followed by today's file
print(f"Running {files_input[0]}...")

hostname_patt = r'(?:Host name:\s+)(\w.+)'
ip_addr_patt = r'(?:Host IP address:\s+)(\d.+)'
filename_patt_added = r'\+(?:Added object name:  )(\/.+)'
filename_patt_modified = r'\+(?:Modified object name:  )(\/.+)'
filename_patt_removed = r'\+(?:Removed object name:  )(\/.+)'
modified_time = r'\+(?:\s{51,52})(.+)'

# extracts the necessary information into a text file for the NEWEST file
with open(f"{files_input[2]}", "r") as file:
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

    # for match in added:
    #     print(match)
    
    final = added + modified + removed
    # print(final)

# old file to read
with open(f'{files_input[1]}') as file_1:
    file_1_text = file_1.readlines()

# new file to
with open(f'{files_input[2]}') as file_2:
    file_2_text = file_2.readlines()

with open(f'.updates.txt', 'w') as update:
    # timelist = []
    # if re.search(modified_time, line):
    #     newline = re.split(modified_time, line)
    #     timelist.append(newline[1])
    #     timenew = timelist[0::2]
    with open(f'{files_input[1]}') as file1, open(f'{files_input[2]}') as file2:
        differ = Differ()
        for line in differ.compare(file1.readlines(), file2.readlines()):
            # print(line)
            if re.search(hostname_patt, line):
                hostname = "+Host name: " + re.split(hostname_patt, line)[1] + "\n"
            elif re.search(ip_addr_patt, line):
                ip_addr = "+Host IP Address: " + re.split(ip_addr_patt, line)[1] + "\n"

            if re.search(filename_patt_added, line):
                update.write(hostname)
                update.write(ip_addr)
                update.write(line)
            elif re.search(filename_patt_modified, line):
                update.write(hostname)
                update.write(ip_addr)
                update.write(line)
            elif re.search(filename_patt_removed, line):
                update.write(hostname)
                update.write(ip_addr)
                update.write(line)
