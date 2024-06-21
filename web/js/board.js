class Board {
	constructor() {
		this.element = document.getElementById('boardElement');
		this.position = {
			x:0,
			y:0
		}
		this.size = {
			x:70,
			y:50,
			z:0
		}
		this.selected = false;
	}
	package(){
		return {
			position:this.position,
			size:this.size
		}
	}
	unpackage(json){
		this.position = json.position;
		this.size = json.size;
	}
	select(){
		Tree.addClassToElement(this.element,'selected');
		inspector.openPanel('boardSetupPanel',this);
		inspector.openPanel('referencePanel',this);
		this.selected = true;
	}
	deSelect(){
		Tree.removeClassFromElement(this.element,'selected');
		inspector.closePanel('boardSetupPanel');
		inspector.closePanel('referencePanel');
		this.selected = false;
	}


	valueChangeSetter(key,oldValue,newValue,backgroundSources){
		if(key == 'positionx'){
			this.position.x = Number(newValue);
		}
		else if(key == 'positiony'){
			this.position.y = Number(newValue);
		}
		else if(key == 'sizex'){
			this.size.x = Number(newValue);
		}
		else if(key == 'sizey'){
			this.size.y = Number(newValue);
		}
		else if(key == 'sizez'){
			this.size.z = Number(newValue);
		}
		else if(key == 'refx'){
			config.referencePosition.x = Number(newValue);
		}
		else if(key == 'refy'){
			config.referencePosition.y = Number(newValue);
		}
		else if(key == 'refz'){
			config.referencePosition.z = Number(newValue);
		}
	}
	valueChangeGetter(key){
		if(key == 'positionx') return this.position.x;
		else if(key == 'positiony') return this.position.y;
		else if(key == 'sizex') return this.size.x;
		else if(key == 'sizey') return this.size.y;
		else if(key == 'sizez') return this.size.z;
		else if(key == 'refx') return config.referencePosition.x;
		else if(key == 'refy') return config.referencePosition.y;
		else if(key == 'refz') return config.referencePosition.z;
	}
}

let board = new Board();