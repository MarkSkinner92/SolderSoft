class Jog {
	constructor() {
	}
	fanOn(){
		serial.sendGcode("M106 P0 S255");
	}
	fanOff(){
		serial.sendGcode("M107");
	}
	fanOff(){
		serial.sendGcode("M107");
	}
	jogX(amt){
		serial.sendGcode("G91"); //realitive mode
		serial.sendGcode("G0 X"+amt);
	}
	jogY(amt){
		serial.sendGcode("G91"); //realitive mode
		serial.sendGcode("G0 Y"+amt);
	}
	jogZ(amt){
		serial.sendGcode("G91"); //realitive mode
		serial.sendGcode("G0 Z"+amt);
	}
	setServo(angle){
		serial.sendGcode("M280 P0 S"+angle);
	}
	servoSliderEvent(e){
		let value = e.target.value;
		this.setServo(value);
		document.getElementById('servoAngleInput').value = value;
	}
	servoInputEvent(e){
		let value = e.target.value;
		this.setServo(value);
		document.getElementById('jogServoSlider').value = value;
	}
}

let jog = new Jog();
