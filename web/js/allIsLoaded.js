//this file runs after everything has been loaded in
window.addEventListener("load", (event) => {
	board.select();
	serial.fetchUSBPorts();

	eel.expose(recieveSerialLine); // Expose this function to Python
  function recieveSerialLine(x) {
		serial.recieveLine(x);
  }
});
