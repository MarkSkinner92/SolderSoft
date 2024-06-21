// const rawData = 'roverbasepanel.txt';

// Fetch the file
// fetch("../roverbasepanel.txt")
// .then(response => {
//     return response.text();
// })
// .then(data => {
//     importer.openRawText(data);
// })

function parseNCDrill(rawText){
    let data = [];
    // console.log(rawText);
    let lines = rawText.split('\n');

    let readingData = false;
    let toolNumber = 1;

    lines.forEach(line => {
        // if(readingData){
        let firstLetter = line[0];

        if(firstLetter == 'T' && line.length < 5){
            toolNumber = parseToolNumber(line);
            data[toolNumber] = [];
        }

        if(firstLetter == 'X'){
            data[toolNumber].push(parsePinLine(line))
        }

        if(line == '%'){
            readingData = true;
        }

    });

    return data;
    // console.log(data);
}

function parsePinLine(line){
    coords = line.match(/\d+/g).map(Number);
    return {
        x:coords[0]/1000,
        y:coords[1]/1000
    }
}

function parseToolNumber(line){
    return parseInt(line.match(/\d+/)[0]);
}

class Importer{
    constructor(element){
        this.menu = element;
        this.canvas = this.menu.querySelector('#im_canvas');
        this.ctx = this.canvas.getContext('2d');

        this.selector = this.menu.querySelector('.im_selectTool');
        this.boardWidth = this.menu.querySelector('.im_width');
        this.boardHeight = this.menu.querySelector('.im_height');
        this.selector.onchange = () => {
            this.changeTip();
        }
        setTimeout(()=>{
            this.resized();
        },300);

        let fileInput = this.menu.querySelector('.im_file')
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    importer.resized();
                    const fileContents = e.target.result;
                    importer.openRawText(fileContents);
                };

                reader.readAsText(file);
            }
        });

    }
    openMenu(){
		this.menu.style.display = 'block';
	}
	closeMenu(){
		this.menu.style.display = 'none';
	}
    openRawText(text){
        console.log("got text",text.length);
        this.data = parseNCDrill(text);
        let tools = Object.keys(this.data);
        let options = "";

        tools.forEach(tool => {
            options += `<option value="${tool}">Tool ${tool}</option>`;
        });

        this.selector.innerHTML = options;
        this.selectedTip = 1;
        this.draw();
    }
    getSize(){
        this.size = document.querySelector('.im_middle').getBoundingClientRect();
        console.log(this.size);
    }
    resized(){
        this.getSize();
        this.canvas.width = this.size.width;
        this.canvas.height = this.size.height;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.translate(15, this.canvas.height-15);
        this.ctx.scale(1, -1);

        this.draw();
    }
    changeTip(){
        this.selectedTip = this.selector.value;
        this.draw();
    }
    draw(){
        if(!this.data) return;
        if(!this.data[this.selectedTip]) return;
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.ctx.restore();

        this.data[this.selectedTip].forEach(point => {
            this.drawPoint(point, 5);
        });

        this.ctx.strokeRect(0, 0, parseFloat(this.boardWidth.value)*5, parseFloat(this.boardHeight.value)*5)

        this.drawPoint({x:0,y:0});
    }

    drawPoint(point, scale){
        this.ctx.beginPath();
        this.ctx.arc(
            point.x*scale,
            point.y*scale,
            3,
            0,
            2 * Math.PI
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    rotate(){
        if(!this.data) return;
        let tools = Object.keys(this.data);

        let tmpValue = this.boardWidth.value;
        this.boardWidth.value = this.boardHeight.value;
        this.boardHeight.value = tmpValue;

        tools.forEach(tool => {
            this.data[tool].forEach(pin => {
                let newX = 0;
                let newY = 0;
                newX = pin.y;
                newY = -pin.x+parseFloat(this.boardHeight.value);
                pin.x = newX;
                pin.y = newY;
            });
        });

        this.draw();
    }

    mirror(){
        if(!this.data) return;
        let tools = Object.keys(this.data);

        tools.forEach(tool => {
            this.data[tool].forEach(pin => {
                pin.x = -pin.x + parseFloat(this.boardWidth.value);
            });
        });

        this.draw();
    }

    addToBoard(){
        if(!this.data[this.selectedTip]) return;

        let pins = [];
        let pinNumber = 1;

        let con = new Connector({
            name:"tool-"+this.selectedTip,
            position:{
                x:0,
                y:0
            }
        });
        tree.elements.push(con);

        this.data[this.selectedTip].forEach(point => {

            pins.push(new Pin({
                name:'S'+pinNumber,
                position:{
                    x:point.x,
                    y:point.y
                }
            }));
            pinNumber++;
        });

        for(let i = 0; i < pins.length; i++){
            tree.elements.push(pins[i]);
            pins[i].setParent(con);
        }

        this.closeMenu();
    }
}

// TODO - make this better
let importer = new Importer(document.getElementById('importMenu'));

window.addEventListener("resize", (event) => {
    importer.resized();
});