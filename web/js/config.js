class Config {
	constructor(element) {
		this.menu = element;
		this.selectedKey = false;
		this.gcodeBox = new GcodeBox(document.getElementById('cf_gcodeBox'),()=>{
			//onchange
			this.gcodes[this.selectedKey] = this.gcodeBox.getCode();
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
		this.homeToOrigin = {
			x:5.17,
			y:10.88,
			z:-6.5
		}
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

	updateHomeToOriginVector(axis,evt){
		this.homeToOrigin[axis] = evt.target.value;
		console.log("setting",axis,evt)
	}

	package(){
		return {
			configGcodes:this.gcodes,
			homeToOrigin:this.homeToOrigin
		}
	}
	unpackage(json){
		this.gcodes = json.configGcodes;
		this.homeToOrigin = json?.homeToOrigin || this.homeToOrigin;
		document.getElementById("htoX").value = this.homeToOrigin.x;
		document.getElementById("htoY").value = this.homeToOrigin.y;
		document.getElementById("htoZ").value = this.homeToOrigin.z;
	}
}

let config = new Config(document.getElementById('configMenu'));
