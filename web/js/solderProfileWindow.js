class SolderProfile {
	constructor(cf) {
		this.id = cf.id;
		this.name = cf.name || 'Unnamed';

		// I'm not sure we want to have the headAngle default. No variables is ok too.
		// this.variables = cf.variables || [{id:"headAngleVar",uiname:"Head Angle",gcodename:"headAngle",defaultvalue:180}]; //{id:,uiname:,gcodename:,defaultvalue:}
		this.variables = cf.variables; //{id:,uiname:,gcodename:,defaultvalue:}
		
		this.gcode = cf.gcode || "G0 X{pinX} Y{pinY} Z{pinZ+20}; move to the pin's center position\n\n(put something here to move the Z up)\n(to avoid collisions as it moves to the next pin)";
		this.solderingTipId = cf.solderingTipId || 'st_default';
		this.color = cf.color || '#84009c';
		this.tipCleanInterval = cf.tipCleanInterval || 10;
	}
	setColor(value) {
		if(document.getElementById(this.id)) document.getElementById(this.id).querySelector('.sps_color').value = value;
		this.color = value;
	}
	getColor(){
		if(document.getElementById(this.id)) return document.getElementById(this.id).querySelector('.sps_color').value;
	}
	addColorChangeTrigger(element){
		element.addEventListener('change',(e)=>{
			this.color = e.target.value;
		})
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
	package(){
		let json = {};
		json.id = this.id;
		json.name = this.name;
		json.variables = this.variables;
		json.gcode = this.gcode;
		json.solderingTipId = this.solderingTipId;
		json.color = this.color;
		json.tipCleanInterval = this.tipCleanInterval;
		return json;
	}
	unpackage(pkg){
		this.id = pkg.id;
		this.name = pkg.name;
		this.variables = pkg.variables;
		this.gcode = pkg.gcode;
		this.solderingTipId = pkg.solderingTipId;
		this.color = json.color;
		this.tipCleanInterval = json.tipCleanInterval;
	}
	getValueOfGParam(expression,vars){
		let keys = Object.keys(vars);

		let realExpression = expression;
		keys.forEach((key) => {
			realExpression = realExpression.replaceAll(key,vars[key]);
		});

		try{
			let result = eval(realExpression);
			if(isNaN(result)){
				return {
					success:false,
					value:"Error: expression "+expression+" evaluates to non-number"
				};
			}
			return {
				success:true,
				value:result
			};
		}catch(e){
			return {
				success:false,
				value:"Error in expression "+expression+": "+e.message.split('\n')[0]
			};
		}
	}

	compileGcode(pin){
		let varObject = pin.solderProfileVariables;

		let globalPosition = pin.getGlobalPosition();

		varObject.pinX = config.homeToOrigin.x + board.position.x + globalPosition.x;
		varObject.pinY = config.homeToOrigin.y + board.position.y + globalPosition.y;
		varObject.pinZ = config.homeToOrigin.z + board.size.z;

		let code = this.gcode+'';
		let subsitutions = code.match(/\{.+?\}/g);
		let errMsg = false;
		for(let i = 0; i < subsitutions.length; i++){
			let variable = subsitutions[i];
			let exp = variable.substr(1,variable.length-2);
			let result = this.getValueOfGParam(exp,varObject);
			if(result.success){
				code = code.replaceAll(variable,result.value.toFixed(3));
			}
			else{
				errMsg = result.value;
				break;
			}
		}
		return {
			code:code,
			flag:errMsg
		}
	}

	getSolderTipName(){
		return document.getElementById(this.solderingTipId).querySelector('.t_name').value;
	}
	//return a pretend object for testing gcode for sentax errors
	getVariableObject(){
		let obj = {};
		obj.pinX = 0;
		obj.pinY = 0;
		obj.pinZ = 0;
		if(this.variables) this.variables.forEach((variable) => {
			obj[variable.gcodename] = variable.defaultvalue;
		});
		return obj;
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
		this.activeProfile = new SolderProfile({
			id:"sp_default",
			name:"Default",
			color:"#84009c"
		});
		this.createUIforProfile(this.activeProfile);
		this.defaultProfile = this.activeProfile;
		this.profiles.push(this.activeProfile);
		this.loadProfile(this.activeProfile.id);

		this.selectedTipId = 'st_default';
		this.tips = [this.createTipElement({
			cloneParentId:'st_prefab',
			id: this.selectedTipId,
			name: 'Default'
		})];

		this.changeTipCleanInterval.bind(this);
	}

	//reduce class into necesary information to rebuild it
	package(){
		let json = {};
		json.profiles = this.packageProfiles();
		json.activeProfileId = this.activeProfile.id;
		json.defaultProfileId = this.defaultProfile.id;
		json.selectedTipId = this.selectedTipId;
		json.selectedVariableId = this.selectedVariableId;
		json.tips = this.packageTips();
		return json;
	}

	wipe(){
		for(let i = this.profiles.length-1; i >= 0; i--){
			this.spliceFromProfiles(this.profiles[i].id);
		}
		this.removeAllVariableSlots();
		this.gcodeBox.wipe();
		this.wipeTips();
	}
	unpackage(json){
		this.wipe();
		this.unpackageProfiles(json.profiles);
		this.activeProfile = this.fromId(json.activeProfileId);
		this.defaultProfile = this.fromId(json.defaultProfileId);
		this.selectedTipId = json.selectedTipId;
		this.selectedVariableId = json.selectedVariableId;
		this.unpackageTips(json.tips);
	}

	//tip menu and settings
	saveAndCloseTipMenu(){
		//reset the options
		document.getElementById('solderTipWizard').style.display = 'none';
		this.updateTipSelector();
		this.updateSolderingTipId();
	}
	updateTipSelector(){
		let newOptions = '';
		for(let i = 0; i < this.tips.length; i++){
			newOptions += ("<option value='"+this.tips[i].id+"'>"+this.tips[i].querySelector('.t_name').value+"</option>");
		}
		newOptions += ("<option value='editlist'>Edit List...</option>");
		document.getElementById('solderingTipSelector').innerHTML = newOptions;
		document.getElementById('solderingTipSelector').value = this.selectedTipId;
	}
	openTipMenu(){
		this.selectTip(this.tips[0]);
		document.getElementById('solderTipWizard').style.display = 'block';
	}
	tipClick(e){
		let tipslot = e.srcElement.closest('.st_tipslot');
		this.selectTip(tipslot);
	}
	selectTip(tipslot){
		this.selectedTipId = tipslot.id;
		let tipslots = document.getElementById('solderTipWizard').querySelectorAll('.st_tipslot');
		for(let i = 0; i < tipslots.length; i++){
			tipslots[i].removeOutline();
		}
		tipslot.addOutline();
	}
	addTip(){
		let newTip = this.createTipElement({
			cloneParentId: this.selectedTipId,
			id: 't_'+randomIDstring(),
			name: 'Unnamed'
		});

		this.tips.push(newTip);
		this.selectTip(newTip);
	}
	createTipElement(cf){
		let element = document.getElementById(cf.cloneParentId || 'st_prefab').cloneNode(true);
		element.id = cf.id || 'st_default';
		element.querySelector('.t_name').value = cf.name || 'Default';
		element.style.display = '';
		document.getElementById('solderTipBody').appendChild(element);
		console.log(element);
		return element;
	}
	removeSelectedTip(){
		if(this.tips.length > 1){
			document.getElementById(this.selectedTipId).remove();
			for(let i = this.tips.length-1; i >= 0; i--){
				if(this.tips[i].id == this.selectedTipId) this.tips.splice(i,1);
			}
			this.selectTip(this.tips[this.tips.length-1]);
		}
	}
	wipeTips(){
		for(let i = this.tips.length-1; i >= 0; i--){
			this.tips[i].remove();
			this.tips.splice(i,1);
		}
		this.updateTipSelector();
	}
	solderingTipChange(){
		let val = document.getElementById('solderingTipSelector').value;
		if(val == "editlist"){
			this.openTipMenu();
		}
		else{
			this.updateSolderingTipId();
		}
	}
	updateSolderingTipId(){
		this.activeProfile.solderingTipId = document.getElementById('solderingTipSelector').value;
	}
	packageTips(){
		let tips = [];
		for(let i = 0; i < this.tips.length; i++){
			tips.push({
				id:this.tips[i].id,
				name:this.tips[i].querySelector('.t_name').value
			})
		}
		return tips;
	}
	unpackageTips(_tips){
		_tips.forEach((tip) => {
			tip.cloneParentId = 'st_prefab';
			this.tips.push(this.createTipElement(tip));
		});
		this.selectTip(this.tips[this.tips.length-1]);
		this.updateTipSelector();
	}


	//general control
	fromId(id){
		for(let i = 0; i < this.profiles.length; i++){
			if(this.profiles[i].id == id) return this.profiles[i];
		}
		return false;
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
		this.testGcodeSyntax();

		//load in the correct solder profile id
		document.getElementById('solderingTipSelector').value = this.activeProfile.solderingTipId;
		document.getElementById('tipCleanInterval').value = this.activeProfile.tipCleanInterval;
	}
	unpackageProfiles(pfs){
		for(let i = 0; i < pfs.length; i++){
			this.addProfileFromPackage(pfs[i]);
		}
	}
	packageProfiles(){
		let arr = [];
		this.profiles.forEach((profile) => {
			arr.push(profile.package())
		});
		return arr;
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
		solderProfile.name = e.srcElement.value;
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
		let newId = 'sp_'+randomIDstring();

		let newInstance = new SolderProfile({
			id:newId
		});

		//insert the profile in the correct spot
		let templatePosition = 0;
		for(let i = 0; i < this.profiles.length; i++){
			if(this.profiles[i].id == idOfTemplateProfile){
				templatePosition = i;
			}
		}
		this.profiles.splice(templatePosition+1, 0, newInstance);

		this.createUIforProfile(newInstance,templateSlot);
		this.loadProfile(newInstance.id);
	}

	createUIforProfile(instance,templateSlot){
		let clone = (templateSlot || document.getElementById('sp_prefab')).cloneNode(true);
		clone.style.display = '';
		clone.id = instance.id;
		this.profileSlotContainer.appendChild(clone);
		instance.setColor(instance.color);
		instance.addColorChangeTrigger(clone.querySelector('.sps_color'));
		clone.querySelector('.sps_name').value = instance.name;
		if(templateSlot) templateSlot.after(clone);
	}

	addProfileFromPackage(pkg){
		let newInstance = new SolderProfile(pkg);
		this.profiles.push(newInstance);
		this.createUIforProfile(newInstance);
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
		// if(!this.selectedVariableId || this.selectedVariableId == "headAngleVar") return; //if it's the mandatory head angle variable, we shouldn't delete it
		if(!this.selectedVariableId) return; // maybe it's better to not make the headAngle mandatory
		let variableElement = document.getElementById(this.selectedVariableId);
		console.log(variableElement);
		let id = variableElement.id;
		let vars = this.activeProfile.variables;
		for(let i = vars.length-1; i >= 0; i--){
			if(vars[i].id == id) vars.splice(i,1);
		}
		this.selectedVariableId = false;
		variableElement.remove();
		this.testGcodeSyntax();
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
			if(!this.activeProfile.variables) this.activeProfile.variables = [];
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
		this.testGcodeSyntax();
	}
	loadVariables(solderProfile){
		if(!solderProfile.variables) return;
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
		this.testGcodeSyntax();
	}

	//G-code container
	registerGcodeChange(){
		this.activeProfile.gcode = this.gcodeBox.getCode();
		this.testGcodeSyntax();
	}
	testGcodeSyntax(){
		let varObject = this.activeProfile.getVariableObject();
		let variables = this.activeProfile.gcode.match(/\{.+?\}/g);
		let errMsg = '';
		for(let i = 0; i < variables.length; i++){
			let variable = variables[i];
			let exp = variable.substr(1,variable.length-2);
			let result = this.activeProfile.getValueOfGParam(exp,varObject);
			if(!result.success){
				errMsg = result.value;
				break;
			}
		}
		this.exposeGcodeError(errMsg);
	}
	exposeGcodeError(errorMsg){
		document.getElementById("gTemplateError").innerText = errorMsg;
	}

	changeTipCleanInterval(evt){
		let value = Number(evt.target.value);
		if(isNaN(value)) value = 10;
		if(value < 1) value = 1;
		evt.target.value = value;
		this.activeProfile.tipCleanInterval = Number(evt.target.value);
	}

	//bottom menu
	closeEditorAndSave(){
		inspector.reset();
		this.windowElement.style.display = 'none';
	}

	restoreVaraibleDefaults(){
		tree.selectedElementsIds.forEach(id => {
			let pin = tree.fromId(id);
			if(pin.solderProfile.variables.length > 0){
				pin.solderProfile.variables.forEach(vb => {
					pin.solderProfileVariables[vb.gcodename] = vb.defaultvalue;
				});
			}
		});
		inspector.reset();
	}
}

let solderProfileWindow = new SolderProfileWindow();
