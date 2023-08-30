import eel
import serial
import threading
import queue
import sys

from pprint import pprint
import serial.tools.list_ports

serial_port = False
serial_que = queue.Queue()

#get USB devices
def getUSBDevices():
    devices = []
    for i in serial.tools.list_ports.comports():
        devices.append(i[0])
    return devices

def openPort(port,rate):
    global serial_port
    print("opening port:",port,rate)
    serial_port = serial.Serial(port,baudrate=rate,timeout=0.5)
    serial_que.put(serial_port)

def handle_data(data):
    if(data.encode('ascii') != b''):
        print("data recieved",data)
        eel.recieveSerialLine(data)

def read_from_port(serial_que):
    ser = False
    tmp = False
    i=0
    while True:
        i = i+1
        print("running",i)
        try:
            tmp = serial_que.get(timeout=0.001)
            if tmp is False:
                ser.close()
                print('shutting down from thread')
            else:
                ser = tmp
        except queue.Empty:
            pass

        if not serial_port is False:
            reading = ser.readline().decode('ascii').strip()
            handle_data(reading)

thread = threading.Thread(target=read_from_port, args=(serial_que,))
thread.start()

eel.init('web')

@eel.expose
def connect(port,rate):
    openPort(port,rate)

@eel.expose
def disconnect():
    print("trying to disconnect")
    global serial_port
    serial_port = False
    serial_que.put(serial_port)

@eel.expose
def fetchUSBPorts():
    usbDevices = getUSBDevices()
    return usbDevices

eel.start('index.html', size=(1200, 800), position=(0,0))
