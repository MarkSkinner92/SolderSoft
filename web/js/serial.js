//manages everyhing to do with the serial ports
//and the UI related to serial

class Serial {
	constructor() {
		this.connected = false;
		this.attemptingToConnect = false;
		this.attemptingToDisconnect = false;

		this.serialMonitors = [];
	}

	async connect(){
		this.attemptingToConnect = true;
		this.setStatus("Connecting...","warning");
		this.setActionButtonText();
		let baudRate = this.getBaudRate();
		let port = this.getPreferedPort();
		if(port && baudRate){
			await eel.connect(port,baudRate)();
		}
	}
	async disconnect(){
		this.attemptingToConnect = false;
		this.attemptingToDisconnect = true;
		this.setStatus("Disconnecting...","warning");
		await eel.disconnect()();
		this.attemptingToDisconnect = false;
		this.connected = false;
		this.setActionButtonText();
		this.setStatus("Not connected","bad");
	}

	registerSerialMonitor(sm){
		this.serialMonitors.push(sm);
	}

	serialActionButtonClick(){
		if(!this.connected && !this.attemptingToConnect){
			this.connect();
		}
		else if(this.connected && !this.attemptingToDisconnect){
			this.disconnect();
		}
		else if(this.attemptingToConnect && !this.connected){
			this.disconnect();
		}
	}

	setActionButtonText(){
		if(this.connected){
			document.getElementById('serialActionButton').innerText = 'Disconnect';
		}else{
			if(this.attemptingToConnect){
				document.getElementById('serialActionButton').innerText = 'Cancel';
			}else{
				document.getElementById('serialActionButton').innerText = 'Connect';
			}
		}
	}

	getBaudRate(){
		let rate = Number(document.getElementById('baudRate').value);
		return rate;
	}
	//colorMode string: good, warning, bad
	setStatus(text,colorMode){
		let statusElement = document.getElementById('statusElement');
		statusElement.className = colorMode;
		statusElement.innerText = text;
	}

	updatePortDropdown(ports){
		let dropdown = document.getElementById('portSelect');
		let newoptions = "";
		for(let i = 0; i < ports.length; i++){
			newoptions += `<option value="${ports[i]}">${ports[i]}</option>`;
		}
		dropdown.innerHTML = newoptions;
	}
	getPreferedPort(){
		return document.getElementById('portSelect').value;
	}

	async fetchUSBPorts(){
		let ports = await eel.fetchUSBPorts()();
		this.updatePortDropdown(ports);
	}

	recieveLine(line){
		if(line == "start" || line == "ok"){
			excecution.recievedok = true;
			this.connected = true;
			this.attemptingToConnect = false;
			console.log("setting status good");
			this.setActionButtonText();
			this.setStatus("Connected","good");
		}
		this.sendToSerialMonitors(line);
	}

	sendToSerialMonitors(line){
		for(let i = 0; i < this.serialMonitors.length; i++){
			let monitor = this.serialMonitors[i];
			monitor.put(line);
		};
	}

	writeLine(code){
		if(window.hasOwnProperty('eel')) eel.sendGcode(code+'\n');
	}
}

let serial = new Serial();

class SerialMonitor {
	constructor(output,input,send) {
		this.output = output;
		this.input = input;
		this.send = send;
		this.history = [];
		this.historyIndex = 0;

		this.onSendClick = this.onSendClick.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);

		this.send.onclick = this.onSendClick;
		this.input.onkeyup = this.onKeyUp;
	}

	onSendClick(){
		let value = this.input.value;
		serial.writeLine(value);
		this.history.unshift(value);
		if(this.history.length >= 30) this.history.pop();
		this.input.value = '';
	}

	onKeyUp(e){
		console.log(e);
		if(e.key == 'ArrowUp'){
			this.historyIndex++;
			if(this.historyIndex < this.history.length && this.historyIndex >= 0){
				this.input.value = this.history[this.historyIndex];
			}
			else this.input.value = '';
		}else if(e.key == 'ArrowDown'){
			this.historyIndex--;
			if(this.historyIndex < this.history.length && this.historyIndex >= 0){
				this.input.value = this.history[this.historyIndex];
			}
			else this.input.value = '';
		}else if(e.key == 'Enter'){
			this.historyIndex = -1;
			this.onSendClick();
		}
	}

	put(line){
		this.output.value += (line+'\n');
	}
}

let serialMonitor = new SerialMonitor(
	document.getElementById('sm_output'),
	document.getElementById('sm_input'),
	document.getElementById('sm_send')
);
serial.registerSerialMonitor(serialMonitor);
