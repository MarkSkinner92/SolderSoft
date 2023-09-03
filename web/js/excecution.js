class Excecution {
	constructor() {
		this.status = 'notInProgress';
		this.locked = false;
		this.disableClass('exPauseBtn');
		this.disableClass('exStopBtn');

		this.jobMode = 'all';

		this.pinStack = [];
		this.pinStackIndex = 0;
		this.instructionStackIndex = 0;

		this.pauseInstructionIndex = -1;
		this.pausePinIndex = -1;

		this.gbuffer = []; //[{code:,flag:}]
		this.recievedok = true;
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

	async executeGbuffer(name){
		let originalLengthOfGbuffer = this.gbuffer.length;

		while(this.gbuffer.length > 0){
			this.excecuteRichLine(this.gbuffer.shift());
			this.setProgressBar('codeProgress',originalLengthOfGbuffer-this.gbuffer.length,originalLengthOfGbuffer,name || 'instructions');
			await this.waitUntilReady(this,100);
		}
	}

	async executeStartOfJob(){
		this.showClass('exStatusPanel');
		this.hideClass('expinprogressstatus');
		this.addStringCodeToGbuffer(config.gcodes.startJob);
		await this.executeGbuffer('start job instructions');
		this.gbuffer = [];
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
			// let timeoutCounter = 0;
			function checkReadyState(){
				console.log("checking...");
				if(instance.readyForNextLine()) {
					resolve(ms)
				}else{
					// timeoutCounter++;
					setTimeout(checkReadyState,ms);
				}
			}
			checkReadyState();
		})
	}


	// ms is interval to check
	// waitUntilReady(instance,ms) {
	// 	return new Promise((resolve, reject) => {
	// 		function checkReadyState(){
	// 			resolve(ms)
	// 		}
	// 		setTimeout(checkReadyState,ms);
	// 	});
	// }

	readyForNextLine(){
		console.log("checking ready state");
		return this.recievedok;
	}
	excecuteRichLine(line){
		console.log(line.code);
		serial.writeLine(line.code);
		this.recievedok = false;
	}

	async beginExecutionLoop(){
		this.showClass('exStatusPanel');
		//if execution is is starting on the first instruction of the first pin, run the init sequence
		if(this.pinStackIndex == 0 && this.instructionStackIndex == 0){
			await this.executeStartOfJob();
		}

		this.showClass('expinprogressstatus');
		while(this.shouldProcedeWithPin()){
			this.setProgressBar('pinProgress',this.pinStackIndex,this.pinStack.length,'pins');
			if(this.gbuffer.length == 0){
				this.addPinToGbuffer(this.pinStack[this.pinStackIndex]);
				tree.focusOnElement(this.pinStack[this.pinStackIndex]);
				this.instructionStackIndex = 0;
			}
			while(this.shouldProcedeWithInstruction()){
				this.excecuteRichLine(this.gbuffer[this.instructionStackIndex]);
				this.setProgressBar('codeProgress',this.instructionStackIndex,this.gbuffer.length,'instructions');
				await this.waitUntilReady(this,100);

				this.instructionStackIndex++;
				this.setProgressBar('codeProgress',this.instructionStackIndex,this.gbuffer.length,'instructions');
			}
			if(this.gbuffer.length == this.instructionStackIndex){
				if(this.pauseInstructionIndex != -1){
					this.pauseInstructionIndex -= this.gbuffer.length;
				}
				this.pinStackIndex++;
				this.gbuffer = [];
				this.instructionStackIndex = 0;
				this.setProgressBar('pinProgress',this.pinStackIndex,this.pinStack.length,'pins');
			}else{
				break;
			}
		}

		//if execution is finished all the instructions of the last pin, wrap it up
		if(this.pinStackIndex == this.pinStack.length && this.instructionStackIndex == 0){
			await this.executeEndOfJob();
		}else{
			//if the program reaches this point wthout stoping the execution,
			// it must be paused, thus requiring user input
			this.setStatus('Waiting for user action','warning','waitingForUser');
			this.enableClass('exStopBtn');
			this.disableClass('exPauseBtn');
			this.enableClass('exStartBtn');
			this.enableClass('exTipClean');
		}
	}

	shouldProcedeWithPin(){
		let condition = this.pinStackIndex < this.pausePinIndex; //If we're not going to pause at that index
		condition ||= this.pausePinIndex == -1; //or we don't have any intention of pausing
		condition &&= this.pinStackIndex < this.pinStack.length//and a pin at this index exists
		return condition;
	}
	shouldProcedeWithInstruction(){
		let condition = this.instructionStackIndex < this.pauseInstructionIndex; //If we're not going to pause at that index
		condition ||= this.pauseInstructionIndex == -1; //or we don't have any intention of pausing
		condition &&= this.instructionStackIndex < this.gbuffer.length//and a pin at this index exists
		return condition;
	}

	startContinuous(){
		this.ensureLock();
		this.setStatus('Running continuously','good','startContinuous');
		this.enableClass('exPauseBtn');
		this.enableClass('exStopBtn');
		this.disableClass('exStartBtn');
		this.disableClass('exSelect');

		//specify no intention of pausing until finished
		this.pausePinIndex = -1;
		this.pauseInstructionIndex = -1;
		this.beginExecutionLoop();
	}

	startNextInstruction(){
		this.ensureLock();
		this.setStatus('Running next instruction','good','startNextInstruction');
		this.disableClass('exPauseBtn');
		this.enableClass('exStopBtn');
		this.disableClass('exStartBtn');
		this.disableClass('exSelect');
		this.showClass('exStatusPanel');

		//specify pause at next instruction
		this.pausePinIndex = -1;
		this.pauseInstructionIndex = this.instructionStackIndex+1;
		this.beginExecutionLoop();
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

		//specify pause at next pin
		this.pausePinIndex = this.pinStackIndex+1;
		this.pauseInstructionIndex = -1;
		this.beginExecutionLoop();
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
		this.pauseInstructionIndex = this.instructionStackIndex+1;
		this.pausePinIndex = -1;
	}
	pauseAfterPin(){
		this.setStatus('Pausing after pin...','warning','pausedAfterPin');
		this.disableClass('exPauseBtn');
		this.pausePinIndex = this.pinStackIndex+1;
		this.pauseInstructionIndex = -1;
	}
	pauseAfterConnector(){
		this.setStatus('Pausing after connector...','warning','pausedAfterConnector');
		this.disableClass('exPauseBtn');
	}
	stopAndCancel(){
		this.setStatus('Not running','bad','notInProgress');
		this.disableClass('exPauseBtn');
		this.disableClass('exStopBtn');
		this.enableClass('exTipClean');
		this.locked = false;
		this.enableClass('exStartBtn');
		this.enableClass('exSelect');
		this.hideClass('exStatusPanel');
		tree.removeAllSelectedElements();

		this.pinStack = [];
		this.pinStackIndex = 0;
		this.instructionStackIndex = 0;
		this.pauseInstructionIndex = -1;
		this.pausePinIndex = -1;
		this.gbuffer = []; //[{code:,flag:}]
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
