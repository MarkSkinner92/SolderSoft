HTMLElement.prototype.addOutline = function(){
	this.style.filter = "brightness(80%)";
}
HTMLElement.prototype.removeOutline = function(){
  this.style.filter = "none";
}

class SolderProfile {
	constructor(id) {
		this.id = id;
	}
}

class SolderProfileWindow {
	constructor() {
		this.profileSlotContainer = document.getElementsByClassName("sp_profileContainer")[0];
		this.windowElement = document.getElementById('solderProfileWindow');

		this.profiles = []; //array of SolderProfile
		this.activeProfile = new SolderProfile("sp_default");
		this.profiles.push(this.activeProfile);
		this.loadSelectedProfile(this.activeProfile.id);
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
	loadSelectedProfile(profileId){
		this.activeProfile = this.fromId(profileId);
		//deselect all, and select the one with profileId
		let elements = this.getAllProfileSlots();
		for(let i = 0; i < elements.length; i++){
			console.log(elements[i]);
			elements[i].removeOutline();
		}
		this.getProfileSlotById(profileId).addOutline();
	}

	//prifle menu
	newProfile(){}
	setAsDefaultProfile(){}
	deleteActiveProfile(){
		console.log("delete");
	}

	//profile container methods
	profileClick(evt){
		let slot = evt.srcElement.closest('.profileSlot');
		this.loadSelectedProfile(slot.id);
	}
	getAllProfileSlots(){
		return this.profileSlotContainer.getElementsByClassName('profileSlot');
	}
	getProfileSlotById(id){
		let elements = this.getAllProfileSlots();
		for(let i = 0; i < elements.length; i++) if(elements[i].id == id) return elements[i];
	}

	//variable menu
	deleteVariable(){}
	addVariable(){}

	//varaible container methods
	variableClick(){}
	variableChange(){}

	//G-code container
	eraseGcode(){}
	resetHighlight(){}

	//bottom menu
	closeEditorAndSave(){
		this.windowElement.style.display = 'none';
	}
}

let solderProfileWindow = new SolderProfileWindow();
