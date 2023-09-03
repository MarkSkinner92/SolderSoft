	class Tree{
	constructor(treeContainer,ghostWrapper){
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

		this.ghostWrapper = ghostWrapper;

		this.dragStart = this.dragStart.bind(this);
		this.mouseDragging = this.mouseDragging.bind(this);
		this.mouseRelease = this.mouseRelease.bind(this);
	}

	package(){
		let json = {};
		let packagedElements = [];
		for(let i = 0; i < this.elements.length; i++){
			packagedElements.push(this.elements[i].package());
		}
		json.packagedElements = packagedElements;
		return json;
	}
	wipe(){
		for(let i = 0; i < this.elements.length; i++){
			this.elements[i].remove();
		}
		this.elements = [];
		this.selectedElementsIds = [];
		this.selectionIsAllPins = true;
		this.activeId = undefined; //the last selected element;
		this.selectNestedOnly = false;
		this.dragState = {
			neighbor:undefined,
			neighborId:false,
			pos:0
		}
	}
	unpackage(json){
		this.wipe();
		let packagedElements = json.packagedElements;
		//unpackage all elements
		for(let i = 0; i < packagedElements.length; i++){
			this.elements.push(this.unpackageElement(packagedElements[i]));
		}
		//then link them together in a highrarchal way
		for(let i = this.elements.length-1; i >= 0; i--){
			let ele = this.elements[i];
			if(ele.type == 'pin'){
				if(packagedElements[i].parentConnectorId) ele.linkParent(this.fromId(packagedElements[i].parentConnectorId));
			}else if(ele.type == 'connector'){
				for(let k = 0; k < packagedElements[i].pinIds.length; k++){
					ele.linkPins(packagedElements[i].pinIds);
				}
			}
		}
	}
	unpackageElement(json){
		if(json.type == 'pin'){
			return new Pin(json);
		}else if(json.type == 'connector'){
			return new Connector(json);
		}
	}

	fromId(id){
		for(let i = 0; i < this.elements.length; i++) if(this.elements[i].id == id) return this.elements[i];
	}

	deleteSelection(){
		inspector.closeAllPanels();
		for(let i = this.elements.length-1; i >= 0; i--){
			for(let k = this.selectedElementsIds.length-1; k >= 0; k--){
				if(this.elements[i].id == this.selectedElementsIds[k]){
					let instance = this.fromId(this.elements[i].id);
					if(instance.isPin()){
						if(instance.hasParentConnector()){
							instance.detatch();
						}
						this.elements[i].remove();
						this.selectedElementsIds.splice(k,1);
						this.elements.splice(i,1);
						break;
					}
					else if(instance.isConnector()){
						//delete all chilren first
						for(let m = this.elements.length-1; m >= 0; m--){
							for(let n = instance.pins.length-1; n >= 0; n--){
								if(this.elements[m].id == instance.pins[n].id){
									instance.pins[n].detatch();
									this.elements[m].remove();
									instance.pins.splice(n,1);
									this.elements.splice(m,1);
									break;
								}
							}
						}

						this.elements[i].remove();
						this.selectedElementsIds.splice(k,1);
						this.elements.splice(i,1);
						break;

					}
				}
			}
		}
	}

	duplicateSelection(){
		//TODO
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
			if(this.checkSelectionCompliance(instance)){
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

			let noneOfSelectedAreChildren = true;
			let selectionIsAllPins = true;
			for(let i = 0; i < this.selectedElementsIds.length; i++){
				let id = this.selectedElementsIds[i];
				let instance = this.fromId(id);
				if(instance.isConnector()) selectionIsAllPins = false;
				if(instance.hasParentConnector()) noneOfSelectedAreChildren = false;
				if(id != this.activeId){
					backgroundClasses.push(instance);
				}
			}


			if(noneOfSelectedAreChildren || (!noneOfSelectedAreChildren && this.selectionHasSameParent()))
			inspector.openPanel('controlPanel',activeSlotClass,backgroundClasses);
			else
			inspector.openPanel('limitedControlPanel',activeSlotClass,backgroundClasses);

			inspector.openPanel('generalInfoPanel',activeSlotClass,backgroundClasses);
			inspector.openPanel('positionPanel',activeSlotClass,backgroundClasses);

			if(this.selectedElementsIds.length == 1 && this.fromId(this.selectedElementsIds[0]).isConnector())
				inspector.openPanel('rotationPanel',activeSlotClass,backgroundClasses);
			if(this.selectionHasSameParent() && this.selectedElementsIds.length == 1) inspector.openPanel('setOriginPanel',activeSlotClass,backgroundClasses);
			if(selectionIsAllPins){
				inspector.openPanel('solderProfilePanel',activeSlotClass,backgroundClasses);
			}
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

	createSelectedElementClones(){
		this.ghostWrapper.innerHTML = '';
		for(let i = 0; i < this.selectedElementsIds.length; i++){
			let cloneNode = document.getElementById(this.selectedElementsIds[i]).cloneNode(true);
			cloneNode.id += "-G";//diferentiate it as a ghost
			//remove all touchable events! Yikes!!
			cloneNode.onmouseup=undefined;
			cloneNode.onmousedown=undefined;
			cloneNode.ondragstart=undefined;

			this.ghostWrapper.appendChild(cloneNode);
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
				this.fromId(id).collapse();
			}
		}
	}

	orderElementsToScreenOrder(){
		let elementIds = [...this.wrapper.children]
			.filter((itm)=> itm.className.includes('element'))
			.map((item) => item.id);

		let tempArray = [];
		for(let i = 0; i < elementIds.length; i++){
			tempArray.push(this.fromId(elementIds[i]));
		}

		this.elements = [...tempArray];
	}


	//stopdrag
	mouseRelease(evt){
		window.onmouseup = undefined;
		window.onmousemove = undefined;
		this.ghostWrapper.style.display = 'none';

		//put all dragfrag elements in their proper spot, with proper highrarchy
		let placeHolder = document.getElementById("dragPlaceholder");
		placeHolder.after(...this.dragFrag.childNodes);

		//update selected elements to reflect behavior in new Position

		//if dropped into a parent connector...
		//become a child of that parent
		if(this.dragState.neighborId && this.dragState.pos == 0){
			let parent = this.fromId(this.dragState.neighborId);
			for(let i = 0; i < this.selectedElementsIds.length; i++){
				let instance = this.fromId(this.selectedElementsIds[i]);
				if(instance.setParent) instance.setParent(parent); //set new parent
			}
			parent.expand();
		}

		//if it was dropped next to a child pin...
		let proceed = (this.dragState.neighbor?.parentConnector != undefined);
		//or it was dropped directly under an open connector...
		proceed ||= (this.dragState.neighborId[0] == 'c' && this.dragState.pos == 1 && this.dragState.neighbor.expanded);
		//become a child pin too, with the same parent
		if(proceed){
			let parent = this.dragState.neighbor?.parentConnector || this.dragState.neighbor;
			for(let i = 0; i < this.selectedElementsIds.length; i++){
				let instance = this.fromId(this.selectedElementsIds[i]);
				if(instance.setParent) instance.setParent(parent); //set new parent
			}
		}

		//if it was dropped above a connector
		let canBeDetatched = (this.dragState.neighborId[0] == 'c' && this.dragState.pos == -1);
		//or below an closed connector...
		canBeDetatched ||= (this.dragState.neighborId[0] == 'c' && this.dragState.pos == 1 && !this.dragState.neighbor?.expanded);
		//or beside a detatched pin...
		canBeDetatched ||= (this.dragState.neighborId[0] == 'p' && this.dragState.neighbor?.parentConnector == undefined);
		//it can be detatched
		if(canBeDetatched){
			for(let i = 0; i < this.selectedElementsIds.length; i++){
				let instance = this.fromId(this.selectedElementsIds[i]);
				if(instance.detatch) instance.detatch();
			}
		}

		this.dragState.neighborId = false;
		this.dragState.neighbor = undefined;
		this.dragState.pos = 0; //-1 is above, 0 is on, 1 is below neighbor

		placeHolder.style.display = 'none';
		this.orderElementsToScreenOrder();
		this.onSelectionChange();
	}
	//startdrag
	dragStart(e,ele){
		console.log(this,this.ghostWrapper);
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
		this.offsetX = rect.left - e.clientX;
		this.offsetY = rect.top - e.clientY;

		//show div containing ghosts of all selected items
		this.createSelectedElementClones();
		this.setGhostWrapperPosition(e.clientX+this.offsetX,e.clientY+this.offsetY);
		this.ghostWrapper.style.display = 'unset';

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
				let pins = this.fromId(thisId).pins;
				for(let k = 0; k < pins.length; k++){
					let thisPin = pins[k];
					this.dragFrag.append(document.getElementById(thisPin.id));
				}
			}
		}
		window.onmousemove = this.mouseDragging;
		window.onmouseup = this.mouseRelease;
	}

	mouseDragging(evt){
		let ytracker = evt.clientY+this.offsetY;
		this.setGhostWrapperPosition(evt.clientX+this.offsetX,ytracker);

		//Scroll if too close to the edges
		if(evt.clientY > window.innerHeight*0.8){
			document.getElementById("treeContainer").scrollBy(0,5);
		}
		else if(evt.clientY < window.innerHeight*0.2+30){
			document.getElementById("treeContainer").scrollBy(0,-5);
		}

		for(let i = 0; i < this.elements.length; i++){
			let instance = this.fromId(this.elements[i].id);
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
							console.log("A");

							this.showPlaceHolder();
							this.setPlaceHolderPosition(slot,true);
							this.dragState.neighbor = instance;
							this.dragState.neighborId = this.elements[i].id;
							this.dragState.pos = -1;
						}
						//if mouse is over the bottom half of the pin slot
						if(!(instance.isConnector() && instance.expanded && instance.pins?.length > 0)){
							if(ytracker <= box.bottom && ytracker >= box.top+box.height*0.5 || (i==this.elements.length-1 && ytracker >= box.top+box.height*0.5)){
								console.log("B");
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
						console.log("C");

						this.showPlaceHolder();
						this.setPlaceHolderPosition(slot,true);
						this.dragState.neighbor = instance;
						this.dragState.neighborId = this.elements[i].id;
						this.dragState.pos = -1;
					}
					//it's in the middle
					if(ytracker > box.top+box.height*0.2 && ytracker < box.top+box.height*0.8){
						console.log("D");

						this.showPlaceHolder();
						this.setPlaceHolderPosition(slot,false);
						this.dragState.neighbor = instance;
						this.dragState.neighborId = this.elements[i].id;
						this.dragState.pos = 0;
					}
					// it's in the bottom 20%
					if(ytracker < box.bottom && ytracker > box.top+box.height*0.8 || (i==this.elements.length-1 && ytracker >= box.top+box.height*0.8)){
						console.log("E");

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

	setGhostWrapperPosition(l,t){
		this.ghostWrapper.style.left = l+"px";
		this.ghostWrapper.style.top = t+"px";
	}

	clickContainer(e){
		if(e.srcElement.className.includes("deselectAllOnClick")){
			this.removeAllSelectedElements();
		}
	}

	//this.setPlaceHolderPosition(document.getElementById(this.elements[4].id),true);
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
	constructor(cf) {
		this.type = 'connector';
		this.id = cf.id || "c-"+randomIDstring();

		//external
		this.name = cf.hasOwnProperty("name") ? cf.name : "Unnamed";
		this.enabled = cf.hasOwnProperty("enabled") ? cf.enabled : true;
		this.position = cf.hasOwnProperty("position") ? cf.position : {
			x:0,
			y:0
		}
		this.rotation = cf.hasOwnProperty("rotation") ? cf.rotation : 0;
		//internal
		let parent = document.getElementById("treeContainer");
		this.pins = [];
		this.expanded = cf.hasOwnProperty("expanded") ? cf.expanded : false;
		this.selected = false;

		//!! only used for unpackaging. USE THIS.PINS INSTEAD !!
		this.createHTML(parent);
	}

	package(){
		let json = {};
		json.id = this.id;
		json.type = this.type;
		json.name = this.name;
		json.enabled = this.enabled;
		json.position = this.position;
		json.rotation = this.rotation;
		json.pinIds = [];

		for(let i = 0; i < this.pins.length; i++){
			json.pinIds.push(this.pins[i].id);
		}

		json.expanded = this.expanded;
		return json;
	}
	remove(){
		this.element().remove();
	}
	//use on unpackaging. to be run after all pins have been created, so the tree has pins to reference
	linkPins(pinIds){
		pinIds.forEach((pinId) => {
			this.pins.push(tree.fromId(pinId));
		});
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


		if(this.expanded) this.expand();
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

	setRotation(newRotation){
		let currentRotation = this.rotation;
		let deltaRotation = newRotation - currentRotation;
		let pins = this.pins;
		let polarRot = [];
		let polarDist = [];

		//convert delta to radians
		let deltaRotationRad = deltaRotation * (Math.PI/180);

		//if necessary convert pins to local coords
		if(config.globalMode){
			for(let i = 0; i < pins.length; i++){
				pins[i].retractConnectorTransformation(this);
			}
		}

		//convert all pin positions to polar coordiantes
		for(let i = 0; i < pins.length; i++){
			let x = pins[i].position.x;
			let y = pins[i].position.y;

			polarDist.push(Math.sqrt(x*x+y*y));
			polarRot.push(Math.atan2(y,x));
		}

		//add delta rotation to each pin
		for(let i = 0; i < polarRot.length; i++){
			polarRot[i] += deltaRotationRad;
		}

		//convert pins back to local coords
		for(let i = 0; i < pins.length; i++){
			pins[i].position.x = polarDist[i] * Math.cos(polarRot[i]);
			pins[i].position.y = polarDist[i] * Math.sin(polarRot[i]);
		}

		//if necessary, convert them back to global coords
		if(config.globalMode){
			for(let i = 0; i < pins.length; i++){
				pins[i].applyConnectorTransformation(this);
			}
		}

		this.rotation = newRotation;
	}

	valueChangeGetter(key){
		if(key == "enabled") return this.enabled;
		else if(key == "name") return this.name;
		else if(key == "positionx") return this.position.x;
		else if(key == "positiony") return this.position.y;
		else if(key == "rotation") return this.rotation;
	}
	valueChangeSetter(key,oldValue,newValue,backgroundSources){
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
				backgroundSources[i].setPositionX(newValue);
			}
		}
		else if(key == 'positiony'){
			newValue = Number(newValue);
			oldValue = Number(oldValue);
			this.setPositionY(newValue);
			for(let i = 0; i < backgroundSources.length; i++){
				backgroundSources[i].setPositionY(newValue);
			}
		}else if(key == 'rotation'){
			newValue = Number(newValue);
			this.setRotation(newValue);
			//maybe do some sort of multi-select rotation?
		}
		preview.redraw();
	}
}
Connector.addNew = function(){
	let newconnector = new Connector({
		name:''
	});
	tree.elements.push(newconnector);
}




class Pin {
	constructor(cf) {
		this.type = 'pin';
		this.id = cf.id || "p-"+randomIDstring();

		//external
		this.name = cf.hasOwnProperty("name") ? cf.name : "Unnamed";
		this.enabled = cf.hasOwnProperty("enabled") ? cf.enabled : true;
		this.position = cf.hasOwnProperty("position") ? cf.position : {
			x:0,
			y:0
		}
		this.solderProfile = cf.hasOwnProperty("solderProfileId") ? solderProfileWindow.fromId(cf.solderProfileId) : solderProfileWindow.defaultProfile;
		this.solderProfileVariables = cf.hasOwnProperty("solderProfileVariables") ? cf.solderProfileVariables : {};

		//internal
		this.parentConnector = undefined;

		this.selected = false;

		let parent = document.getElementById("treeContainer");
		this.createHTML(parent);
	}

	package(){
		let json = {};
		json.id = this.id;
		json.type = this.type;
		json.name = this.name;
		json.enabled = this.enabled;
		json.position = this.position;
		json.solderProfileId = this.solderProfile.id;
		json.parentConnectorId = this.parentConnector ? this.parentConnector.id : false;
		json.solderProfileVariables = this.solderProfileVariables;
		return json;
	}
	//to be run after
	linkParent(parentId){
		this.parentConnector = tree.fromId(parentId);
		this.setIndent(true);
	}

	getGlobalPosition(){
		let gp = {
			x:this.position.x,
			y:this.position.y
		}

		if(this.hasParentConnector() && !config.globalMode){
			let parentPosition = this.parentConnector.position;
			gp.x+=parentPosition.x;
			gp.y+=parentPosition.y;
		}

		return gp;
	}

	remove(){
		this.element().remove();
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

		this.setEnabled(this.enabled)
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
			this.retractConnectorTransformation(this.parentConnector);
			inspector.reset();
		}
		connector.pins.push(this);
		if(connector.expanded){
			this.show();
		}
		else{
			this.hide();
		}
		this.setIndent(true);
	}
	detatch(){
		if(this.parentConnector != undefined){
			this.parentConnector.removeChild(this.id);
			if(!config.globalMode){ //local mode, add connector's location on when detatching
				this.applyConnectorTransformation(this.parentConnector);
				inspector.reset();
			}
			this.parentConnector = undefined;
			this.setIndent(false)
		}
	}
	setIndent(indent){
		this.element().style.marginLeft = indent ? "20px" : "0px";
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

	applyConnectorTransformation(connector){
		this.changePositionX(connector.position.x);
		this.changePositionY(connector.position.y);
	}
	retractConnectorTransformation(connector){
		this.changePositionX(-connector.position.x);
		this.changePositionY(-connector.position.y);
	}

	valueChangeGetter(key,activeSource,backgroundSources){
		if(key.substr(0,2) == 'v-'){
			//vkey is the "key"
			let vkey = key.substr(2,key.length-1);

			if(!(vkey in this.solderProfileVariables)){
				this.solderProfileVariables[vkey] = this.solderProfile.getVariableByGcodeName(vkey).defaultvalue;
			}

			//if all the selected elements are of the same solder profile
			let commonProfileId = activeSource.solderProfile.id;
			let allValuesAreSame = true;
			for(let i = 0; i < backgroundSources.length; i++){
				let id = backgroundSources[i].solderProfile.id;
				if(commonProfileId != id){
					commonProfileId = false;
					break;
				}
			}
			if(commonProfileId){
				//if all the backgroundsources share the same value
				let acval = this.solderProfileVariables[vkey];
				for(let i = 0; i < backgroundSources.length; i++){
					let thisBackgroundSource = backgroundSources[i];
					let val = thisBackgroundSource.solderProfileVariables[vkey] || thisBackgroundSource.solderProfile.getVariableByGcodeName(vkey).defaultvalue;
					if(acval != val){
						allValuesAreSame = false;
						break;
					}
				}
				if(allValuesAreSame){
					return acval;
				}else{
					return "---"
				}
			}

			return this.solderProfileVariables[vkey];
		}else if(key == 'desiredSolderProfileId'){
			//if all backgroundsources have same solder profile
			let commonProfileId = activeSource.solderProfile.id;
			for(let i = 0; i < backgroundSources.length; i++){
				let id = backgroundSources[i].solderProfile.id;
				if(commonProfileId != id){
					commonProfileId = false;
					break;
				}
			}
			if(commonProfileId){
				return this.solderProfile.id;
			}
			else return "--blank--";
		}
		else if(key == "enabled") return this.enabled;
		else if(key == "name") return this.name;
		else if(key == "positionx") return this.position.x;
		else if(key == "positiony") return this.position.y;
	}
	valueChangeSetter(key,oldValue,newValue,backgroundSources){
		if(key.substr(0,2) == 'v-'){
			let vkey = key.substr(2,key.length-1);
			if(newValue != '---'){
				this.solderProfileVariables[vkey] = newValue;
				for(let i = 0; i < backgroundSources.length; i++){
					backgroundSources[i].solderProfileVariables[vkey] = newValue;
				}
			}
		}
		else if(key == 'desiredSolderProfileId'){
			if(newValue != "--blank--"){
				let selectedSolderProfile = solderProfileWindow.fromId(newValue);
				this.solderProfile = selectedSolderProfile
				for(let i = 0; i < backgroundSources.length; i++){
					backgroundSources[i].solderProfile = selectedSolderProfile;
				}
				inspector.reset();
			}
		}
		else if(key == 'name'){
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
				backgroundSources[i].setPositionX(newValue);
			}
		}
		else if(key == 'positiony'){
			newValue = Number(newValue);
			oldValue = Number(oldValue);
			this.setPositionY(newValue);
			for(let i = 0; i < backgroundSources.length; i++){
				backgroundSources[i].setPositionY(newValue);
			}
		}
	}
}
Pin.addNew = function(){
	let newpin = new Pin({
		name:''
	});
	tree.elements.push(newpin);
}

let tree = new Tree(document.getElementById("treeContainer"),document.getElementById("dragableGhostWrapper"));
