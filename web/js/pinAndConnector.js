class Tree{
	constructor(treeContainer){
		this.wrapper = treeContainer;
		this.elements = [];

		this.selectedElementsIds = [];
		this.selectionIsAllPins = true;
		this.activeId = undefined; //the last selected element;
		this.dragFrag = document.createDocumentFragment();

		this.dragState = {
			neighbor:undefined,
			neighborId:false,
			pos:0
		}
	}

	fromId(id){
		for(let i = 0; i < this.elements.length; i++) if(this.elements[i].id == id) return this.elements[i];
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
	}

	isSelected(treeElementId){
		return this.selectedElementsIds.includes(treeElementId);
	}

	addToSelectedElements(treeElementId){
		if(!this.isSelected(treeElementId)){
			this.selectedElementsIds.push(treeElementId);
			this.fromId(treeElementId).select();
			this.activeId = treeElementId;
		}
	}

	deselectElementById(treeElementId){
		this.fromId(treeElementId).deSelect();
	}

	removeAllSelectedElements(){
		for(let i = this.selectedElementsIds.length-1; i >= 0; i--){
			this.deselectElementById(this.selectedElementsIds[i]);
			this.selectedElementsIds.splice(i,1);
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

		//move all real selected elements into a document fragment
		for(let i = 0; i < this.selectedElementsIds.length;i++){
			this.dragFrag.append(document.getElementById(this.selectedElementsIds[i]));
		}

		window.onmousemove = function(evt){
			tree.mouseDragging(evt,ghostWrapper,offsetX,offsetY);
		}

		window.onmouseup = this.mouseRelease;
	}
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
				tree.fromId(tree.selectedElementsIds[i]).setParent(parent);
			}
			parent.expand();
		}

		//if it was dropped next to a child pin...
		//become a child pin too, with the same parent
		console.log(tree,tree.dragState,tree.dragState.neighbor);
		let parent = tree.dragState.neighbor.parentConnector;
		if(parent != undefined){
			for(let i = 0; i < tree.selectedElementsIds.length; i++){
				tree.fromId(tree.selectedElementsIds[i]).detatch(); //remove any previous associations
				tree.fromId(tree.selectedElementsIds[i]).setParent(parent); //set new parent
			}
		}

		placeHolder.style.display = 'none';
		tree.orderElementsToScreenOrder();
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

		//get bounding boxes and determine placeholder Position
		this.dragState.neighborId = false;
		this.dragState.neighbor = undefined;
		this.dragState.pos = 0; //-1 is above, 0 is on, 1 is below neighbor

		for(let i = 0; i < this.elements.length; i++){
			let instance = tree.fromId(this.elements[i].id);
			let slot = instance.element();
			if(slot){
				let type = this.elements[i].id[0];
				let box = slot.getBoundingClientRect();

				//if the slot in quesiton is either a pin
				//or it's a connector, and the selecion contains connector(s)
				if(type == 'p' || !this.selectionIsAllPins){
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
						if(!(type=='c' && instance.expanded && instance.pins?.length > 0)){
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

				//if it's a connector
				else if(type == 'c'){
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
			neighbor.after(placeHolder);
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
		this.name = name;
		this.id = "c-"+randomIDstring();
		let parent = document.getElementById("treeContainer");
		this.createHTML(parent);
		this.pins = [];
		this.expanded = false;
		this.selected = false;
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
	set newname(name){
		this.name = name;
		this.element().querySelector("#connectorName").innerText = this.name;
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
}
Connector.addNew = function(){
	let newpin = new Connector();
	newpin.newname = newpin.id;
	tree.elements.push(newpin);
}




class Pin {
	constructor(name) {
		this.id = "p-"+randomIDstring();
		this.name = name;
		let parent = document.getElementById("treeContainer");
		this.createHTML(parent);
		this.parentConnector = undefined;
		this.selected = false;
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
	set newname(name){
		this.name = name;
		this.element().querySelector("#pinName").innerText = this.name;
	}
	show(){
		this.element().style.display = "block";
	}
	hide(){
		this.element().style.display = "none";
	}
	setParent(connector){
		this.parentConnector = connector;
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
		if(this.parentConnector){
			this.parentConnector = undefined;
			this.element().style.marginLeft = "0px";
			this.show();
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
}
Pin.addNew = function(){
	let newpin = new Pin();
	newpin.newname = newpin.id;
	tree.elements.push(newpin);
}

let tree = new Tree(document.getElementById("treeContainer"));
