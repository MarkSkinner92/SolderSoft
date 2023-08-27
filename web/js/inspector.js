class Inspector {
	constructor() {
		this.openPanels = [];
	}

	openPanel(id,activeSource,backgroundSources){
		let element = document.getElementById(id);
		this.loadPanel(element,activeSource,backgroundSources);
		element.style.display='block';

		this.openPanels[id] = {
			activeSource:activeSource,
			backgroundSources:backgroundSources
		}
	}

	closePanel(id){
		delete this.openPanels[id];
		document.getElementById(id).style.display='none';
	}

	closeAllPanels(){
		let panels = document.getElementById("middlePanel").querySelectorAll('.inspectorPanel');
		for(let i = 0; i < panels.length; i++){
			this.closePanel(panels[i].id);
		}
	}

	//close all panels and re-open all
	reset(){
		let panels = Object.keys(this.openPanels);
		for(let i = 0; i < panels.length; i++){
			let panel = this.openPanels[panels[i]];
			this.openPanel(panels[i],panel.activeSource,panel.backgroundSources);
		}
	}

	//background sources are all other selected classes except the active one
	loadPanel(element,activeSource,backgroundSources){
		let allInputs = element.querySelectorAll("[key]");
		for(let i = 0; i < allInputs.length; i++){
			let thisInput = allInputs[i];
			let key = thisInput.getAttribute('key');
			let oldValue = activeSource.valueChangeGetter(key)

			thisInput.setValue(oldValue);

			thisInput.onchange = function(evt){
				let newValue = evt.target.getValue();
				activeSource.valueChangeSetter(key,oldValue,newValue,backgroundSources);
			};
		}
	}
}

let inspector = new Inspector();
HTMLElement.prototype.getValue = function(){
  if(this.tagName == 'INPUT'){
		if(this.type == "checkbox"){
			return this.checked;
		}else{
			return this.value;
		}
	}else{
		return this.value;
	}
}
HTMLElement.prototype.setValue = function(value){
  if(this.tagName == 'INPUT'){
		if(this.type == "checkbox"){
			this.checked = value;
		}else{
			this.value = value;
		}
	}else{
		this.value = value;
	}
}
