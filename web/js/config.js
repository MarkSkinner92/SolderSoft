class Config {
	constructor() {
		this.absoluteMode = true; //absolute or realitive
		this.globalMode = true; //global or local
	}
	setPositioningMode(newMode){
		this.absoluteMode = (newMode == 'absolute');
	}
	setCoordinateMode(newMode){
		this.globalMode = (newMode == 'global');
	}
}

let config = new Config();
