from threading import Thread
import os

def push(): 
    os.system("python3 /var/lib/agent/agent/push.py")

def server():
    os.system("python3 /var/lib/agent/agent/server.py")

Thread(target = push).start() 
Thread(target = server).start()