class Config {
	constructor() {
		this.absoluteMode = true; //absolute or realitive
		this.globalMode = true; //global or local
	}
	setPositioningMode(newMode){
		this.absoluteMode = (newMode == 'absolute');
	}
	setCoordinateMode(newMode){
		let previouslyGlobalMode = this.globalMode;
		this.globalMode = (newMode == 'global');
		if(previouslyGlobalMode == this.globalMode) return; //they are the same, nothing changed

		if(this.globalMode){
			//add connector position to each child
			for(let i = 0; i < tree.elements.length; i++){
				let thisElement = tree.elements[i];
				if(thisElement.isConnector()){
					let connectorPosition = thisElement.position;
					for(let p = 0; p < thisElement.pins.length; p++){
						let pin = thisElement.pins[p];
						pin.changePositionX(connectorPosition.x);
						pin.changePositionY(connectorPosition.y);
					}
				}
			}
		}else{
			//remove connector position from each child
			for(let i = 0; i < tree.elements.length; i++){
				let thisElement = tree.elements[i];
				if(thisElement.isConnector()){
					let connectorPosition = thisElement.position;
					for(let p = 0; p < thisElement.pins.length; p++){
						let pin = thisElement.pins[p];
						pin.changePositionX(-connectorPosition.x);
						pin.changePositionY(-connectorPosition.y);
					}
				}
			}
		}
		inspector.reset(); // pull all numbers in correct system
	}
}

let config = new Config();
