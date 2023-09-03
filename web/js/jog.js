class Jog {
	constructor() {
	}
	fanOn(){
		serial.writeLine("M106 P0 S255");
	}
	fanOff(){
		serial.writeLine("M107");
	}
	fanOff(){
		serial.writeLine("M107");
	}
	jogX(amt){
		serial.writeLine("G91"); //realitive mode
		serial.writeLine("G0 X"+amt);
	}
	jogY(amt){
		serial.writeLine("G91"); //realitive mode
		serial.writeLine("G0 Y"+amt);
	}
	jogZ(amt){
		serial.writeLine("G91"); //realitive mode
		serial.writeLine("G0 Z"+amt);
	}
	setServo(angle){
		serial.writeLine("M280 P0 S"+angle);
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


function openExecPanel(panelClass){
	let panels = document.getElementById('execContainer').children;
	for(let i = 0; i < panels.length; i++){
		panels[i].style.display = 'none';
	}

	let elements = document.getElementsByClassName(panelClass);
	for(let i = 0; i < elements.length; i++){
		elements[i].style.display = '';
	}
}

openExecPanel('executionPanel');
