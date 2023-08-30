class GcodeBox {
	constructor(element,onchange) {
		this.element = element;
		this.element.addEventListener('keyup',onchange);
	}
	setCode(code){
		this.element.innerHTML = code;
	}
	getCode(){
		return this.element.innerText;
	}
	resetSentaxHighlighting(){
		// this.selection = window.getSelection();
		// console.log(this.selection);
		//
		// let gcode = this.element.innerText;
		//
		// let attemptedVariables = gcode.match(/{(.*?)}/g);
		//
		// if(attemptedVariables) for(let i = 0; i < attemptedVariables.length; i++){
		// 	let gcode = this.element.innerHTML;
		// 	this.element.innerHTML = gcode.replaceAll(attemptedVariables[i],"<span class='valid'>"+attemptedVariables[i]+"</span>");
		// }
	}
}
