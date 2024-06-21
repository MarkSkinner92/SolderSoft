class Jog {
	constructor() {
		this.servoAngleMultiplier = 0.8;
		this.calibrationOffset = {x:0,y:0};
		this.calPos1 = {x:0,y:0};
	}
	fanOn(){
		serial.writeLine("M106 P0 S120");
	}
	fanOff(){
		serial.writeLine("M107");
	}
	async ironOn(){
		if(!serial.connected) return;
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer(config.getGcodeForJob('ironOn'));
			document.getElementById('ironStatus').innerText = 'Turning iron on...';
			document.getElementById('ironStatus').className = 'warning';
			await execution.executeGbuffer((progress,cap)=>{
				document.getElementById('ironStatus').innerText = `Turning iron on (${progress}/${cap})`;
			});
			document.getElementById('ironStatus').innerText = 'Iron on';
			document.getElementById('ironStatus').className = 'good';
		}
	}
	async ironOff(){
		if(!serial.connected) return;
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer(config.getGcodeForJob('ironOff'));
			document.getElementById('ironStatus').innerText = 'Turning iron off...';
			document.getElementById('ironStatus').className = 'warning';
			await execution.executeGbuffer((progress,cap)=>{
				document.getElementById('ironStatus').innerText = `Turning iron off (${progress}/${cap})`;
			});
			document.getElementById('ironStatus').innerText = 'Iron off';
			document.getElementById('ironStatus').className = 'bad';
		}
	}
	jogX(amt){
		serial.writeLine("G91"); //realitive mode
		serial.writeLine("G0 X"+amt+" F800");
	}
	jogY(amt){
		serial.writeLine("G91"); //realitive mode
		serial.writeLine("G0 Y"+amt+" F800");
	}
	jogZ(amt){
		serial.writeLine("G91"); //realitive mode
		serial.writeLine("G0 Z"+amt+" F800");
	}
	setHeadServo(angle){
		serial.writeLine("M280 P1 S"+angle);
	}
	setExtensionServo(angle){
		serial.writeLine("M280 P0 S"+angle);
	}
	servoInputEvent(e){
		let value = e.target.value;
		this.setHeadServo(value);
		document.getElementById('jogServoSlider').value = value;
	}
	servoSliderEvent(e){
		let value = e.target.value;
		this.setHeadServo(value);
		document.getElementById('servoAngleInput').value = value;
	}

	extensionInputEvent(e){
		let value = e.target.value;
		this.setExtensionServo(value);
		document.getElementById('jogExtensionSlider').value = value;
	}
	extensionSliderEvent(e){
		let value = e.target.value;
		this.setExtensionServo(value);
		document.getElementById('extensionAngleInput').value = value;
	}


	servoInputMultiplierEvent(e){
		let value = e.target.value;
		document.getElementById('jogServoMultiplierSlider').value = value;
		this.servoAngleMultiplier = Number(value);
		this.setHeadServo(Number(document.getElementById('servoAngleInput').value));
	}
	servoSliderMultiplierEvent(e){
		let value = e.target.value;
		document.getElementById('servoAngleMultiplier').value = value;
		this.servoAngleMultiplier = Number(value);
		this.setHeadServo(Number(document.getElementById('servoAngleInput').value));
	}
	async homeX(){
		if(!serial.connected) return;
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer(config.getGcodeForJob('homeX'));
			execution.addStringCodeToGbuffer("M114");

			document.getElementById('jogStatus').innerText = 'Homing X';
			await execution.executeGbuffer((progress,cap)=>{
				document.getElementById('jogStatus').innerText = `Homing X (${progress}/${cap})`;
			});
			document.getElementById('jogStatus').innerText = 'X homed';
			config.homeLocation.x = serial.lastKnownPosition.x;
		}
	}
	async homeY(){
		if(!serial.connected) return;
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer(config.getGcodeForJob('homeY'));
			execution.addStringCodeToGbuffer("M114");

			document.getElementById('jogStatus').innerText = 'Homing Y';
			await execution.executeGbuffer((progress,cap)=>{
				document.getElementById('jogStatus').innerText = `Homing Y (${progress}/${cap})`;
			});
			document.getElementById('jogStatus').innerText = 'Y homed';
			config.homeLocation.y = serial.lastKnownPosition.y;
		}
	}
	async homeZ(){
		if(!serial.connected) return;
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer(config.getGcodeForJob('homeZ'));
			execution.addStringCodeToGbuffer("M114");

			document.getElementById('jogStatus').innerText = 'Homing Z';
			await execution.executeGbuffer((progress,cap)=>{
				document.getElementById('jogStatus').innerText = `Homing Z (${progress}/${cap})`;
			});
			document.getElementById('jogStatus').innerText = 'Z homed';
			config.homeLocation.z = serial.lastKnownPosition.z;
		}
	}
	async homeAll(){
		await this.homeX();
		await this.homeY();
		await this.homeZ();
		document.getElementById('jogStatus').innerText = 'Homing Complete';
	}
	async enableMotors(){
		if(!serial.connected) return;
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer(config.getGcodeForJob('enableMotors'));
			document.getElementById('jogStatus').innerText = 'Enabling motors';
			await execution.executeGbuffer((progress,cap)=>{
				document.getElementById('jogStatus').innerText = `Enabling motors (${progress}/${cap})`;
			});
			document.getElementById('jogStatus').innerText = 'Motors Enabled';
		}
	}
	async disableMotors(){
		if(!serial.connected) return;
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer(config.getGcodeForJob('disableMotors'));
			document.getElementById('jogStatus').innerText = 'Disabling motors';
			await execution.executeGbuffer((progress,cap)=>{
				document.getElementById('jogStatus').innerText = `Disabling motors (${progress}/${cap})`;
			});
			document.getElementById('jogStatus').innerText = 'Motors Disabled';
		}
	}
	async enableServo(){
		if(!serial.connected) return;
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer(config.getGcodeForJob('enableServo'));
			document.getElementById('jogStatus').innerText = 'Enabling servo';
			await execution.executeGbuffer((progress,cap)=>{
				document.getElementById('jogStatus').innerText = `Enabling servo (${progress}/${cap})`;
			});
			document.getElementById('jogStatus').innerText = 'Servo Enabled';
		}
	}
	async disableServo(){
		if(!serial.connected) return;
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer(config.getGcodeForJob('disableServo'));
			document.getElementById('jogStatus').innerText = 'Disabling servo';
			await execution.executeGbuffer((progress,cap)=>{
				document.getElementById('jogStatus').innerText = `Disabling servo (${progress}/${cap})`;
			});
			document.getElementById('jogStatus').innerText = 'Servo Disabled';
		}
	}

	// async getCalibrationX(){
	// 	if(!serial.connected) return;
	// 	if(execution.gbuffer.length == 0){
	// 		execution.addStringCodeToGbuffer('M114');
	// 		await execution.executeGbuffer((progress,cap)=>{});
	// 		this.calPos1.x = serial.lastKnownPosition.x;
	// 		this.calPos1.y = serial.lastKnownPosition.y;
	// 		console.log(this.calPos1);
	// 	}
	// }

	// async getCalibrationY(){
	// 	if(!serial.connected) return;
	// 	if(execution.gbuffer.length == 0){
	// 		execution.addStringCodeToGbuffer('M114');
	// 		await execution.executeGbuffer((progress,cap)=>{});
	// 	}
	// 	this.calibrationOffset = {
	// 		x: (serial.lastKnownPosition.x - this.calPos1.x),
	// 		y: (serial.lastKnownPosition.y - this.calPos1.y)
	// 	}
	// 	document.getElementById('dX').value = this.calibrationOffset.x;
	// 	document.getElementById('dY').value = this.calibrationOffset.y;
	// }

	async tipAtReferencePosition(){
		if(!serial.connected) return;
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer('M114');
			await execution.executeGbuffer((progress,cap)=>{});
			config.homeToOrigin.x = serial.lastKnownPosition.x - board.position.x - config.referencePosition.x;
			config.homeToOrigin.y = serial.lastKnownPosition.y - board.position.y - config.referencePosition.x;
			config.homeToOrigin.z = serial.lastKnownPosition.z - board.size.z - config.referencePosition.z;
		}
		projectManager.showBanner(`Set HomeToOrigin Vector to (${config.homeToOrigin.x},${config.homeToOrigin.y},${config.homeToOrigin.z})`,{timeout:5000});
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

openExecPanel('jogcontrols');
