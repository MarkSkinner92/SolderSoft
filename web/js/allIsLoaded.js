//this file runs after everything has been loaded in
document.addEventListener("DOMContentLoaded", function(event){
	board.select();
	serial.fetchUSBPorts();
	preview.fillElement(document.getElementById("previewPanel"));

	preview.ctx.setTransform(3,0,0,3,30,370);
	redrawPreviewWindow();

	eel.expose(recieveSerialLine); // Expose this function to Python
  function recieveSerialLine(x) {
		serial.recieveLine(x);
  }
});

function redrawPreviewWindow(){
	preview.redraw();
	window.requestAnimationFrame(redrawPreviewWindow);
}
