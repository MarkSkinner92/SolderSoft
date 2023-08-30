HTMLElement.prototype.addOutline = function(){
	this.style.boxShadow = "0px 0px 0px 2px black";
}
HTMLElement.prototype.removeOutline = function(){
  this.style.boxShadow = "none";
}

class SolderProfile {
	constructor(id) {
		this.id = id;
		this.name = 'unnamed';
		this.variables = []; //{id:,uiname:,gcodename:,defaultvalue:}
		this.gcode = "";
	}
	getVariableByGcodeName(key){
		for(let i = 0; i < this.variables.length; i++){
			if(this.variables[i].gcodename == key){
				return this.variables[i];
			}
		}
	}
	setVariableValue(id,key,value){
		for(let i = 0; i < this.variables.length; i++){
			if(this.variables[i].id == id){
				this.variables[i][key] = value;
			}
		}
	}
	setName(name){
		this.name = name;
	}
}

class SolderProfileWindow {
	constructor() {
		this.profileSlotContainer = document.getElementsByClassName("sp_profileContainer")[0];
		this.varialbeSlotContainer = document.getElementsByClassName("sp_variableContainer")[0];
		this.windowElement = document.getElementById('solderProfileWindow');
		this.gcodeBox = new GcodeBox( document.getElementById('sp_gcodeBox'),()=>{
			this.registerGcodeChange();
		});

		this.profiles = []; //array of SolderProfile
		this.activeProfile = new SolderProfile("sp_default");
		this.activeProfile.setName("Default");
		this.defaultProfile = this.activeProfile;
		this.profiles.push(this.activeProfile);
		this.loadProfile(this.activeProfile.id);
	}

	//general control
	fromId(id){
		for(let i = 0; i < this.profiles.length; i++){
			if(this.profiles[i].id == id) return this.profiles[i];
		}
	}
	openEditor(){
		this.windowElement.style.display = 'block';
	}
	loadProfile(profileId){
		this.activeProfile = this.fromId(profileId);

		//deselect all, and select the one with profileId
		let elements = this.getAllProfileSlots();
		for(let i = 0; i < elements.length; i++){
			console.log(elements[i]);
			elements[i].removeOutline();
		}
		this.getProfileSlotById(profileId).addOutline();

		//load in the variables
		//delete all vars, loop and create each tile
		this.removeAllVariableSlots();
		this.loadVariables(this.activeProfile);

		//load in the Gcode
		this.gcodeBox.setCode(this.activeProfile.gcode);
	}
	getListOfProfileNamesAndIds(){
		let slots = this.getAllProfileSlots();
		let names = [];
		for(let i = 0; i < slots.length; i++){
			names.push([slots[i].querySelector('.sps_name').value,slots[i].id]);
		}
		return names;
	}
	profileNameChangeTrigger(e){
		let profileSlot = e.srcElement.closest('.profileSlot');
		let solderProfile = this.fromId(profileSlot.id);
		solderProfile.setName(e.srcElement.value);
	}
	updateListOfProfiles(){
		let html = "<option value='0'>New Profile...</option>";
		let namesAndIds = this.getListOfProfileNamesAndIds();
		for(let i = 0; i < namesAndIds.length; i++){
			html += "<option value='"+namesAndIds[i][1]+"'>From: "+namesAndIds[i][0]+"</option>";
		}
		document.getElementById("sp_newProfile").innerHTML = html;
	}
	//prifle menu
	newProfile(){
		let idOfTemplateProfile = document.getElementById("sp_newProfile").value;
		document.getElementById("sp_newProfile").innerHTML = "<option value='0'>New Profile...</option>";
		document.getElementById("sp_newProfile").value = 0;

		// let templateInstance = this.fromId(idOfTemplateProfile);
		let templateSlot = this.getProfileSlotById(idOfTemplateProfile);
		let clone = templateSlot.cloneNode(true);
		this.profileSlotContainer.appendChild(clone);
		templateSlot.after(clone);
		clone.id = 'sp_'+randomIDstring();

		let newInstance = new SolderProfile(clone.id);
		this.profiles.push(newInstance);
		this.loadProfile(newInstance.id);
	}

	setAsDefaultProfile(){
		this.defaultProfile = this.activeProfile;
	}

	deleteActiveProfile(){
		if(this.profiles.length > 1){
			let idToDelete = this.activeProfile.id;
			this.spliceFromProfiles(this.activeProfile.id);
			if(idToDelete == this.defaultProfile.id){
				this.defaultProfile = this.profiles[0];
			}
			this.loadProfile(this.profiles[0].id);

			//update all pins to us the default if they were using the active profile
			tree.elements.forEach((element, i) => {
				if(element.isPin()){
					element.solderProfile = this.defaultProfile;
				}
			});

		}
	}
	spliceFromProfiles(id){
		for(let i = this.profiles.length-1; i >= 0; i--){
			if(this.profiles[i].id == id){
				this.profiles.splice(i,1);
				this.getProfileSlotById(id).remove();
			}
		}
	}
	//profile container methods
	profileClick(evt){
		let slot = evt.srcElement.closest('.profileSlot');
		this.loadProfile(slot.id);
	}
	getAllProfileSlots(){
		return this.profileSlotContainer.getElementsByClassName('profileSlot');
	}
	getProfileSlotById(id){
		let elements = this.getAllProfileSlots();
		for(let i = 0; i < elements.length; i++) if(elements[i].id == id) return elements[i];
	}

	//variable menu
	deleteSelectedVariable(){
		if(!this.selectedVariableId) return;
		let variableElement = document.getElementById(this.selectedVariableId);
		console.log(variableElement);
		let id = variableElement.id;
		let vars = this.activeProfile.variables;
		for(let i = vars.length-1; i >= 0; i--){
			if(vars[i].id == id) vars.splice(i,1);
		}
		this.selectedVariableId = false;
		variableElement.remove();
	}
	selectVariable(element){
		this.deselectAllVariables();
		element.addOutline();
		this.selectedVariableId = element.id;
	}
	deselectAllVariables(){
		this.selectedVariableId = false;
		let elements = document.querySelectorAll(".sp_variable");
		for(let i = 0; i < elements.length; i++) elements[i].removeOutline();
	}
	addVariable(data){
		let variableRack = document.getElementById('sp_variableTemplate').cloneNode(true);
		variableRack.style.display = 'block';
		this.varialbeSlotContainer.append(variableRack);
		let rackId = 'v-'+randomIDstring();
		variableRack.id = data?.id ? data?.id : rackId;


		if(data){
			//populate variableRack with data from data TODO
			variableRack.querySelector("[key=uiname]").value = data.uiname;
			variableRack.querySelector("[key=gcodename]").value = data.gcodename;
			variableRack.querySelector("[key=defaultvalue]").value = data.defaultvalue;
		}else{
			this.activeProfile.variables.push({
				id:rackId,
				uiname: '',
				gcodename: '',
				defaultvalue: ''
			});
		}
	}

	//varaible container methods
	removeAllVariableSlots(){
		this.selectedVariableId = false;
		let allVariables = this.varialbeSlotContainer.querySelectorAll('.sp_variable');
		for(let i = allVariables.length-1; i >= 0; i--){
			allVariables[i].remove();
		}
	}
	loadVariables(solderProfile){
		console.log(solderProfile);
		console.log(solderProfile.variables.length);
		for(let i = 0; i < solderProfile.variables.length; i++){
			this.addVariable(solderProfile.variables[i]);
		}
	}

	variableClick(e){
		let variableElement = e.srcElement.closest(".sp_variable");
		this.selectVariable(variableElement);
		e.stopPropagation();
	}
	variableChange(evt,type){
		console.log(evt);
		let id = evt.srcElement.closest(".sp_variable").id;
		let key = evt.srcElement.getAttribute('key');
		let value = evt.srcElement.value;
		this.activeProfile.setVariableValue(id,key,value);
	}

	//G-code container
	registerGcodeChange(){
		this.gcodeBox.resetSentaxHighlighting();
		this.activeProfile.gcode = this.gcodeBox.getCode();
	}

	//bottom menu
	closeEditorAndSave(){
		inspector.reset();
		this.windowElement.style.display = 'none';
	}
}

let solderProfileWindow = new SolderProfileWindow();
