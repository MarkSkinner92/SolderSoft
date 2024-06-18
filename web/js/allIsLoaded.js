//this file runs after everything has been loaded in
document.addEventListener("DOMContentLoaded", function(event){
	board.select();
	serial.fetchUSBPorts();
	preview.fillElement(document.getElementById("previewPanel"));

	preview.ctx.setTransform(3,0,0,3,30,370);
	redrawPreviewWindow();

	eel.expose(recieveSerialLine);
	function recieveSerialLine(x) {
		serial.recieveLine(x);
	}
	if(env != 'web') connectorLibrary.pullFromLibrary();
});

function redrawPreviewWindow(){
	preview.redraw();
	window.requestAnimationFrame(redrawPreviewWindow);
}