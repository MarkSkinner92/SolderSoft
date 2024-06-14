class Board {
	constructor() {
		this.element = document.getElementById('boardElement');
		this.position = {
			x:10,
			y:10
		}
		this.size = {
			x:70,
			y:50,
			z:4
		}
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
	}
	deSelect(){
		Tree.removeClassFromElement(this.element,'selected');
		inspector.closePanel('boardSetupPanel');
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
	}
	valueChangeGetter(key){
		if(key == 'positionx') return this.position.x;
		else if(key == 'positiony') return this.position.y;
		else if(key == 'sizex') return this.size.x;
		else if(key == 'sizey') return this.size.y;
		else if(key == 'sizez') return this.size.z;
	}
}

let board = new Board();