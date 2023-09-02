//https://codepen.io/WebCoder49/details/jOypJOx

Prism.languages.gcode = {
	'string': {
		pattern: /\{.+?\}/,
	},

	'comment': [
		/(?<=;)[^\n]*/gm,
		/;/,
		/\(.+?\)/
	],

	'number': /[-]{0,1}[\d]*[.]{0,1}[\d]+/g,
};
codeInput.registerTemplate("gcode", codeInput.templates.prism(Prism));

class GcodeBox {
	constructor(element,onchange) {
		this.element = element;
		this.element.addEventListener('keyup',onchange);
	}
	setCode(code){
		this.element.value = code;
	}
	getCode(){
		return this.element.value;
	}
	wipe(){
		this.setCode('');
	}
}
