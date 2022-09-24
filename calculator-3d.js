class Coordinate2D {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    set(x,y) {
        this.x = x;
        this.y = y;
    }
    add(x,y) {
        this.x += x;
        this.y += y;
    }
}

var c = $('viewport')
var ctx = c.getContext('2d');
var cameraLocation = new Coordinate2D(null,null);
var prevMouse = new Coordinate2D(null,null);

init();
initGraph();

function init() {
    window.addEventListener('resize', resizeViewport, false);
    resizeViewport();
    document.onmousemove = handleMouse;
    document.onkeydown = handleKeys;
}

function initGraph() {
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
}

function handleMouse(event) {
    if(event.buttons == 1) {
        if(prevMouse.x) {
            cameraLocation.add(event.clientX - prevMouse.x, event.clientY - prevMouse.y); 
        }
        ctx.fillRect(cameraLocation.x, cameraLocation.y, 1, 1);
    }
    prevMouse.set(event.clientX, event.clientY);
}

function handleKeys(event) {
    if(event.key == 'C') {
        ctx.clearRect(0,0,c.width,c.height);
        ctx.beginPath();
    }
}

function resizeViewport() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    initGraph();
}

function $(id) {
    return document.getElementById(id);
}