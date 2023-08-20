class Board {
	constructor() {
		this.element = document.getElementById('boardElement');
		this.position = {
			x:0,
			y:0
		}
		this.size = {
			x:0,
			y:0,
			z:0
		}
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
			this.position.x = newValue;
		}
		else if(key == 'positiony'){
			this.position.y = newValue;
		}
		else if(key == 'sizex'){
			this.size.x = newValue;
		}
		else if(key == 'sizey'){
			this.size.y = newValue;
		}
		else if(key == 'sizez'){
			this.size.z = newValue;
		}
	}
	valueChangeGetter(key){
		console.log('ok',key);
		if(key == 'positionx') return this.position.x;
		else if(key == 'positiony') return this.position.y;
		else if(key == 'sizex') return this.size.x;
		else if(key == 'sizey') return this.size.y;
		else if(key == 'sizez') return this.size.z;
	}
}

let board = new Board();
