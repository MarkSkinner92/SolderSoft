class Config {
	constructor(element) {
		this.absoluteMode = true; //absolute or realitive
		this.globalMode = true; //global or local
		this.menu = element;
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
					for(let p = 0; p < thisElement.pins.length; p++){
						let pin = thisElement.pins[p];
						// this element is a connector, add the position and rotation of connector to pin
						pin.applyConnectorTransformation(thisElement);
					}
				}
			}
		}else{
			//remove connector position from each child
			for(let i = 0; i < tree.elements.length; i++){
				let thisElement = tree.elements[i];
				if(thisElement.isConnector()){
					for(let p = 0; p < thisElement.pins.length; p++){
						let pin = thisElement.pins[p];
						pin.retractConnectorTransformation(thisElement);
					}
				}
			}
		}
		inspector.reset(); // pull all numbers in correct system
	}

	openConfigMenu(){
		this.menu.style.display = 'block';
	}
	closeConfigMenuAndSave(){
		this.menu.style.display = 'none';
	}
}

document.getElementById('connect').onclick = function (){
	eel.connect(9600);
}

let config = new Config(document.getElementById('configMenu'));
