//manages everyhing to do with the serial ports
//and the UI related to serial

class Serial {
	constructor() {
		this.connected = false;
		this.attemptingToConnect = false;
		this.attemptingToDisconnect = false;
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
		console.log(line);
		if(line == "start"){
			this.connected = true;
			this.attemptingToConnect = false;
			this.setActionButtonText();
			this.setStatus("Connected","good");
		}
	}

	sendGcode(code){
		eel.sendGcode(code+'\n');
	}
}

let serial = new Serial();
