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
class Coordinate3D {
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(x,y,z) {
        this.x += x;
        this.y += y;
        this.z += z;
    }
    scalar(c) {
        this.x *= c;
        this.y *= c;
        this.z *= c;
    }
    dot(v) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
    }
    transform(a1,b1,c1,d1,f1) {
        return new Coordinate2D(a1*this.x + b1*this.y, c1*this.x + d1*this.y + f1*this.z);
    }
}
function mod(m,n) {
    //fixes modulo of negative numbers
    return ((m % n) + n) % n;
}

var c = $('viewport');
var ctx = c.getContext('2d');
var cameraLocation = new Coordinate2D(null,null);
var prevMouse = new Coordinate2D(null,null);
var testPoint1 = new Coordinate2D(null,null);
var testPoint2 = new Coordinate2D(null,null);
var test3D1 = new Coordinate3D(1,0,0);
var test3D2 = new Coordinate3D(0,1,0);
var A,B,C,D,F;

init();
initGraph();
drawGraph();

function init() {
    window.addEventListener('resize', resizeViewport, false);
    resizeViewport();
    document.onmousemove = handleMouse;
    document.onkeydown = handleKeys;
}

function initGraph() {
    ctx.strokeStyle = 'whitesmoke';
    ctx.fillStyle = 'whitesmoke';
    ctx.font = '10px "Consolas"';
}

function drawGraph() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillRect(c.width/2, c.height/2, 1, 1);
    ctx.fillRect(c.width/2 + 300*testPoint1.x, c.height/2 + 300*testPoint1.y, 1, 1);
    ctx.fillRect(c.width/2 + 300*testPoint2.x, c.height/2 + 300*testPoint2.y, 1, 1);
    ctx.fillText(cameraLocation.x, 5, 10);
    ctx.fillText(cameraLocation.y, 5, 20);
}

function handleMouse(event) {
    if(event.buttons == 1) {
        if(prevMouse.x) {
            cameraLocation.add(12*(event.clientX - prevMouse.x) / c.width, -6*(event.clientY - prevMouse.y) / c.height);
            cameraLocation.x = mod(cameraLocation.x, 2*Math.PI)
        }
        A = Math.cos(cameraLocation.x);
        B = -Math.sin(cameraLocation.x);
        C = -B * Math.sin(cameraLocation.y);
        D = A * Math.sin(cameraLocation.y);
        F = Math.cos(cameraLocation.y);
        testPoint1 = test3D1.transform(A,B,C,D,F);
        testPoint2 = test3D2.transform(A,B,C,D,F);

        drawGraph();
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