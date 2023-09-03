class Excecution {
	constructor() {
		this.status = 'notInProgress';
		this.locked = false;
		this.disableClass('exPauseBtn');
		this.disableClass('exStopBtn');

		this.jobMode = 'all';

		this.pinStack = [];
		this.pinStackIndex = 0;
		this.gbuffer = []; //[{code:,flag:}]
		this.recievedok = true;
		this.waitUntilReady.bind(this);
	}
	setStatus(msg,type,name){
		let ele = document.getElementById('exStatusText');
		ele.innerText = msg;
		ele.className = type;
		this.status = name;
	}
	changeSelector(e){
		this.jobMode = e.target.value;
	}
	updatePinStack(){
		this.pinStack = [];
		for(let i = 0; i < tree.elements.length; i++){
			let element = tree.elements[i];
			if(this.jobMode == "select"){
				if(element.selected){
					if(element.isPin() && !element.hasParentConnector() || tree.selectionHasSameParent()){
						if(element.enabled) this.pinStack.push(element);
					}else if(element.isConnector()){
						for(let k = 0; k < element.pins.length; k++){
							let pin = element.pins[k];
							if(pin.enabled) this.pinStack.push(pin);
						}
					}
				}
			}else{
				if(element.isPin()){
					if(element.enabled) this.pinStack.push(element);
				}
			}
		}
		this.setProgressBar('pinProgress',this.pinStackIndex,this.pinStack.length,'pins');
	}
	ensureLock(){
		if(!this.locked){
			this.updatePinStack();
			this.locked = true;
		}
	}

	addPinToGbuffer(element){
		let gcode = element.solderProfile.compileGcode(element);
		if(!gcode.flag){
			let lines = gcode.code.split('\n');
			for(let i = lines.length-1; i>= 0; i--){
				if(lines[i].length == 0) lines.splice(i,1);
			}

			for(let i = 0; i < lines.length; i++){
				let line = lines[i];
				let flag = false;
				if(i == 0) flag = 'startofpin';
				if(i == lines.length-1) flag = 'endofpin';
				this.gbuffer.push({
					code:line,
					flag:flag
				});
			}
		}
	}

	addStringCodeToGbuffer(gcode){
		let lines = gcode.split('\n');
		for(let i = 0; i < lines.length; i++){
			let line = lines[i];
			if(lines.length > 0){
				this.gbuffer.push({
					code:line,
					flag:false
				});
			}
		}
	}

	async executeGbuffer(options){
		let originalLengthOfGbuffer = this.gbuffer.length;

		while(this.gbuffer.length > 0){
			this.excecuteRichLine(this.gbuffer.shift());
			this.setProgressBar('codeProgress',originalLengthOfGbuffer-this.gbuffer.length,originalLengthOfGbuffer,options.name || 'instructions');
			await this.waitUntilReady(this,100);
		}
	}

	async executeStartOfJob(){
		this.showClass('exStatusPanel');
		this.hideClass('expinprogressstatus');
		this.addStringCodeToGbuffer(config.gcodes.startJob);
		await this.executeGbuffer('start job instructions');
	}
	async executeEndOfJob(){
		this.hideClass('expinprogressstatus');
		this.addStringCodeToGbuffer(config.gcodes.endJob);
		await this.executeGbuffer('end job instructions');
		this.stopAndCancel();
	}

	setProgressBar(id,state,max,label){
		document.getElementById(id).querySelector('.progressBarInside').style.width = ((state/max)*100)+"%";
		document.getElementById(id+"BarText").innerText = state + "/" + max + " " + label;
	}
	//ms is interval to check
	waitUntilReady(instance,ms) {
		return new Promise((resolve, reject) => {
			function checkReadyState(){
				console.log("checking...");
				if(instance.readyForNextLine()) {
					resolve(ms)
				}else{
					setTimeout(checkReadyState,ms);
				}
			}
			checkReadyState();
		})
	}

	readyForNextLine(){
		console.log("checking ready state");
		return this.recievedok;
	}
	excecuteRichLine(line){
		console.log(line.code);
		serial.writeLine(line.code);
		this.recievedok = false;
	}

	async startContinuous(){
		this.ensureLock();
		this.setStatus('Running continuously','good','startContinuous');
		this.enableClass('exPauseBtn');
		this.enableClass('exStopBtn');
		this.disableClass('exStartBtn');
		this.disableClass('exSelect');

		if(this.pinStackIndex == 0) await executeStartOfJob();

		this.showClass('expinprogressstatus');
		while(this.pinStackIndex < this.pinStack.length){
			this.addPinToGbuffer(this.pinStack[this.pinStackIndex]);

			await this.executeGbuffer('instructions');
			this.setProgressBar('pinProgress',this.pinStackIndex+1,this.pinStack.length,'pins');

			this.pinStackIndex++;
		}

		await executeEndOfJob();
	}

	startNextInstruction(){
		this.ensureLock();
		this.setStatus('Running next instruction','good','startNextInstruction');
		this.disableClass('exPauseBtn');
		this.enableClass('exStopBtn');
		this.disableClass('exStartBtn');
		this.disableClass('exSelect');
		this.showClass('exStatusPanel');
	}
	startNextPin(){
		this.ensureLock();
		this.setStatus('Running next pin','good','startNextPin');
		this.enableClass('exPauseBtn');
		this.disableClass('excon');
		this.disableClass('expin');
		this.disableClass('exStartBtn');
		this.disableClass('exSelect');
		this.enableClass('exStopBtn');
		this.showClass('exStatusPanel');
	}
	startNextConnector(){
		this.ensureLock();
		this.setStatus('Running next connector','good','startNextConnector');
		this.enableClass('exPauseBtn');
		this.disableClass('excon');
		this.disableClass('exStartBtn');
		this.disableClass('exSelect');
		this.enableClass('exStopBtn');
		this.showClass('exStatusPanel');
	}
	startTipClean(){
		this.setStatus('Waiting to finish pin...','warning','tipClean');
		this.disableClass('exTipClean');
		this.disableClass('exStartBtn');
		this.enableClass('exStopBtn');
	}
	pauseAfterInstruction(){
		this.setStatus('Pausing after instruction...','warning','pausedAfterInstruction');
		this.disableClass('exPauseBtn');
	}
	pauseAfterPin(){
		this.setStatus('Pausing after pin...','warning','pausedAfterPin');
		this.disableClass('exPauseBtn');
	}
	pauseAfterConnector(){
		this.setStatus('Pausing after connector...','warning','pausedAfterConnector');
		this.disableClass('exPauseBtn');
	}
	stopAndCancel(){
		this.setStatus('Stopped','bad','notInProgress');
		this.disableClass('exPauseBtn');
		this.disableClass('exStopBtn');
		this.enableClass('exTipClean');
		this.locked = false;
		this.enableClass('exStartBtn');
		this.enableClass('exSelect');
		this.hideClass('exStatusPanel');

		this.pinStackIndex = 0;
		this.pinStack = [];
		this.gbuffer = [];
		this.recievedok = true;
	}

	disableClass(className){
		let elements = document.getElementsByClassName(className);
		for(let i = 0; i < elements.length; i++){
			elements[i].disabled = true;
		}
	}
	enableClass(className){
		let elements = document.getElementsByClassName(className);
		for(let i = 0; i < elements.length; i++){
			elements[i].disabled = false;
		}
	}
	hideClass(className){
		let elements = document.getElementsByClassName(className);
		for(let i = 0; i < elements.length; i++){
			elements[i].style.display = 'none';
		}
	}
	showClass(className){
		let elements = document.getElementsByClassName(className);
		for(let i = 0; i < elements.length; i++){
			elements[i].style.display = '';
		}
	}
}
let excecution = new Excecution();
