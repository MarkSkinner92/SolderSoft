var _usingeel = window.hasOwnProperty('eel');

//untility functions
function randomIDstring() {
  return (((1+Math.random())*0x1000000)|0).toString(16).substring(1);
}

HTMLElement.prototype.addOption = function(name,value){
  this.innerHTML += "<option value='"+value+"'>"+name+"</option>";
}
HTMLElement.prototype.removeOptions = function(){
  this.innerHTML = "";
}
HTMLElement.prototype.addOutline = function(){
	this.style.boxShadow = "0px 0px 0px 2px black";
}
HTMLElement.prototype.removeOutline = function(){
  this.style.boxShadow = "none";
}

function copyObject(input){
	return JSON.parse(JSON.stringify(input));
}
