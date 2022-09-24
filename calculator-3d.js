var c = $('viewport')
var ctx = c.getContext('2d');

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
}

function handleMouse(event) {
    if(event.buttons == 1) {
        ctx.lineTo(event.clientX,event.clientY);
        ctx.stroke();
    }
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
    var imageData = ctx.createImageData(c.width,c.height);
    initGraph();
}

function $(id) {
    return document.getElementById(id);
}