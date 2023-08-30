import eel
import serial
import re
import subprocess
from pprint import pprint
import serial

#get USB devices
def getUSBDevices():
    device_re = re.compile(b"Bus\s+(?P<bus>\d+)\s+Device\s+(?P<device>\d+).+ID\s(?P<id>\w+:\w+)\s(?P<tag>.+)$", re.I)
    df = subprocess.check_output("lsusb")
    devices = []
    for i in df.split(b'\n'):
        if i:
            info = device_re.match(i)
            if info:
                dinfo = info.groupdict()
                dinfo['device'] = '/dev/bus/usb/%s/%s' % (dinfo.pop('bus'), dinfo.pop('device'))
                devices.append(dinfo)
    return devices

def openPort(port,rate):
    global ser
    ser = serial.Serial(port, rate)


eel.init('web')

@eel.expose
def connect(rate):
    openPort('/dev/ttyUSB0',rate)

eel.start('index.html', size=(1200, 800), position=(0,0))
