//untility functions
function randomIDstring() {
  return (((1+Math.random())*0x1000000)|0).toString(16).substring(1);
}

function distance(a,b){
  return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2)
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

function highlightLines(element, linesToHighlight) {
  // Remove any existing line highlights
  element.querySelectorAll('.line-highlight').forEach(function(el) {
      el.classList.remove('line-highlight');
  });
  
  // Add line highlights to specified lines
  linesToHighlight.forEach(function(lineNumber) {
      var line = element.querySelector('span.line[data-line-number="' + lineNumber + '"]');
      if (line) {
          line.classList.add('line-highlight');
      }
  });
}