class Tree{
	constructor(treeContainer){
		this.wrapper = treeContainer;
		this.elements = [];

		this.selectedElementsIds = [];
		this.selectionCanBeNested = true; //if selection contains a connector, it should not be dragged into a pin or connector
		this.activeId = undefined; //the last selected element;
		this.dragFrag = document.createDocumentFragment();
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

						let elementIds = this.elements.map((item) => item.id);
						let indexOfFirst = elementIds.indexOf(this.selectedElementsIds[0]);//index of first selected
						let thisIndex = elementIds.indexOf(ele.id)//index of current selected;

						if(indexOfFirst == thisIndex) this.toggleSelectedState(ele.id);
						else{
							let min = Math.min(indexOfFirst,thisIndex);
							let max = Math.max(indexOfFirst,thisIndex);
							for(let i = min; i <= max; i++){
								//highlight all slots inbetween first selected and current
								this.addToSelectedElements(this.elements[i].id);
							}
						}
					}

				}else{ //no alteration keys. reset the selections
					this.removeAllSelectedElements();
					this.addToSelectedElements(ele.id);
				}
			}

			if(e.buttons == 1){ // mouse down

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
		this.selectionCanBeNested = true;
		for(let i = 0; i < this.selectedElementsIds.length; i++){
			if(this.selectedElementsIds[i][0] == 'c') this.selectionCanBeNested = false;
		}
	}

	dragStart(e,ele){
		e.preventDefault();

		//if the targeted drag element is not selected, select it only
		if(!this.isSelected(ele.id)){
			this.removeAllSelectedElements();
			this.addToSelectedElements(ele.id);
		}

		this.checkSelectionComposition();

		//hide the default drag ghost
		e.dataTransfer.setDragImage(event.target, window.outerWidth, window.outerHeight);
		console.log(e,ele);
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

		window.onmouseup = function(evt){
			window.onmouseup = undefined;
			window.onmousemove = undefined;
			document.getElementById('dragableGhostWrapper').style.display = 'none';

			//put all dragfrag elements in their proper spot, with proper highrarchy
			let placeHolder = document.getElementById("dragPlaceholder");
			placeHolder.after(...tree.dragFrag.childNodes);
			placeHolder.style.display = 'none';
		}
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
		for(let i = 0; i < this.elements.length; i++){
			let slot = document.getElementById(this.elements[i].id);
			if(slot){
				let type = this.elements[i].id[0];
				let box = slot.getBoundingClientRect();

				//if it's a pin
				if(type == 'p' || !this.selectionCanBeNested){
					if(ytracker > box.top && ytracker < box.top+box.height*0.5){
						this.showPlaceHolder();
						this.setPlaceHolderPosition(slot,true);
					}
					else if(ytracker <= box.bottom && ytracker >= box.top+box.height*0.5){
						this.showPlaceHolder();
						this.setPlaceHolderPosition(slot,false);
					}
				}
				//if it's a connector, then detect middle region too for droppables
				else if(type == 'c'){
					//if it's in the top 20%
					if(ytracker > box.top && ytracker < box.top+box.height*0.2){
						this.showPlaceHolder();
						this.setPlaceHolderPosition(slot,true);
					}
					//it's in the bottom 20%
					else if(ytracker <= box.bottom && ytracker >= box.top+box.height*0.8){
						this.showPlaceHolder();
						this.setPlaceHolderPosition(slot,false);
					}
					//it's in the middle
					else if(ytracker > box.top+box.height*0.2 && ytracker < box.top+box.height*0.8){
						this.hidePlaceHolder();
						// console.log("middle",this.elements[i].id,Math.random());
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
	setPlaceHolderPosition(neighbour,above){
		let placeHolder = document.getElementById("dragPlaceholder");
		if(above){
			neighbour.before(placeHolder);
		}else{
			neighbour.after(placeHolder);
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
	ele.className.replace(' '+name,'');
	ele.className.replace(name,'');
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
		ele.style.border = "2px solid red";
	}
	deSelect(){
		this.selected = false;
		let ele = this.element();
		ele.style.border = "";
	}
}
Connector.addNew = function(){
	let newpin = new Connector("Unnamed");
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
		ele.className += ' selected';
	}
	deSelect(){
		this.selected = false;
		let ele = this.element();
		ele.style.border = "";
	}
}
Pin.addNew = function(){
	let newpin = new Pin("Unnamed");
	tree.elements.push(newpin);
}

let tree = new Tree(document.getElementById("treeContainer"));
