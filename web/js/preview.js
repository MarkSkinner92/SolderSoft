//Based pff of Gavin Kistner's ZoomPan action
//http://phrogz.net/tmp/canvas_zoom_to_cursor.html

class Preview{
	constructor(canvas){
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.trackTransforms(this.ctx);

		this.lastX = canvas.width/2;
		this.lastY = canvas.height/2;
		this.dragStart = undefined;
		this.dragged = undefined;
		this.scaleFactor = 1.1;

		this.mousedown = function(evt){
			document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
			this.lastX = evt.offsetX || (evt.pageX - this.canvas.offsetLeft);
			this.lastY = evt.offsetY || (evt.pageY - this.canvas.offsetTop);
			this.dragStart = this.ctx.transformedPoint(this.lastX,this.lastY);
			this.dragged = false;
		};

		this.mousemove = function(evt){
			this.lastX = evt.offsetX || (evt.pageX - this.canvas.offsetLeft);
			this.lastY = evt.offsetY || (evt.pageY - this.canvas.offsetTop);
			this.dragged = true;
			if (this.dragStart){
				var pt = this.ctx.transformedPoint(this.lastX,this.lastY);
				this.ctx.translate(pt.x-this.dragStart.x,pt.y-this.dragStart.y);
			}
		};

		this.zoom = function(clicks){
			var pt = this.ctx.transformedPoint(this.lastX,this.lastY);
			this.ctx.translate(pt.x,pt.y);
			var factor = Math.pow(this.scaleFactor,clicks);
			this.ctx.scale(factor,factor);
			this.ctx.translate(-pt.x,-pt.y);
		}
		this.mouseup = function(evt){
			this.dragStart = null;
		}
		this.handleScroll = function(evt){
			var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
			if (delta) this.zoom(delta);
			return evt.preventDefault() && false;
		}

		this.mousedown = this.mousedown.bind(this);
		this.mousemove = this.mousemove.bind(this);
		this.mouseup = this.mouseup.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.redraw = this.redraw.bind(this);

		this.canvas.addEventListener('mousedown',this.mousedown,false);
		this.canvas.addEventListener('mousemove',this.mousemove,false);
		this.canvas.addEventListener('mouseup',this.mouseup,false);
		this.canvas.addEventListener('DOMMouseScroll',this.handleScroll,false);
		this.canvas.addEventListener('mousewheel',this.handleScroll,false);
	}

	// Adds ctx.getTransform() - returns an SVGMatrix
	// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
	trackTransforms(ctx){
		var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
		var xform = svg.createSVGMatrix();
		ctx.getTransform = function(){ return xform; };

		var savedTransforms = [];
		var save = ctx.save;
		ctx.save = function(){
			savedTransforms.push(xform.translate(0,0));
			return save.call(ctx);
		};
		var restore = ctx.restore;
		ctx.restore = function(){
			xform = savedTransforms.pop();
			return restore.call(ctx);
		};

		var scale = ctx.scale;
		ctx.scale = function(sx,sy){
			xform = xform.scaleNonUniform(sx,sy);
			return scale.call(ctx,sx,sy);
		};
		var rotate = ctx.rotate;
		ctx.rotate = function(radians){
			xform = xform.rotate(radians*180/Math.PI);
			return rotate.call(ctx,radians);
		};
		var translate = ctx.translate;
		ctx.translate = function(dx,dy){
			xform = xform.translate(dx,dy);
			return translate.call(ctx,dx,dy);
		};
		var transform = ctx.transform;
		ctx.transform = function(a,b,c,d,e,f){
			var m2 = svg.createSVGMatrix();
			m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
			xform = xform.multiply(m2);
			return transform.call(ctx,a,b,c,d,e,f);
		};
		var setTransform = ctx.setTransform;
		ctx.setTransform = function(a,b,c,d,e,f){
			xform.a = a;
			xform.b = b;
			xform.c = c;
			xform.d = d;
			xform.e = e;
			xform.f = f;
			return setTransform.call(ctx,a,b,c,d,e,f);
		};
		var pt  = svg.createSVGPoint();
		ctx.transformedPoint = function(x,y){
			pt.x=x; pt.y=y;
			return pt.matrixTransform(xform.inverse());
		}
	}

	drawBackground(){
		this.ctx.lineWidth = 2*this.sm;
		this.ctx.strokeStyle = "#DDD";
		//horizontal lines
		// for(let y = 0,i=0; y < this.p2.y; y+=10,i++){
		// 	if(y == 0) continue;
		// 	this.ctx.beginPath();
		// 	this.ctx.moveTo(this.p1.x,y);
		// 	this.ctx.lineTo(this.p2.x,y);
		// 	this.ctx.closePath();
		// 	this.ctx.stroke();
		// }
		// for(let y = 0,i=0; y > this.p1.y; y-=10,i++){
		// 	if(y == 0) continue;
		// 	this.ctx.beginPath();
		// 	this.ctx.moveTo(this.p1.x,y);
		// 	this.ctx.lineTo(this.p2.x,y);
		// 	this.ctx.closePath();
		// 	this.ctx.stroke();
		// }
		// //vertical lines
		// for(let x = 0,i=0; x < this.p2.x; x+=10,i++){
		// 	if(x == 0) continue;
		// 	this.ctx.beginPath();
		// 	this.ctx.moveTo(x,this.p1.y);
		// 	this.ctx.lineTo(x,this.p2.y);
		// 	this.ctx.closePath();
		// 	this.ctx.stroke();
		// }
		// for(let x = 0,i=0; x > this.p1.x; x-=10,i++){
		// 	if(x == 0) continue;
		// 	this.ctx.beginPath();
		// 	this.ctx.moveTo(x,this.p1.y);
		// 	this.ctx.lineTo(x,this.p2.y);
		// 	this.ctx.closePath();
		// 	this.ctx.stroke();
		// }

		//Draw Axis lines
		this.ctx.lineWidth = 2*this.sm;
		this.ctx.strokeStyle = "#F00";
		this.ctx.beginPath();
		this.ctx.moveTo(this.p1.x,0);
		this.ctx.lineTo(this.p2.x,0);
		this.ctx.closePath();
		this.ctx.stroke();

		this.ctx.strokeStyle = "#0F0";
		this.ctx.beginPath();
		this.ctx.moveTo(0,this.p1.y);
		this.ctx.lineTo(0,this.p2.y);
		this.ctx.closePath();
		this.ctx.stroke();
	}

	clearCanvas(){
		this.ctx.save();
		this.ctx.setTransform(1,0,0,1,0,0);
		this.ctx.clearRect(0,0,canvas.width,canvas.height);
		this.ctx.restore();
	}

	drawboard(){
		this.ctx.lineWidth = 2*this.sm;
		this.ctx.strokeStyle = "#000";
		this.ctx.strokeRect(this.boardXToWorldX(0),this.boardYToWorldY(board.size.y),board.size.x,board.size.y);
	}

	boardYToWorldY(y){
		return board.position.y*-1-y;
	}
	boardXToWorldX(x){
		return board.position.x+x;
	}

	getPathOfPins(){
		let path = [[this.boardXToWorldX(0),this.boardYToWorldY(0)]];
		for(let i = 0; i < tree.elements.length; i++){
			let thisElement = tree.elements[i];
			if(thisElement.isPin() && thisElement.enabled){
				let pos = thisElement.getGlobalPosition();
				path.push([pos.x,pos.y]);
			}
		}
		return path;
	}

	drawPin(pin){
		let pos = pin.getGlobalPosition();
		let x = pos.x;
		let y = pos.y;

		if(pin.enabled){
			if(pin.selected || pin.parentConnector?.selected){
				this.ctx.fillStyle = "#CCC";
				this.ctx.beginPath();
				this.ctx.arc(
					this.boardXToWorldX(x),
					this.boardYToWorldY(y),
					3,
					0,
					2 * Math.PI
				);
				this.ctx.closePath();
				this.ctx.fill();
			}
		}

		if(pin.enabled) this.ctx.fillStyle = pin.solderProfile.color;
		else this.ctx.fillStyle = '#DDD';
		this.ctx.beginPath();
		this.ctx.arc(
			this.boardXToWorldX(x),
			this.boardYToWorldY(y),
			1,
			0,
			2 * Math.PI
		);
		this.ctx.closePath();
		this.ctx.fill();
	}

	redraw(){
		this.p1 = this.ctx.transformedPoint(0,0);
		this.p2 = this.ctx.transformedPoint(canvas.width,canvas.height);
		this.sm = (this.p2.y-this.p1.y)/canvas.height;

		this.clearCanvas();
		//draw the grid and axis lines
		this.drawBackground();

		this.drawboard();

		for(let i = 0; i < tree.elements.length; i++){
			let thisElement = tree.elements[i];
			if(thisElement.isPin()){
				this.drawPin(thisElement);
			}
		}

		let path = this.getPathOfPins();
		this.ctx.strokeStyle = '#F00';
		this.ctx.beginPath();
		this.ctx.moveTo(path[0][0]-board.position.x,path[0][1]+board.position.y);
		for(let i = 1; i < path.length; i++){
			this.ctx.lineTo(this.boardXToWorldX(path[i][0]),this.boardYToWorldY(path[i][1]));
		}
		this.ctx.stroke();

	}
	resizeCanvas(w,h){
		this.canvas.width = w;
		this.canvas.height = h;
		this.trackTransforms(this.ctx);
	}

	fillElement(ele){
		let box = ele.getBoundingClientRect();
		this.resizeCanvas(box.width,box.height-2);
	}
}

var canvas = document.getElementById("previewCanvas");
canvas.width = 800; canvas.height = 600;
let preview = new Preview(canvas);
preview.fillElement(document.getElementById("previewPanel"));

window.addEventListener("resize", (event) => {
	let ot = preview.ctx.getTransform();
	preview.fillElement(document.getElementById("previewPanel"));
	preview.ctx.setTransform(ot.a,ot.b,ot.c,ot.d,ot.e,ot.f);
});

//untility functions
function randomIDstring() {
  return (((1+Math.random())*0x1000000)|0).toString(16).substring(1);
}
