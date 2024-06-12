class Inspector {
	constructor() {
		this.openPanels = [];
	}

	openPanel(id,activeSource,backgroundSources){
		let element = document.getElementById(id);
		if(id == "solderProfilePanel"){
			this.updateSolderProfilePanel(activeSource, backgroundSources);
		}
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
			let oldValue = activeSource.valueChangeGetter(key,activeSource,backgroundSources);

			thisInput.setValue(oldValue);

			thisInput.onchange = function(evt){
				let newValue = evt.target.getValue();
				activeSource.valueChangeSetter(key,oldValue,newValue,backgroundSources);
			};
		}
	}

	updateSolderProfilePanel(activeSource, backgroundSources){
		//update the selector
		let selector = document.getElementById("solderProfileSelect");

		selector.removeOptions();
		let options = solderProfileWindow.getListOfProfileNamesAndIds();
		if(backgroundSources.length > 0){
			selector.addOption("------","--blank--");
			console.log('multiple');
		}
		for(let i = 0; i < options.length; i++){
			selector.addOption(options[i][0],options[i][1]);
		}
		selector.selectedIndex = 0;

		//update the key value pairs
		this.removeAllKeyValues();

		let commonProfileId = activeSource.solderProfile.id;
		for(let i = 0; i < backgroundSources.length; i++){
			let id = backgroundSources[i].solderProfile.id;
			if(commonProfileId != id){
				commonProfileId = false;
				break;
			}
		}
		if(commonProfileId){
			if(!activeSource.solderProfile.variables) return;
			for(let i = 0; i < activeSource.solderProfile.variables.length; i++){
				let variable = activeSource.solderProfile.variables[i];
				this.addKeyValuePairToSolderProfile(variable);
			}
		}
	}
	addKeyValuePairToSolderProfile(variable){
		let table = document.getElementById("spkeyvalues");
		document.getElementById("hline").style.display = 'block';
		table.innerHTML +=
		`<tr id="sp-${variable.id}">
			<td>${variable.uiname}</td>
			<td>
				<input key='v-${variable.gcodename}' value='${variable.defaultvalue}'>
			</td>
		</tr>`;
	}
	removeAllKeyValues(){
		document.getElementById("hline").style.display = 'none';
		let table = document.getElementById("spkeyvalues");
		table.innerHTML = '';
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
