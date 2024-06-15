class Execution {
	constructor() {
		this.locked = false;
		this.disableClass('exPauseBtn');
		this.disableClass('exStopBtn');

		this.connected = false;

		this.jobMode = 'all';
		this.pinStack = [];

		this.gbuffer = []; //[{code:,flag:}]
		this.recievedok = true;

		this.state = {
			request : '',
			inExecutionLoop : false,
			shouldDoStartProcedure : true,
			pauseAfterPin : false,
			pauseAfterConnector : false,
			tipCleanRequested : false,
			tipChangeRequested : false,
			endJobRequest : false,
			numberOfPins : 0
		}
	}

	unableToExecute(){
		if(!this.connected) return true;

		for(let i = 0; i < tree.elements.length; i++){
			let element = tree.elements[i];
			if(this.jobMode == "select"){
				if(element.selected){
					if(element.isPin() && !element.hasParentConnector() || tree.selectionHasSameParent()){
						if(element.enabled) return false;
					}else if(element.isConnector()){
						for(let k = 0; k < element.pins.length; k++){
							let pin = element.pins[k];
							if(pin.enabled) return false;
						}
					}
				}
			}else{
				if(element.isPin()){
					if(element.enabled) return false;
				}
			}
		}

		return true;
	}

	async launchExecutionLoop(){
		if(this.state.inExecutionLoop) return;

		while(this.state.request != ''){
			this.state.inExecutionLoop = true;

			if(this.state.request == 'pin'){

				// Before doing a pin, make sure the start procedure is called
				if(this.state.shouldDoStartProcedure){
					// compile the pinstack
					this.updatePinStack();
					this.state.numberOfPins = this.pinStack.length;
					this.setProgressBar('pinProgress',0,this.state.numberOfPins,'pins');

					// Do the start procedure
					await this.doStartProcedure();
					this.state.shouldDoStartProcedure = false;
				}

				let thisPinsParentID = this.pinStack[0].parentConnector.id;
				let nextPinIsFromADifferentConnector = false;
				if(this.pinStack.length > 1){
					nextPinIsFromADifferentConnector = (thisPinsParentID != this.pinStack[1].parentConnector.id); 
				}
				// Do the pin procedure
				await this.doPinProcedure();

				if(this.state.endJobRequest){
					this.state.request = 'endjob';
				} 
				else if(this.state.tipCleanRequested){
					this.state.request = 'tipclean';
				} 
				else if(this.state.tipChangeRequested){
					this.state.request = 'tipchange';
				} 
				else if(this.state.pauseAfterPin || (this.state.pauseAfterConnector && nextPinIsFromADifferentConnector)){
					this.state.request = '';
				}
				else if(this.pinStack.length == 0){
					this.state.request = 'endjob';
				}
				else{
					this.state.request = 'pin';
				}
			}

			if(this.state.request == 'tipclean'){
				//Do tip clean procedure
				this.state.tipCleanRequested = false;

				await this.doTipCleanProcedure();

				if(this.state.tipCleanRequested){
					this.state.request = 'tipclean';
				}
				else{
					this.state.request = '';
				}
			}

			if(this.state.request == 'tipchange'){
				//Do tip change procedure
				this.state.tipChangeRequested = false;

				await this.doTipChangeProcedure();

				if(this.state.tipChangeRequested){
					this.state.request = 'tipchange';
				}
				else{
					this.state.request = '';
				}
			}

			if(this.state.request == 'endjob'){
				//Do end job procedure
				await this.doEndJobProcedure();

				this.state.endJobRequest = false;
				this.state.shouldDoStartProcedure = true;
				this.state.request = '';
				this.enableClass('exSelect');
				tree.removeAllSelectedElements();
			}
		}
		
		this.state.inExecutionLoop = false;

		if(this.pinStack.length != 0 || this.state.shouldDoStartProcedure) this.enableClass('exStartBtn');
	}

	async doStartProcedure(){
		this.setStatus('Start Procedure','good');
		this.showClass('exStatusPanel');
		this.showClass('excodeprogressstatus');
		this.hideClass('expinprogressstatus');

		this.addStringCodeToGbuffer(config.getGcodeForJob('startJob'));
		await this.executeGbuffer((progress,cap)=>{
			this.setProgressBar('codeProgress',progress,cap,'start job instructions');
		});

		this.setStatus('Start Complete','good');
	}
	async doPinProcedure(){
		if(this.state.pauseAfterConnector)
			this.setStatus('Running One Connector','good');
		else if(this.state.pauseAfterPin)
			this.setStatus('Running One Pin','good');
		else
			this.setStatus('Running','good');

		this.showClass('exStatusPanel');
		this.showClass('expinprogressstatus');
		this.showClass('excodeprogressstatus');

		let pin = this.pinStack.shift();
		this.addPinToGbuffer(pin);
		tree.focusOnElement(pin);
		await this.executeGbuffer((progress,cap)=>{
			this.setProgressBar('codeProgress',progress,cap,'pin instructions');
		});

		this.setProgressBar('pinProgress',this.state.numberOfPins - this.pinStack.length,this.state.numberOfPins,'pins');

		this.setStatus('Paused...','warning');
		this.hideClass('excodeprogressstatus');
	}
	async doTipChangeProcedure(){
		this.setStatus('Changing Tip...','warning');
		this.showClass('exStatusPanel');
		this.showClass('excodeprogressstatus');
		this.hideClass('expinprogressstatus');

		this.addStringCodeToGbuffer(config.getGcodeForJob('tipChange'));
		await this.executeGbuffer((progress,cap)=>{
			this.setProgressBar('codeProgress',progress,cap,'tip change');
		});

		this.setStatus('Please change tip','warning');
		this.showClass('expinprogressstatus');
		this.hideClass('excodeprogressstatus');
		if(this.pinStack.length != 0 || this.state.shouldDoStartProcedure) this.enableClass('exStartBtn');
		this.enableClass('exTip');
		if(this.state.shouldDoStartProcedure) this.hideClass('exStatusPanel');
	}
	async doTipCleanProcedure(){
		this.setStatus('Cleaning Tip...','warning');
		this.showClass('exStatusPanel');
		this.showClass('excodeprogressstatus');
		this.hideClass('expinprogressstatus');

		this.addStringCodeToGbuffer(config.getGcodeForJob('clean'));
		await this.executeGbuffer((progress,cap)=>{
			this.setProgressBar('codeProgress',progress,cap,'tip clean');
		});

		this.setStatus('Tip Clean Complete','good');
		this.showClass('expinprogressstatus');
		this.hideClass('excodeprogressstatus');
		if(this.pinStack.length != 0 || this.state.shouldDoStartProcedure) this.enableClass('exStartBtn');
		this.enableClass('exTip');
		if(this.state.shouldDoStartProcedure) this.hideClass('exStatusPanel');
	}
	async doEndJobProcedure(){
		this.setStatus('Ending job...','warning');
		this.showClass('exStatusPanel');
		this.showClass('excodeprogressstatus');
		this.hideClass('expinprogressstatus');
		this.disableClass('exStartBtn');
		this.disableClass('exStopBtn');
		this.disableClass('exPauseBtn');
		this.disableClass('exTip');

		this.addStringCodeToGbuffer(config.getGcodeForJob('endJob'));
		await this.executeGbuffer((progress,cap)=>{
			this.setProgressBar('codeProgress',progress,cap,'end job instructions');
		});
		
		this.setStatus('End Job Complete','good');
		this.hideClass('exStatusPanel');
		this.setStatus('Job Ended', 'good');
		this.showClass('exSelect')
		this.enableClass('exStartBtn');
		this.enableClass('exTip');
	}

	connect(){
		this.connected = true;
		execution.setStatus("Ready","good");
	}
	//called when serial is attempting to be disconnected
	disconnect(){
		this.connected = false;
		execution.setStatus("Not connected","bad");
	}
	setStatus(msg,type){
		let ele = document.getElementById('exStatusText');
		ele.innerText = msg;
		ele.className = type;
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
	executeRichLine(line){
		serial.writeLine(line.code);
		console.log("sending",line.code)
		this.recievedok = false;
	}

	
	// this.addStringCodeToGbuffer(config.getGcodeForJob('clean'));
	// await this.executeGbuffer((progress,cap)=>{
	// 	this.setProgressBar('codeProgress',progress,cap,'tip clean');
	// });

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

	readyForNextLine(){
		console.log("checking ready state");
		if(this.emergency) return true;
		return this.recievedok;
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



	/*
	The flow of this part is very complicated, becuase of the state management.
	Here's the plan:

	pinProcedure() will either
		1. call itself
		2. call cleanProcedure
		3. call changeProcedure
		4. call the end procedure
		5. exit without any calls

	tipcleanProcedure() will either
		1. call cleanProcedure
		2. exit without any calls

	

	*/

	startContinuous(){
		if(this.unableToExecute()) return;

		this.state.request = 'pin';
		this.state.pauseAfterPin = false;
		this.state.pauseAfterConnector = false;

		this.enableClass('exPauseBtn');
		this.enableClass('exStopBtn');
		this.disableClass('exStartBtn');
		this.disableClass('exSelect');

		this.launchExecutionLoop();
	}

	startNextPin(){
		if(this.unableToExecute()) return;
		
		this.state.request = 'pin';
		this.state.pauseAfterPin = true;
		this.state.pauseAfterConnector = false;

		this.enableClass('exPauseBtn');
		this.disableClass('excon');
		this.disableClass('expin');
		this.disableClass('exStartBtn');
		this.disableClass('exSelect');
		this.enableClass('exStopBtn');

		this.launchExecutionLoop();
	}

	startNextConnector(){
		if(this.unableToExecute()) return;
		
		this.state.request = 'pin';
		this.state.pauseAfterPin = false;
		this.state.pauseAfterConnector = true;

		this.enableClass('exPauseBtn');
		this.disableClass('excon');
		this.disableClass('exStartBtn');
		this.disableClass('exSelect');
		this.enableClass('exStopBtn');

		this.launchExecutionLoop();
	}

	startTipClean(){
		if(this.unableToExecute()) return;
		
		this.state.request = 'tipclean';
		this.state.tipCleanRequested = true;

		this.disableClass('exStartBtn');
		this.disableClass('exPauseBtn');
		this.disableClass('exTip');
		this.setStatus('Requesting tip clean...', 'warning');

		this.launchExecutionLoop();
	}

	startTipChange(){
		if(this.unableToExecute()) return;
		
		this.state.request = 'tipchange';
		this.state.tipChangeRequested = true;

		this.disableClass('exStartBtn');
		this.disableClass('exPauseBtn');
		this.disableClass('exTip');
		this.setStatus('Requesting Tip Change...', 'warning');

		this.launchExecutionLoop();
	}

	pauseAfterPin(){
		if(this.unableToExecute()) return;
		
		this.state.pauseAfterPin = true;

		this.setStatus('Pausing after pin', 'warning');
		this.disableClass('exPauseBtn');
	}

	pauseAfterConnector(){
		if(this.unableToExecute()) return;
		
		this.state.pauseAfterConnector = true;

		this.setStatus('Pausing after connector', 'warning');
		this.disableClass('excon');
	}

	endJob(){ //ui click
		if(this.unableToExecute()) return;
		
		this.state.endJobRequest = true;
		this.state.request = 'endjob';

		this.setStatus('Requesting End Job', 'warning');
		this.disableClass('exStopBtn');
		this.disableClass('exPauseBtn');

		this.launchExecutionLoop();
	}

	emergencyStop(){ // stop and cancel any running execution loops, and send emergency stop command M410
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
