class Config {
	constructor(element) {
		this.globalMode = true; //global or local
		this.menu = element;
		this.selectedKey = false;
		this.gcodeBox = new GcodeBox(document.getElementById('cf_gcodeBox'),()=>{
			//onchange
			this.gcodes[this.selectedKey] = this.gcodeBox.getCode();
		});
		this.gcodes = {
			'startJob':'G0 Z20\nM400\nG0 X0 Y0\nM400',
			'endJob':'G0 X0 Y0',
			'ironOn':'',
			'ironOff':'',
			'home':'',
			'clean':'',
		}
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
		this.selectTile(this.menu.querySelectorAll('.cf_topic')[0]);
		this.menu.style.display = 'block';
	}
	closeConfigMenuAndSave(){
		this.menu.style.display = 'none';
	}

	clickTile(e){
		let ele = e.srcElement.closest('.cf_topic');
		this.selectTile(ele);
	}

	selectTile(tile){
		this.selectedKey = false;
		let eles = this.menu.querySelectorAll('.cf_topic');
		for(let i = 0; i < eles.length; i++){
			eles[i].removeOutline();
		}

		tile.addOutline();
		this.selectedKey = tile.id.substr(3,tile.id.length);
		console.log(tile.id.substr(2,tile.id.length));
		this.gcodeBox.setCode(this.gcodes[this.selectedKey]);
	}

	package(){
		return {
			config:this.gcodes
		}
	}
	unpackage(json){
		this.gcodes = json.config;
	}
}

let config = new Config(document.getElementById('configMenu'));
