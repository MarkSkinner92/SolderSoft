import eel
import serial
import threading
import queue
import sys

from pprint import pprint
import serial.tools.list_ports

serial_port = False
serial_que = queue.Queue()
writeout_que = queue.Queue()

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


buffer = []
def handle_data(data):
    global buffer
    if(data.encode('ascii') != b''):
        for element in data:
            print(element.encode('ascii'))

            #newline, or "ok"
            if(element == '\n'):
                mergedBuffer = "".join(buffer)
                print("data recieved",mergedBuffer)
                eel.recieveSerialLine(mergedBuffer)
                buffer = []
            else:
                buffer.append(element)

def read_from_port(serial_que, writeout_que):
    ser = False
    tmp = False
    dataToSend = False
    while True:
        # print("running",i)
        try:
            tmp = serial_que.get(timeout=0.001)
            if tmp is False:
                ser.close()
                # print('shutting down from thread')
            else:
                ser = tmp
        except queue.Empty:
            pass

        try:
            dataToSend = writeout_que.get(timeout=0.001)
            if not ser is False:
                ser.write(dataToSend.encode('ascii'))
                dataToSend = False
        except queue.Empty:
            dataToSend = False
            pass

        if not ser is False:
            inWaiting = ser.inWaiting()
            if inWaiting > 0:
                reading = ser.read(inWaiting).decode('ascii')
                handle_data(reading)
                i=0

@eel.expose
def sendGcode(code):
    writeout_que.put(code)
    print("sending:",code)

thread = threading.Thread(target=read_from_port, args=(serial_que,writeout_que))
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
