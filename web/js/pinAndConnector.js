class Tree{
	constructor(treeContainer){
		this.wrapper = treeContainer;
		this.elements = [];

		this.selectedElementsIds = [];
		this.selectionIsAllPins = true;
		this.activeId = undefined; //the last selected element;
		this.dragFrag = document.createDocumentFragment();
		this.selectNestedOnly = false;
		this.dragState = {
			neighbor:undefined,
			neighborId:false,
			pos:0
		}
	}

	fromId(id){
		for(let i = 0; i < this.elements.length; i++) if(this.elements[i].id == id) return this.elements[i];
	}

	setActiveAsConnectorOrigin(){
		let activeInstance = this.fromId(this.activeId);
		if(activeInstance.hasParentConnector()){
			let x = activeInstance.position.x;
			let y = activeInstance.position.y;
			activeInstance.parentConnector.setOrigin(x,y);
		}
	}

	selectionHasSameParent(){
		if(this.selectedElementsIds.length == 0) return false;
		let previousParentId = false;
		for(let i = 0; i < this.selectedElementsIds.length; i++){
			let instance = this.fromId(this.selectedElementsIds[i]);
			if(instance.hasParentConnector()){
				let thisParentId = instance.parentConnector.id;
				if(!previousParentId) previousParentId = thisParentId;
				if(thisParentId != previousParentId) return false;
			}else{
				return false;
			}
		}
		return true;
	}

	identifyByChild(nestedEle){
		if(!nestedEle) return;
		let element = nestedEle.closest(".element");
		if(!element) return;
		return this.fromId(element.id);
	}

	toggleSelectedState(treeElementId){
		let index = this.selectedElementsIds.indexOf(treeElementId);
		if(index == -1){ // not found
			this.addToSelectedElements(treeElementId);
		}else{
			this.selectedElementsIds.splice(index,1);
			this.deselectElementById(treeElementId);
		}
		this.onSelectionChange();
	}

	isSelected(treeElementId){
		return this.selectedElementsIds.includes(treeElementId);
	}

	checkSelectionCompliance(instance){
		let hasParent = instance.hasParentConnector();
		let listLength = this.selectedElementsIds.length;

		//if nothing is added, go ahead! there is no precident
		if(listLength == 0){
			this.selectNestedOnly = hasParent; //if there is at least one in the list with a parent, we will force all
			return true;
		}

		//otherwise, make sure the element type matches the precident
		else{
			if(hasParent == this.selectNestedOnly) return true;
			else return false;
		}
	}

	addToSelectedElements(treeElementId){
		board.deSelect();
		if(!this.isSelected(treeElementId)){
			let instance = this.fromId(treeElementId);
			if(tree.checkSelectionCompliance(instance)){
				instance.select();
				this.selectedElementsIds.push(treeElementId);
				this.activeId = treeElementId;
			}
		}
		this.onSelectionChange();
	}

	deselectElementById(treeElementId){
		this.fromId(treeElementId).deSelect();
	}

	removeAllSelectedElements(){
		board.deSelect();
		for(let i = this.selectedElementsIds.length-1; i >= 0; i--){
			this.deselectElementById(this.selectedElementsIds[i]);
			this.selectedElementsIds.splice(i,1);
		}
		this.selectNestedOnly = false;
		this.onSelectionChange();
	}

	onSelectionChange(){
		inspector.closeAllPanels();
		if(this.selectedElementsIds.length != 0){
			let activeSlotClass = this.fromId(this.activeId);
			let backgroundClasses = [];
			for(let i = 0; i < this.selectedElementsIds.length; i++){
				let id = this.selectedElementsIds[i];
				if(id != this.activeId){
					backgroundClasses.push(this.fromId(id));
				}
			}

			inspector.openPanel('generalInfoPanel',activeSlotClass,backgroundClasses);
			inspector.openPanel('positionPanel',activeSlotClass,backgroundClasses);
			if(tree.selectionHasSameParent()) inspector.openPanel('setOriginPanel',activeSlotClass,backgroundClasses);
		}
	}

	clickElement(e,ele){
		if(e.srcElement.className != "arrow"){
			if(e.buttons == 0){ // mouse down
				if(e.ctrlKey){ // just toggle the one being clicked
					this.toggleSelectedState(ele.id);

				}else if(e.shiftKey){ //fancy column selector
					if(this.selectedElementsIds.length == 0){//if nothing is selected yet...
						this.addToSelectedElements(ele.id);
					}else{ //select all elements between first selected item
						//first, clear all the selected
						let firstID = this.selectedElementsIds[0];
						this.removeAllSelectedElements();
						this.addToSelectedElements(firstID);

						//get all the elements in screen order, filtering out non-elements
						let elementIds = this.elements.map((item) => item.id);

						let indexOfFirst = elementIds.indexOf(this.selectedElementsIds[0]);//index of first selected
						let thisIndex = elementIds.indexOf(ele.id)//index of current selected;

						if(indexOfFirst == thisIndex) this.toggleSelectedState(ele.id);
						else{
							let min = Math.min(indexOfFirst,thisIndex);
							let max = Math.max(indexOfFirst,thisIndex);
							for(let i = min; i <= max; i++){
								//highlight all slots inbetween first selected and current
								this.addToSelectedElements(elementIds[i]);
							}
						}
					}

				}else{ //no alteration keys. reset the selections
					this.removeAllSelectedElements();
					this.addToSelectedElements(ele.id);
				}
			}
		}
	}

	createSelectedElementClones(ghostWrapper){
		ghostWrapper.innerHTML = '';
		for(let i = 0; i < this.selectedElementsIds.length; i++){
			let cloneNode = document.getElementById(this.selectedElementsIds[i]).cloneNode(true);
			cloneNode.id += "-G";//diferentiate it as a ghost
			//remove all touchable events! Yikes!!
			cloneNode.onmouseup=undefined;
			cloneNode.onmousedown=undefined;
			cloneNode.ondragstart=undefined;

			ghostWrapper.appendChild(cloneNode);
		}
	}

	checkSelectionComposition(){
		this.selectionIsAllPins = true;
		for(let i = 0; i < this.selectedElementsIds.length; i++){
			if(this.selectedElementsIds[i][0] == 'c') this.selectionIsAllPins = false;
		}
	}
	collapseSelectedConnectors(){
		for(let i = 0; i < this.selectedElementsIds.length; i++){
			let id = this.selectedElementsIds[i];
			if(id[0] == 'c'){
				tree.fromId(id).collapse();
			}
		}
	}

	orderElementsToScreenOrder(){
		let elementIds = [...this.wrapper.children]
			.filter((itm)=> itm.className.includes('element'))
			.map((item) => item.id);

		let tempArray = [];
		for(let i = 0; i < elementIds.length; i++){
			tempArray.push(tree.fromId(elementIds[i]));
		}

		this.elements = [...tempArray];
	}

	//startdrag
	dragStart(e,ele){
		e.preventDefault();

		//if the targeted drag element is not selected, select it only
		if(!this.isSelected(ele.id)){
			this.removeAllSelectedElements();
			this.addToSelectedElements(ele.id);
		}

		this.checkSelectionComposition();
		this.collapseSelectedConnectors();

		//hide the default drag ghost
		e.dataTransfer.setDragImage(event.target, window.outerWidth, window.outerHeight);
		let rect = ele.getBoundingClientRect();
		let offsetX = rect.left - e.clientX;
		let offsetY = rect.top - e.clientY;

		//show div containing ghosts of all selected items
		let ghostWrapper = document.getElementById('dragableGhostWrapper');
		this.createSelectedElementClones(ghostWrapper);
		tree.setGhostWrapperPosition(ghostWrapper,e.clientX+offsetX,e.clientY+offsetY);
		ghostWrapper.style.display = 'unset';

		//get bounding boxes and determine placeholder Position
		this.dragState.neighborId = false;
		this.dragState.neighbor = undefined;
		this.dragState.pos = 0; //-1 is above, 0 is on, 1 is below neighbor

		//move all real selected elements into a document fragment
		//if it's a container, move all of it's children under it too
		for(let i = 0; i < this.selectedElementsIds.length;i++){
			let thisId = this.selectedElementsIds[i];
			this.dragFrag.append(document.getElementById(thisId));

			if(thisId[0] == 'c'){
				let pins = tree.fromId(thisId).pins;
				for(let k = 0; k < pins.length; k++){
					let thisPin = pins[k];
					this.dragFrag.append(document.getElementById(thisPin.id));
				}
			}
		}

		window.onmousemove = function(evt){
			tree.mouseDragging(evt,ghostWrapper,offsetX,offsetY);
		}

		window.onmouseup = this.mouseRelease;
	}

	//stopdrag
	mouseRelease(evt){
		window.onmouseup = undefined;
		window.onmousemove = undefined;
		document.getElementById('dragableGhostWrapper').style.display = 'none';

		//put all dragfrag elements in their proper spot, with proper highrarchy
		let placeHolder = document.getElementById("dragPlaceholder");
		placeHolder.after(...tree.dragFrag.childNodes);

		//update selected elements to reflect behavior in new Position

		//if dropped into a parent connector...
		//become a child of that parent
		if(tree.dragState.neighborId && tree.dragState.pos == 0){
			let parent = tree.fromId(tree.dragState.neighborId);
			for(let i = 0; i < tree.selectedElementsIds.length; i++){
				let instance = tree.fromId(tree.selectedElementsIds[i]);
				if(instance.setParent) instance.setParent(parent); //set new parent
			}
			parent.expand();
		}

		//if it was dropped next to a child pin...
		let proceed = (tree.dragState.neighbor?.parentConnector != undefined);
		//or it was dropped directly under an open connector...
		proceed ||= (tree.dragState.neighborId[0] == 'c' && tree.dragState.pos == 1 && tree.dragState.neighbor.expanded);
		//become a child pin too, with the same parent
		if(proceed){
			let parent = tree.dragState.neighbor?.parentConnector || tree.dragState.neighbor;
			for(let i = 0; i < tree.selectedElementsIds.length; i++){
				let instance = tree.fromId(tree.selectedElementsIds[i]);
				if(instance.setParent) instance.setParent(parent); //set new parent
			}
		}

		//if it was dropped above a connector
		let canBeDetatched = (tree.dragState.neighborId[0] == 'c' && tree.dragState.pos == -1);
		//or below an closed connector...
		canBeDetatched ||= (tree.dragState.neighborId[0] == 'c' && tree.dragState.pos == 1 && !tree.dragState.neighbor?.expanded);
		//or beside a detatched pin...
		canBeDetatched ||= (tree.dragState.neighborId[0] == 'p' && tree.dragState.neighbor?.parentConnector == undefined);
		//it can be detatched
		if(canBeDetatched){
			for(let i = 0; i < tree.selectedElementsIds.length; i++){
				let instance = tree.fromId(tree.selectedElementsIds[i]);
				if(instance.detatch) instance.detatch();
			}
		}

		tree.dragState.neighborId = false;
		tree.dragState.neighbor = undefined;
		tree.dragState.pos = 0; //-1 is above, 0 is on, 1 is below neighbor

		placeHolder.style.display = 'none';
		tree.orderElementsToScreenOrder();
		tree.onSelectionChange();
	}
	mouseDragging(evt,ghostWrapper,offsetX,offsetY){
		let ytracker = evt.clientY+offsetY;
		this.setGhostWrapperPosition(ghostWrapper,evt.clientX+offsetX,ytracker);

		//Scroll if too close to the edges
		if(evt.clientY > window.innerHeight*0.8){
			document.getElementById("treeContainer").scrollBy(0,5);
		}
		else if(evt.clientY < window.innerHeight*0.2+30){
			document.getElementById("treeContainer").scrollBy(0,-5);
		}

		for(let i = 0; i < this.elements.length; i++){
			let instance = tree.fromId(this.elements[i].id);
			let slot = instance.element();
			if(slot){
				// let type = this.elements[i].id[0];
				let box = slot.getBoundingClientRect();

				//if the slot in quesiton is either a pin
				//or it's a connector, and the selecion contains connector(s)
				if(instance.isPin() || !this.selectionIsAllPins){
					//prevent draging a connector into child pins
					if(!(!this.selectionIsAllPins && instance.parentConnector != undefined)){
						//if mouse is over the top half of the pin slot
						if(ytracker > box.top && ytracker < box.top+box.height*0.5 || (i==0 && ytracker < box.top+box.height*0.5)){
							this.showPlaceHolder();
							this.setPlaceHolderPosition(slot,true);
							this.dragState.neighbor = instance;
							this.dragState.neighborId = this.elements[i].id;
							this.dragState.pos = -1;
						}
						//if mouse is over the bottom half of the pin slot
						if(!(instance.isConnector() && instance.expanded && instance.pins?.length > 0)){
							if(ytracker <= box.bottom && ytracker >= box.top+box.height*0.5 || (i==this.elements.length-1 && ytracker >= box.top+box.height*0.5)){
								this.showPlaceHolder();
								this.setPlaceHolderPosition(slot,false);
								this.dragState.neighbor = instance;
								this.dragState.neighborId = this.elements[i].id;
								this.dragState.pos = 1;
							}
						}
					}
				}

				else if(instance.isConnector()){
					//if it's in the top 20%
					if(ytracker > box.top && ytracker < box.top+box.height*0.2 || (i==0 && ytracker < box.top+box.height*0.2)){
						this.showPlaceHolder();
						this.setPlaceHolderPosition(slot,true);
						this.dragState.neighbor = instance;
						this.dragState.neighborId = this.elements[i].id;
						this.dragState.pos = -1;
					}
					//it's in the middle
					if(ytracker > box.top+box.height*0.2 && ytracker < box.top+box.height*0.8){
						this.hidePlaceHolder();
						this.setPlaceHolderPosition(slot,false);
						this.dragState.neighbor = instance;
						this.dragState.neighborId = this.elements[i].id;
						this.dragState.pos = 0;
					}
					// it's in the bottom 20%
					if(ytracker <= box.bottom && ytracker >= box.top+box.height*0.8 || (i==this.elements.length-1 && ytracker >= box.top+box.height*0.8)){
						this.showPlaceHolder();
						this.setPlaceHolderPosition(slot,false);
						this.dragState.neighbor = instance;
						this.dragState.neighborId = this.elements[i].id;
						this.dragState.pos = 1;
					}
				}

			}
		}
	}

	setGhostWrapperPosition(ghostWrapper,l,t){
		ghostWrapper.style.left = l+"px";
		ghostWrapper.style.top = t+"px";
	}

	clickContainer(e){
		if(e.srcElement.className.includes("deselectAllOnClick")){
			this.removeAllSelectedElements();
		}
	}

	//tree.setPlaceHolderPosition(document.getElementById(tree.elements[4].id),true);
	setPlaceHolderPosition(neighbor,above){
		let placeHolder = document.getElementById("dragPlaceholder");
		if(above){
			neighbor.before(placeHolder);
		}else{
			//in the case of a closed connector, paceholder might need to be the lowest of the children
			let instance = this.fromId(neighbor.id);
			if(instance.isConnector()){
				if(!instance.expanded){
					if(instance.pins.length == 0){
						neighbor.after(placeHolder);
					}else{
						let lowestchild, maxindex = -1;
						let wrapperChildren = [...this.wrapper.children];
						for(let i = 0; i < instance.pins.length; i++){
							let childslot = document.getElementById(instance.pins[i].id);
							let thisindex = wrapperChildren.indexOf(childslot);

							if(thisindex > maxindex){
								maxindex = thisindex;
								lowestchild = childslot;
							}
						}
						lowestchild.after(placeHolder);
					}
				}
			}
			if(instance.isPin()){
				neighbor.after(placeHolder);
			}
		}
	}

	 hidePlaceHolder(){
		 document.getElementById("dragPlaceholder").style.display = "none";
	 }
	 showPlaceHolder(){
		 document.getElementById("dragPlaceholder").style.display = "block";
	 }
}
Tree.addClassToElement = function(ele,name){
	if(ele.className.includes(name)) return;
	else{
		ele.className += " "+name;
	}
}
Tree.removeClassFromElement = function(ele,name){
	ele.className = ele.className.replace(' '+name,'').replace(name,'');
}



class Connector {
	constructor(name) {
		this.id = "c-"+randomIDstring();

		//external
		this.name = name;
		this.enabled = true;
		this.position = {
			x:0,
			y:0
		}
		//internal
		let parent = document.getElementById("treeContainer");
		this.createHTML(parent);
		this.pins = [];
		this.expanded = false;
		this.selected = false;
		preview.redraw();
	}

	isPin(){
		return false;
	}
	isConnector(){
		return true;
	}
	hasParentConnector(){
		return false;
	}

	element(){
		return document.getElementById(this.id);
	}
	createHTML(parent){
		let prefab = document.getElementById("prefabConnector");
		let clone = prefab.cloneNode(true);
		clone.id = this.id;
		clone.querySelector("#connectorName").innerText = this.name;
		parent.appendChild(clone);
	}
	expand(){
		this.element().querySelector(".arrow").style.transform = 'rotate(0deg)';
		this.expanded = true;
		for(let i = 0; i < this.pins.length; i++){
			this.pins[i].show();
		}
	}
	collapse(){
		this.element().querySelector(".arrow").style.transform = 'rotate(-90deg)';
		this.expanded = false;
		for(let i = 0; i < this.pins.length; i++){
			this.pins[i].hide();
		}
	}
	toggleExpansionState(){
		if(this.expanded){
			this.collapse();
		}else{
			this.expand();
		}
	}
	select(){
		this.selected = true;
		let ele = this.element();
		Tree.addClassToElement(ele,'selected');

	}
	deSelect(){
		this.selected = false;
		let ele = this.element();
		Tree.removeClassFromElement(ele,'selected');
	}
	removeChild(id){
		for(let i = this.pins.length-1; i >= 0; i--){
			if(this.pins[i].id == id){
				this.pins.splice(i,1);
			}
		}
		if(this.pins.length == 0){
			if(this.expanded) this.collapse();
		}
	}

	setName(name){
		this.name = name;
		this.element().querySelector("#connectorName").innerText = this.name;
	}
	setEnabled(value){
		this.enabled = value;
		this.element().style.opacity = this.enabled ? "100%":"40%";

		for(let i = 0; i < this.pins.length; i++){
			this.pins[i].setEnabled(this.enabled);
		}
	}
	setPositionX(x){
		let oldposition = this.position.x;
		this.position.x = x;
		let delta = this.position.x - oldposition;

		if(config.globalMode){
			for(let i = 0; i < this.pins.length; i++){
				let pin = this.pins[i];
				pin.changePositionX(delta);
			}
		}
	}
	setPositionY(y){
		let oldposition = this.position.y;
		this.position.y = y;
		let delta = this.position.y - oldposition;

		if(config.globalMode){
			for(let i = 0; i < this.pins.length; i++){
				let pin = this.pins[i];
				pin.changePositionY(delta);
			}
		}
	}

	setOrigin(x,y){
		this.position.x = x;
		this.position.y = y;
	}

	valueChangeGetter(key){
		if(key == "enabled") return this.enabled;
		else if(key == "name") return this.name;
		else if(key == "positionx") return this.position.x;
		else if(key == "positiony") return this.position.y;
	}
	valueChangeSetter(key,oldValue,newValue,backgroundSources){
		console.log(key,oldValue,newValue,backgroundSources);
		if(key == 'name'){
			this.setName(newValue);
			for(let i = 0; i < backgroundSources.length; i++){
				backgroundSources[i].setName(newValue);
			}
		}
		else if(key == 'enabled'){
			this.setEnabled(newValue);
			for(let i = 0; i < backgroundSources.length; i++){
				backgroundSources[i].setEnabled(newValue);
			}
		}
		else if(key == 'positionx'){
			newValue = Number(newValue);
			oldValue = Number(oldValue);
			this.setPositionX(newValue);
			for(let i = 0; i < backgroundSources.length; i++){
				if(config.absoluteMode){
					backgroundSources[i].setPositionX(newValue);
				}else{
					let delta = newValue-oldValue;
					backgroundSources[i].setPositionX(backgroundSources[i].position.x+delta);
				}
			}
		}
		else if(key == 'positiony'){
			newValue = Number(newValue);
			oldValue = Number(oldValue);
			this.setPositionY(newValue);
			for(let i = 0; i < backgroundSources.length; i++){
				if(config.absoluteMode){
					backgroundSources[i].setPositionY(newValue);
				}else{
					let delta = newValue-oldValue;
					backgroundSources[i].setPositionY(backgroundSources[i].position.y+delta);
				}
			}
		}
		preview.redraw();
	}
}
Connector.addNew = function(){
	let newpin = new Connector();
	newpin.setName(newpin.id);
	tree.elements.push(newpin);
}




class Pin {
	constructor(name) {
		this.id = "p-"+randomIDstring();

		//external
		this.name = name;
		this.enabled = true;
		this.position = {
			x:0,
			y:0
		}

		//internal
		let parent = document.getElementById("treeContainer");
		this.createHTML(parent);
		this.parentConnector = undefined;
		this.selected = false;
	}
	isPin(){
		return true;
	}
	isConnector(){
		return false;
	}
	hasParentConnector(){
		return this.parentConnector != undefined;
	}
	element(){
		return document.getElementById(this.id);
	}
	createHTML(parent){
		let prefab = document.getElementById("prefabPin");
		let clone = prefab.cloneNode(true);
		clone.id = this.id;
		clone.querySelector("#pinName").innerText = this.name;
		parent.appendChild(clone);
	}
	show(){
		this.element().style.display = "block";
	}
	hide(){
		this.element().style.display = "none";
	}
	setParent(connector){
		this.detatch();
		this.parentConnector = connector;
		if(!config.globalMode){
			this.changePositionX(-this.parentConnector.position.x);
			this.changePositionY(-this.parentConnector.position.y);
			inspector.reset();
		}
		connector.pins.push(this);
		if(connector.expanded){
			this.show();
		}
		else{
			this.hide();
		}
		this.element().style.marginLeft = "20px";
	}
	detatch(){
		console.log("detatch");
		if(this.parentConnector != undefined){
			console.log("detatch2");
			this.parentConnector.removeChild(this.id);
			if(!config.globalMode){ //local mode, add connector's location on when detatching
				this.changePositionX(this.parentConnector.position.x);
				this.changePositionY(this.parentConnector.position.y);
				inspector.reset();
			}
			this.parentConnector = undefined;
			this.element().style.marginLeft = "0px";
		}
	}
	select(){
		this.selected = true;
		let ele = this.element();
		Tree.addClassToElement(ele,'selected');
	}
	deSelect(){
		this.selected = false;
		let ele = this.element();
		Tree.removeClassFromElement(ele,'selected');
	}
	setName(name){
		this.name = name;
		this.element().querySelector("#pinName").innerText = this.name;
	}
	setEnabled(value){
		this.enabled = value;
		this.element().style.opacity = this.enabled ? "100%":"40%";
	}
	setPositionX(x){
		this.position.x = x;
	}
	changePositionX(delta){
		this.setPositionX(this.position.x+delta);
	}
	setPositionY(y){
		this.position.y = y;
	}
	changePositionY(delta){
		this.setPositionY(this.position.y+delta);
	}
	valueChangeGetter(key){
		if(key == "enabled") return this.enabled;
		else if(key == "name") return this.name;
		else if(key == "positionx") return this.position.x;
		else if(key == "positiony") return this.position.y;
	}
	valueChangeSetter(key,oldValue,newValue,backgroundSources){
		console.log(key,oldValue,newValue,backgroundSources);
		if(key == 'name'){
			this.setName(newValue);
			for(let i = 0; i < backgroundSources.length; i++){
				backgroundSources[i].setName(newValue);
			}
		}
		else if(key == 'enabled'){
			this.setEnabled(newValue);
			for(let i = 0; i < backgroundSources.length; i++){
				backgroundSources[i].setEnabled(newValue);
			}
		}
		else if(key == 'positionx'){
			newValue = Number(newValue);
			oldValue = Number(oldValue);
			this.setPositionX(newValue);
			for(let i = 0; i < backgroundSources.length; i++){
				if(config.absoluteMode){
					backgroundSources[i].setPositionX(newValue);
				}else{
					let delta = newValue-oldValue;
					backgroundSources[i].setPositionX(backgroundSources[i].position.x+delta);
				}
			}
		}
		else if(key == 'positiony'){
			newValue = Number(newValue);
			oldValue = Number(oldValue);
			this.setPositionY(newValue);
			for(let i = 0; i < backgroundSources.length; i++){
				if(config.absoluteMode){
					backgroundSources[i].setPositionY(newValue);
				}else{
					let delta = newValue-oldValue;
					backgroundSources[i].setPositionY(backgroundSources[i].position.y+delta);
				}
			}
		}
	}
}
Pin.addNew = function(){
	let newpin = new Pin();
	newpin.setName(newpin.id);
	tree.elements.push(newpin);
}

let tree = new Tree(document.getElementById("treeContainer"));
