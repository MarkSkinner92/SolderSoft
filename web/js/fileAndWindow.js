class ProjectManager {
	constructor() {
		this.activePath = '';
	}
	unpackage(json){
		this.activePath = json.path;
		let nameparts = this.activePath.split('/');
		this.setEditingInfo("Editing: "+nameparts[nameparts.length-1]);

		solderProfileWindow.unpackage(json.solderProfileWindow);
		tree.unpackage(json.tree);
		config.unpackage(json.config);
		board.unpackage(json.board);
		inspector.reset();
	}
	package(){
		let json = {path: this.activePath};
		json.solderProfileWindow = solderProfileWindow.package();
		json.tree = tree.package();
		json.config = config.package();
		json.board = board.package();
		console.log(json);
		return json;
	}
	setEditingInfo(text){
		document.getElementById("editingInfo").innerText = text;
	}
	showBanner(text,options){
		document.getElementById('bannerText').innerText = text;
		document.getElementById('banner').style.top = '10px';
	}
	hideBanner(){
		document.getElementById('banner').style.top = '-80px';
	}
}
projectManager = new ProjectManager();

class FileManager {
	constructor() {
		this.fileMenu = document.getElementById('fileMenu');
		this.fileMenu.addEventListener('mousedown',(e)=>{
			this.fileMenu.innerHTML = "<option value='file' style='display:none'>File</option><option value='save'>Save</option><option value='saveas'>Save as...</option><option value='open'>Open</option>";
		});
		this.fileMenu.addEventListener('change',(e)=>{
			switch (e.target.value) {
				case 'save':
					this.saveFile();
					break;
				case 'saveas':
					this.saveFileAs();
					break;
				case 'open':
					this.openFile();
					break;
			}
			e.target.innerHTML = "<option value='default'>File</option>";
			e.target.value = 'default';
		});
		document.addEventListener("keydown", (event) => {
		  if (event.keyCode == 83 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {
				event.preventDefault();
				this.saveFile();
			}
		});
	}
	newFile(){
		projectManager.activePath = '';
		projectManager.setEditingInfo('Editing: Unsaved project');
	}
	saveFile(){
		if(!projectManager.activePath){
			this.saveFileAs();
			return;
		}
		projectManager.showBanner('Saving...','saveBanner');
		let filejson = projectManager.package();
		eel.savePackage(filejson)(status=>{
			if(status == 'success'){
				projectManager.showBanner("Saved");
				setTimeout(projectManager.hideBanner,500);
			}
			else if(status == 'failed') projectManager.showBanner("Failed to save file");
		});
	}
	saveFileAs(){
		projectManager.showBanner('Saving...','saveBanner');
		let filejson = projectManager.package();
		eel.savePackageAs(filejson)(info=>{
			if(info.status == 'success'){
				projectManager.activePath = info.path;
				projectManager.showBanner("Saved");
				let nameparts = projectManager.activePath.split('/');
				projectManager.setEditingInfo("Editing: "+nameparts[nameparts.length-1]);
				setTimeout(projectManager.hideBanner,800);
			}
			else if(info.status == 'failed'){
				projectManager.showBanner("Failed to save file");
				setTimeout(projectManager.hideBanner,1500);
			}
			else if(info.status == 'cancel'){
				projectManager.showBanner("Save canceled");
				setTimeout(projectManager.hideBanner,1000);
			}
		});
	}
	async openFile(){
		let contents = await this.getFile();
		if(contents == 'cancel'){
			projectManager.showBanner("Canceled file open");
			setTimeout(projectManager.hideBanner,500);
			return;
		}
		projectManager.unpackage(contents);
	}
	async getFile() {
		let result = await eel.openJSONfile()();
		return result;
	}
}
let fileManager = new FileManager();
