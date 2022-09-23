var c = $('viewport')
var ctx = c.getContext('2d');

init();
draw();

function init() {
    window.addEventListener('resize', resizeViewport, false);
    resizeViewport();
}

function draw() {
    ctx.strokeStyle = 'white';
    ctx.moveTo(c.width/2,c.height/2);
    ctx.lineTo(c.width/2,c.height/2 - 1);
    ctx.stroke();
}

function resizeViewport() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

function $(id) {
    return document.getElementById(id);
}