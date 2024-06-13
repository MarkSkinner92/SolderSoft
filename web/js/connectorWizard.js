class ConnectorWizard {
	constructor(element) {
		this.element = element;
	}
	open(){
		this.element.style.display = "block";
	}
	close(){
		this.element.style.display = "none";
	}
	cancel(){
		this.close();
	}
	resetValues(){
		let allInputs = this.element.querySelectorAll('[name]');
		for(let i = 0; i < allInputs.length; i++){
			allInputs[i].value = '';
		}
	}
	addConnector(){
		let vals = {
			name:this.getValue('name'),
			xorigin:Number(this.getValue('xorigin')),
			yorigin:Number(this.getValue('yorigin')),
			xcount:Number(this.getValue('xcount')),
			ycount:Number(this.getValue('ycount')),
			xpitch:Number(this.getValue('xpitch')),
			ypitch:Number(this.getValue('ypitch')),
			rotation:Number(this.getValue('rotation')),
		}
		let xpos = vals.xorigin;
		let ypos = vals.yorigin;

		let con = new Connector({
			name:vals.name,
			position:{
				x:xpos,
				y:ypos
			}
		});
		tree.elements.push(con);

		let pins = [];
		let pinNumber = 1;
		for(let x = 0; x < vals.xcount; x++){
			for(let y = 0; y < vals.ycount; y++){
				pins.push(new Pin({
					name:'S'+pinNumber,
					position:{
						x:xpos,
						y:ypos
					}
				}));
				ypos += vals.ypitch;
				pinNumber++;
			}
			xpos += vals.xpitch;
			ypos = vals.yorigin;
		}
		for(let i = 0; i < pins.length; i++){
			tree.elements.push(pins[i]);
			pins[i].setParent(con);
		}
		con.setRotation(vals.rotation);
		con.collapse();
		this.close();
	}
	getValue(attr){
		return(this.element.querySelector('[name='+attr+']').value);
	}
}
let connectorWizard = new ConnectorWizard(document.getElementById('connectorWizard'));

class ConnectorLibrary {
	constructor() {
		this.connectors = [];
		this.selectedConnectors = [];
	}
	createNew(options){
		console.log(options);
		let con = new ConnectorPrefab(options);
		this.connectors.push(con);
		return con;
	}
	selectByClickEvent(evt){
		let con = this.fromId(evt.target.closest('.cn_slot').id);
		connectorLibrary.deselectAll();
		con.select();
	}
	addClick(){
		for(let i = 0; i < this.selectedConnectors.length; i++){
			this.selectedConnectors[i].insertConnector();
		}
	}
	removeClick(){
		for(let i = this.selectedConnectors.length-1; i >= 0; i--){
			this.selectedConnectors[i].destroy();
			this.deleteFromLibrary(this.selectedConnectors[i]);
			this.selectedConnectors.splice(i,1);
		}
		
	}
	fromId(id){
		for(let i = 0; i < this.connectors.length; i++){
			if(this.connectors[i].id == id) return this.connectors[i];
		}
	}
	deselectAll(){
		for(let i = this.selectedConnectors.length-1; i >= 0; i--){
			this.selectedConnectors[i].deSelect();
		}
	}
	addToSelected(conslot){
		this.selectedConnectors.push(conslot);
	}
	removeFromSelected(con){
		for(let i = this.selectedConnectors.length-1; i >= 0; i--){
			if(this.selectedConnectors[i].id == con.id){
				this.selectedConnectors.splice(i,1);
				break;
			}
		}
	}
	deleteFromLibrary(con){
		for(let i = this.connectors.length-1; i >= 0; i--){
			if(this.connectors[i].id == con.id){
				this.connectors.splice(i,1);
				break;
			}
		}
	}
	package(){
		return this.connectors;
	}
	unpackage(connectorPrefabs){
		for(let i = 0; i < this.connectors.length; i++){
			this.connectors[i].destroy();
		}
		this.connectors = [];

		if(!connectorPrefabs) return;
		this.connectors = connectorPrefabs;
		for(let i = 0; i < connectorPrefabs.length; i++){
			this.connectors[i] = new ConnectorPrefab(this.connectors[i]);
		}
	}
	pullFromLibrary(){
		if(_usingeel){
			eel.fetchConnectorLibrary()().then(value => {
				this.unpackage(value);
			});
		}
	}
	pushToLibrary(){
		if(_usingeel){
			eel.updateConnectorLibrary(this.package());
		}
	}
}

class ConnectorPrefab {
	constructor(options) {
		options = copyObject(options);
		this.id = options?.id || 'cn-'+randomIDstring();
		this.name = options?.name || 'Unnamed';
		this.description = options?.description || '';
		this.prefabData = copyObject(options?.prefabData) || '';
		this.element = this.createSlot();
	}
	createSlot(updateMasterLibrary){
		let child = document.getElementById('cn_prefab').cloneNode(true);
		child.id = this.id;
		child.querySelector('.cn_name').innerText = this.name;
		child.querySelector('.cn_description').innerText = this.description;
		child.style.display = 'block';
		document.getElementById('cn_container').appendChild(child);
		return child;
	}
	select(){
		connectorLibrary.addToSelected(this);
		this.element.addOutline();
	}
	deSelect(){
		this.element.removeOutline();
		connectorLibrary.removeFromSelected(this);
	}
	destroy(){
		this.element.remove();
	}
	//construct actual connector object from data and attatch it to tree
	insertConnector(){
		let elements = [];

		//make first element a clone of the connector
		let conJSON = copyObject(this.prefabData[0]);
		conJSON.pins = [];
		conJSON.id = false;
		elements.push(tree.unpackageElement(copyObject(conJSON)));

		//continue adding the pins, and linking them as children of the connector
		for(let i = 1; i < this.prefabData.length; i++){
			let elementJSON = this.prefabData[i];
			elementJSON.id = false;
			elementJSON.parentConnectorId = false;
			elements.push(tree.unpackageElement(copyObject(elementJSON)));
		}

		for(let i = 0; i < elements.length; i++){
			let instance = elements[i];
			tree.elements.push(instance);
			if(i != 0){ //if it's a pin rather than a connector, add it, then attatch it to the parent
				instance.setParent(elements[0]);
			}
		}
		connectorWizard.close();
	}
}

connectorLibrary = new ConnectorLibrary();

class AddToLibraryWizard {
	constructor(element) {
		this.options = {};
		this.element = element;
	}
	open(options){
		this.putOptions(options);
		this.element.style.display = 'block';
	}
	close(){
		this.element.style.display = 'none';
	}
	putOptions(options){
		this.options = options;
		this.element.querySelector('#atl_name').value = this.options.name || "";
		this.element.querySelector('#atl_description').value = this.options.description || "";
	}
	getOptions(){
		let obj = this.options;
		obj.name = this.element.querySelector('#atl_name').value;
		obj.description = this.element.querySelector('#atl_description').value;
		return obj;
	}
	save(){
		this.close();
		console.log(connectorLibrary);
		connectorLibrary.deselectAll();
		connectorLibrary.createNew(this.getOptions()).select();
		connectorWizard.open();
	}
}
let addToLibraryWizard = new AddToLibraryWizard(document.getElementById('addToLibraryWizard'));
