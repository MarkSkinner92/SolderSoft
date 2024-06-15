class Execution {
	constructor() {
		this.status = 'notInProgress';
		this.locked = false;
		this.disableClass('exPauseBtn');
		this.disableClass('exStopBtn');

		this.connected = false;

		this.jobMode = 'all';

		this.pinStack = [];
		this.pinStackIndex = 0;
		this.instructionStackIndex = 0;
		this.tipCleanRequested = false;
		this.tipLife = 1;
		this.tipChangeRequested = false;
		this.hasExecutedStartProcedure = false;
		this.endJobRequest = false;
		this.emergency = false; // when emergency stop is called, this is set. it remains set until a start command is called.
		this.pauseStatusText = 'Waiting for user action';

		this.pauseInstructionIndex = -1;
		this.pausePinIndex = -1;

		this.gbuffer = []; //[{code:,flag:}]
		this.recievedok = true;

		this.inExecutionLoop = false;
	}

	enabledToExecute(){
		return (this.connected && !this.emergency)
	}
	connect(){
		this.connected = true;
		execution.setStatus("Ready","good","ready");
	}
	//called when serial is attempting to be disconnected
	disconnect(){
		this.connected = false;
		execution.setStatus("Not connected","bad","not ready");
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

	async executeGbuffer(progressFunction){
		let originalLengthOfGbuffer = this.gbuffer.length;

		while(this.gbuffer.length > 0){
			if(this.emergency) break;
			this.executeRichLine(this.gbuffer.shift());
			progressFunction(originalLengthOfGbuffer-this.gbuffer.length,originalLengthOfGbuffer);
			await this.waitUntilReady(this,100);
		}
	}

	async executeStartOfJob(){
		if(!serial.connected) return;
		this.showClass('exStatusPanel');
		this.hideClass('expinprogressstatus');
		this.addStringCodeToGbuffer(config.getGcodeForJob('startJob'));
		await this.executeGbuffer((progress,cap)=>{
			this.setProgressBar('codeProgress',progress,cap,'start job instructions');
		});
		this.gbuffer = [];
		this.hasExecutedStartProcedure = true;
	}
	async executeEndOfJob(){
		if(!serial.connected) return;
		this.addStringCodeToGbuffer(config.getGcodeForJob('endJob'));
		await this.executeGbuffer((progress,cap)=>{
			this.setProgressBar('codeProgress',progress,cap,'end job instructions');
		});
		this.hasExecutedStartProcedure = false;
	}
	async executeTipClean(){
		if(!serial.connected) return;
		this.tipCleanRequested = false;
		this.setStatus('Cleaning tip...','good','tipClean');
		this.disableClass('exTip');
		this.disableClass('exStartBtn');
		this.enableClass('exStopBtn');
		this.hideClass('expinprogressstatus');
		this.addStringCodeToGbuffer(config.getGcodeForJob('clean'));
		await this.executeGbuffer((progress,cap)=>{
			this.setProgressBar('codeProgress',progress,cap,'tip clean');
		});
		this.tipLife = 1;
		if(this.hasExecutedStartProcedure) this.showClass('expinprogressstatus');
		this.setStatus('Finished tip cleaning','good','tipClean');
	}
	async executeTipChange(index){
		if(!serial.connected) return;
		let name = index < this.pinStack.length ? this.pinStack[index].solderProfile.getSolderTipName() : "";
		this.tipChangeRequested = false;
		this.setStatus('Changing tip...','warning','tipChange');
		this.disableClass('exTip');
		this.disableClass('exStartBtn');
		this.enableClass('exStopBtn');
		this.hideClass('expinprogressstatus');
		this.addStringCodeToGbuffer(config.getGcodeForJob('tipChange'));
		await this.executeGbuffer((progress,cap)=>{
			this.setProgressBar('codeProgress',progress,cap,'tip change');
		});
		this.pauseStatusText = 'Change tip to: '+name;
		if(this.hasExecutedStartProcedure) this.showClass('expinprogressstatus');
		this.setStatus('Finished tip change','good','tipChange');
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


	//debug mode
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
		if(this.emergency) return true;
		return this.recievedok;
	}
	executeRichLine(line){
		serial.writeLine(line.code);
		console.log("sending",line.code)
		this.recievedok = false;
	}

	async beginExecutionLoop(){
		this.inExecutionLoop = true;

		this.showClass('exStatusPanel');
		this.showClass('excodeprogressstatus');
		this.showClass('expinprogressstatus');
		//if execution is is starting on the first instruction of the first pin, run the init sequence
		if(this.pinStackIndex == 0 && this.instructionStackIndex == 0 && !this.tipCleanRequested && !this.tipChangeRequested){
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
				this.executeRichLine(this.gbuffer[this.instructionStackIndex]);
				this.setProgressBar('codeProgress',this.instructionStackIndex,this.gbuffer.length,'instructions');
				await this.waitUntilReady(this,100);
				this.instructionStackIndex++;
				this.setProgressBar('codeProgress',this.instructionStackIndex,this.gbuffer.length,'instructions');
			}
			//if pin is complete
			if(this.instructionStackIndex == this.gbuffer.length){
				if(this.pauseInstructionIndex != -1) this.pauseInstructionIndex -= this.gbuffer.length;
				this.instructionStackIndex = 0;
				this.gbuffer = [];
				this.tipLife -= (1/Number(this.pinStack[this.pinStackIndex].solderProfile.tipCleanInterval));
				console.log(this.tipLife,this.pinStack[this.pinStackIndex].solderProfile.tipCleanInterval,(1/Number(this.pinStack[this.pinStackIndex].solderProfile.tipCleanInterval)));
				this.pinStackIndex++;

				let nextTipCleanInterval = 0;
				if(this.pinStackIndex < this.pinStack.length) nextTipCleanInterval = 1/(this.pinStack[this.pinStackIndex].solderProfile.tipCleanInterval);
				let autoTipClean = document.getElementById('automaticTipCleaning').checked;
				if(this.tipLife < nextTipCleanInterval && autoTipClean) this.tipCleanRequested = true;

				//automatic tip change after pin
				if(this.detectTipChangeToIndex(this.pinStackIndex)){
					this.pausePinIndex = this.pinStackIndex;
					await this.executeTipChange(this.pinStackIndex);
				}
				//automatic tip clean after pin
				if(this.tipCleanRequested){
					await this.executeTipClean();
				}
				this.setProgressBar('pinProgress',this.pinStackIndex,this.pinStack.length,'pins');
			}else{
				break;
			}
		}

		//if tip clean is needed
		if(this.tipCleanRequested && this.instructionStackIndex == 0){
			await this.executeTipClean();
		}

		//if tip change is needed
		if(this.tipChangeRequested && this.instructionStackIndex == 0){
			await this.executeTipChange(this.pinStackIndex);
		}

		//if execution is finished all the instructions of the last pin, wrap it up
		if(this.pinStackIndex == this.pinStack.length && this.instructionStackIndex == 0){
			if(this.hasExecutedStartProcedure) this.endJobRequest = true;
		}else{
			if(!this.endJobRequest){
				//if the program reaches this point wthout stoping the execution,
				//it must be paused, thus requiring user input
				this.setStatus(this.pauseStatusText,'warning','waitingForUser');
				this.pauseStatusText = 'Waiting for user action';
				console.log('paused');
				this.enableClass('exStopBtn');
				this.disableClass('exPauseBtn');
				this.enableClass('exStartBtn');
				this.enableClass('exTip');
			}
		}

		if(this.endJobRequest){
			this.endJobRequest = false;
			this.setStatus('Executing end job','good','executingEndJob');
			this.disableClass('exStartBtn');
			this.disableClass('exPauseBtn');
			this.disableClass('exTip');
			this.hideClass('expinprogressstatus');
			await this.executeEndOfJob();
			this.hideClass('exStatusPanel');
			this.enableClass('exStartBtn');
			this.disableClass('exPauseBtn');
			this.disableClass('exStopBtn');
			this.enableClass('exTip');
			this.enableClass('exSelect');
			this.setStatus('Job ended','good','jobEnded');
			this.tipCleanRequested = false;
			this.tipChangeRequested = false;
			this.tipLife = 1;
			this.pinStackIndex = 0;
			this.instructionStackIndex = 0;
			this.hasExecutedStartProcedure = false;
			this.gbuffer = []; //[{code:,flag:}]
			this.recievedok = true;
			this.locked = false;
			this.pauseStatusText = 'Waiting for user action';
		}

		this.inExecutionLoop = false;
	}

	shouldProcedeWithPin(){
		let condition = this.pinStackIndex < this.pausePinIndex; //If we're not going to pause at that index
		condition ||= this.pausePinIndex == -1; //or we don't have any intention of pausing
		condition &&= this.pinStackIndex < this.pinStack.length//and a pin at this index exists
		condition &&= !this.endJobRequest//and user has not requested job to end
		return condition;
	}
	shouldProcedeWithInstruction(){
		let condition = this.instructionStackIndex < this.pauseInstructionIndex; //If we're not going to pause at that index
		condition ||= this.pauseInstructionIndex == -1; //or we don't have any intention of pausing
		condition &&= this.instructionStackIndex < this.gbuffer.length//and a pin at this index exists
		condition &&= !this.endJobRequest//and user has not requested job to end
		return condition;
	}
	detectTipChangeToIndex(indexOfNextPin){
		if(indexOfNextPin < this.pinStack.length && indexOfNextPin > 0){
			if(this.pinStack[indexOfNextPin-1].solderProfile.solderingTipId != this.pinStack[indexOfNextPin].solderProfile.solderingTipId){
				return true;
			}
		}
		return false;
	}

	startContinuous(){
		this.emergency = false;
		if(!this.enabledToExecute()) return;
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
		this.emergency = false;
		if(!this.enabledToExecute()) return;
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
		this.emergency = false;
		if(!this.enabledToExecute()) return;
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
		this.emergency = false;
		if(!this.enabledToExecute()) return;
		this.ensureLock();
		this.setStatus('Running next connector','good','startNextConnector');
		this.enableClass('exPauseBtn');
		this.disableClass('excon');
		this.disableClass('exStartBtn');
		this.disableClass('exSelect');
		this.enableClass('exStopBtn');
		this.showClass('exStatusPanel');

		this.pauseInstructionIndex = -1;
		let ogParentId = this.pinStack[this.pinStackIndex].parentConnector?.id;
		this.pausePinIndex = this.pinStackIndex+1;

		while(
			this.pinStack[this.pausePinIndex]?.parentConnector?.id != undefined &&
			this.pinStack[this.pausePinIndex]?.parentConnector?.id == ogParentId
		){
			this.pausePinIndex++;
		}

		this.beginExecutionLoop();
	}
	startTipClean(){
		// debugger;
		this.emergency = false;
		if(!this.enabledToExecute()) return;
		this.setStatus('Waiting to finish pin...','warning','tipClean');
		if(this.pausePinIndex != this.pinStackIndex){ //otherwise we are already paused
			this.pausePinIndex = this.pinStackIndex+1;
		}
		this.pauseInstructionIndex = -1;
		this.pauseInstructionIndex = 0;
		this.pausePinIndex = 0;

		this.tipCleanRequested = true;
		if(!this.inExecutionLoop) this.beginExecutionLoop();
	}
	startTipChange(){
		this.emergency = false;
		if(!this.enabledToExecute()) return;
		this.setStatus('Waiting to finish pin...','warning','tipChange');
		if(this.pausePinIndex != this.pinStackIndex){ //otherwise we are already paused
			this.pausePinIndex = this.pinStackIndex+1;
		}
		this.pauseInstructionIndex = -1;

		this.tipChangeRequested = true;
		if(!this.inExecutionLoop) this.beginExecutionLoop();
	}
	pauseAfterInstruction(){
		if(!this.enabledToExecute()) return;
		this.setStatus('Pausing after instruction...','warning','paused');
		this.disableClass('exPauseBtn');
		this.pauseInstructionIndex = this.instructionStackIndex+1;
		this.pausePinIndex = -1;
	}
	pauseAfterPin(){
		if(!this.enabledToExecute()) return;
		this.setStatus('Pausing after pin...','warning','paused');
		this.disableClass('exPauseBtn');
		this.pausePinIndex = this.pinStackIndex+1;
		this.pauseInstructionIndex = -1;
	}
	pauseAfterConnector(){
		if(!this.enabledToExecute()) return;
		this.setStatus('Pausing after connector...','warning','paused');
		this.disableClass('exPauseBtn');

		this.pauseInstructionIndex = -1;
		let ogParentId = this.pinStack[this.pinStackIndex].parentConnector?.id;
		this.pausePinIndex = this.pinStackIndex+1;

		while(
			this.pinStack[this.pausePinIndex]?.parentConnector?.id != undefined &&
			this.pinStack[this.pausePinIndex]?.parentConnector?.id == ogParentId
		){
			this.pausePinIndex++;
		}
	}
	endJob(){ //ui click
		this.setStatus('Ending job...','warning','endingJob');
		this.disableClass('exStopBtn');
		this.endJobRequest = true;
		if(!this.inExecutionLoop) this.beginExecutionLoop();
	}

	emergencyStop(){ // stop and cancel any running execution loops, and send emergency stop command M410
		// this.endJobRequest = false;
		this.emergency = true;
		// this.setStatus('EMERGENCY STOP','good','executingEmStop');
		// this.hideClass('expinprogressstatus');
		// this.hideClass('exStatusPanel');
		// this.enableClass('exStartBtn');
		// this.disableClass('exPauseBtn');
		// this.disableClass('exStopBtn');
		// this.enableClass('exTip');
		// this.enableClass('exSelect');
		// this.tipCleanRequested = false;
		// this.tipChangeRequested = false;
		// this.tipLife = 1;
		// this.pinStackIndex = 0;
		// this.instructionStackIndex = 0;
		// this.hasExecutedStartProcedure = false;
		// this.gbuffer = []; //[{code:,flag:}]
		// this.recievedok = true;
		// this.locked = false;
		// serial.writeLine("M114"); // Stop all steppers instantly
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
let execution = new Execution();
