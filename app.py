import wx
import eel
import serial
import threading
import queue
import sys
import json

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
    serial_port.write("M114\n".encode('ascii')) #get status
    serial_que.put(serial_port)


buffer = []
def handle_data(data):
    global buffer
    if(data.encode('ascii') != b''):
        for element in data:
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
            if not ser is False:
                if ser.is_open:
                    inWaiting = ser.inWaiting()
                    if inWaiting > 0:
                        reading = ser.read(inWaiting).decode('ascii')
                        handle_data(reading)

                    dataToSend = writeout_que.get(timeout=0.001)
                    ser.write(dataToSend.encode('ascii'))
                    dataToSend = False

        except queue.Empty:
            dataToSend = False
            pass

@eel.expose
def sendGcode(code):
    writeout_que.put(code)
    print("sending:",code)

thread = threading.Thread(target=read_from_port, args=(serial_que,writeout_que))
thread.setDaemon(True)
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

@eel.expose
def openJSONfile(wildcard="*"):
    app = wx.App(None)
    style = wx.FD_OPEN | wx.FD_FILE_MUST_EXIST
    dialog = wx.FileDialog(None, 'Open', wildcard=wildcard, style=style)
    if dialog.ShowModal() == wx.ID_OK:
        path = dialog.GetPath()
    else:
        path = None
    dialog.Destroy()

    if path is None:
        return "cancel"

    f = open(path)
    fc = json.load(f)
    fc['path'] = path
    f.close()
    return fc

@eel.expose
def savePackage(pkg):
    path = pkg['path']
    json_object = json.dumps(pkg, indent=2)
    # Writing to sample.json
    outfile = open(path, "w")
    try:
        outfile.write(json_object)
        outfile.close()
        return "success"
    except:
        outfile.close()
        return "failed"

@eel.expose
def savePackageAs(pkg,wildcard="*"):
    print("saving as...")
    app = wx.App(None)
    style = wx.FD_SAVE
    dialog = wx.FileDialog(None, 'Open', wildcard=wildcard, style=style)
    if dialog.ShowModal() == wx.ID_OK:
        path = dialog.GetPath()
    else:
        path = None
    dialog.Destroy()
    print(path)

    if not path is None:
        json_object = json.dumps(pkg, indent=2)
        outfile = open(path,'w+')
        try:
            outfile.write(json_object)
            outfile.close()
            return {"status":"success","path":path}
        except:
            return {"status":"failed","path":path}
            outfile.close()
    return {"status":"cancel"}


eel.start('index.html', size=(1200, 800), position=(0,0))
