
import serial
serial_port = False

print(serial_port is False)

serial_port = serial.Serial('/dev/ttyUSB0', 9600)
serial_port.close()

serial_port = False

print(not serial_port is False)
