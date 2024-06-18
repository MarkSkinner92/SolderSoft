class Config {
	constructor(element) {
		this.globalMode = true; //global or local
		this.menu = element;
		this.selectedKey = false;
		this.gcodeBox = new GcodeBox(document.getElementById('cf_gcodeBox'),()=>{
			//onchange
			this.gcodes[this.selectedKey].code = this.gcodeBox.getCode();
		});
		this.gcodes = {
			'startJob':'G0 Z40\nG0 X0 Y0',
			'endJob':'G0 X0 Y0',
			'ironOn':'',
			'ironOff':'',
			'tipChange':'G0 Z20\nM400\nG0 X0 Y0\nM400',
			'enableMotors':'M17 (enable steppers)',
			'disableMotors':'M18 (disable steppers)',
			'disableServo':'M282 P0 (detatch servo)',
			'homeX':'G28 X',
			'homeY':'G28 Y',
			'homeZ':'G28 Z',
			'clean':'G0 Z20\nM400\nG0 X0 Y0\nM400',
		}
		this.gcodes = {
			'startJob': {
				code: 'G0 Z40\nG0 X0 Y0',
				description: 'Runs once before execution is started'
			},
			'endJob': {
				code: 'G0 X0 Y0',
				description: 'Runs after the execution is completed'
			},
			'ironOn': {
				code: '',
				description: ''
			},
			'ironOff': {
				code: '',
				description: ''
			},
			'tipChange': {
				code: 'G0 Z20\nM400\nG0 X0 Y0\nM400',
				description: 'Runs every time the tip change procedure is called'
			},
			'enableMotors': {
				code: 'M17 (enable steppers)',
				description: ''
			},
			'disableMotors': {
				code: 'M18 (disable steppers)',
				description: ''
			},
			'enableServo': {
				code: 'M280 P0 (read servo)\nM280 P1 (read servo)',
				description: ''
			},
			'disableServo': {
				code: 'M282 P0 (detach servo)\nM282 P1 (detach servo)',
				description: ''
			},
			'homeX': {
				code: 'G28 X',
				description: 'Homes the X axis'
			},
			'homeY': {
				code: 'G28 Y',
				description: 'Homes the Y axis'
			},
			'homeZ': {
				code: 'G28 Z',
				description: 'Homes the Z axis'
			},
			'clean': {
				code: 'G0 Z20\nM400\nG0 X0 Y0\nM400',
				description: 'Runs when the tip cleaning procedure is called'
			},
			'sandbox': {
				code: '',
				description: 'Code here is just for testing'
			}

		}
		this.homeToOrigin = {
			x:0,
			y:0,
			z:0
		}

		// After sending the homing Gcode commands, this vector will store the head's coordinates
		// Typically it would be 0,0,0 but it could be different depending on how the firmware is configured
		this.homeLocation = {
			x:0,
			y:0,
			z:0
		}

		// The location target (In board space) where the head is moved during calibration.
		this.referencePosition = {
			x:0,
			y:0,
			z:0
		}
	}

	getGcodeForJob(jobName){
		return this.gcodes[jobName].code;
	}
	setGcode(name,code){
		this.gcodes[name].code = code;
	}

	setCoordinateMode(newMode){
		let previouslyGlobalMode = this.globalMode;
		this.globalMode = (newMode == 'global');
		document.getElementById('coordMode').selectedIndex = this.globalMode ? 0 : 1;
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

		let gcode = this.gcodes[this.selectedKey];

		this.gcodeBox.setCode(gcode.code);
		document.getElementById('cf_infotext').innerText = gcode.description;
	}

	package(){
		return {
			configGcodes:this.packageGcodes(),
			homeToOrigin:this.homeToOrigin,
			homeLocation:this.homeLocation,
			referencePosition:this.referencePosition
		}
	}
	packageGcodes(){
		let keys = Object.keys(this.gcodes);
		let returnObject = {};
		keys.forEach(key => {
			returnObject[key] = this.gcodes[key].code;
		})
		return returnObject;
	}
	unpackage(json){
		this.unpackageGcodes(json.configGcodes);
		this.homeToOrigin = json?.homeToOrigin || this.homeToOrigin;
		this.homeLocation = json?.homeLocation || this.homeLocation;
		this.referencePosition = json?.referencePosition || this.referencePosition;
	}

	unpackageGcodes(gcodes){
		let keys = Object.keys(gcodes);
		keys.forEach(key => {
			this.setGcode(key,gcodes[key]);
		})
	}

	async executeNow(){
		if(!serial.connected) return;
		let code = this.gcodeBox.getCode();
		if(execution.gbuffer.length == 0){
			execution.addStringCodeToGbuffer(code);
			await execution.executeGbuffer((progress,cap)=>{
				document.getElementById('cf_status').innerText = `Running... (${progress}/${cap})`;
			});
			document.getElementById('cf_status').innerText = 'Done';
		}
	}
}

let config = new Config(document.getElementById('configMenu'));
