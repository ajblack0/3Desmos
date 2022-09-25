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

var canvas = $('viewport');
var ctx = canvas.getContext('2d');
var camera = new Coordinate2D(0,Math.PI/2);
var prevMouse = new Coordinate2D(null,null);
var testPoint1 = new Coordinate2D(null,null);
var testPoint2 = new Coordinate2D(null,null);
var test3D1 = new Coordinate3D(1,0,0);
var test3D2 = new Coordinate3D(0,1,0);
var resolution = 80;
var A,B,C,D,F;
function f(x,y) {
    return 0.3*Math.sin(10*x)*Math.sin(8*y);
}
var fPoints = [];
for(i = 0; i <= resolution; i++) {
    fPoints.push([]);
    for(j = 0; j <= resolution; j++) {
        fPoints[i].push(new Coordinate3D(-1 + i*2/resolution, -1 + j*2/resolution, f(-1 + i*2/resolution, -1 + j*2/resolution)));
    }
}
var tempPoint;

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for(i = 0; i <= resolution; i++) {
        tempPoint = fPoints[i][0].transform(A,B,C,D,F);
        ctx.moveTo(canvas.width/2 + 300*tempPoint.x, canvas.height/2 + 300*tempPoint.y);
        for(j = 0; j <= resolution; j++) {
            tempPoint = fPoints[i][j].transform(A,B,C,D,F);
            ctx.lineTo(canvas.width/2 + 300*tempPoint.x, canvas.height/2 + 300*tempPoint.y);
        }
    }
    for(i = 0; i <= resolution; i++) {
        tempPoint = fPoints[0][i].transform(A,B,C,D,F);
        ctx.moveTo(canvas.width/2 + 300*tempPoint.x, canvas.height/2 + 300*tempPoint.y);
        for(j = 0; j <= resolution; j++) {
            tempPoint = fPoints[j][i].transform(A,B,C,D,F);
            ctx.lineTo(canvas.width/2 + 300*tempPoint.x, canvas.height/2 + 300*tempPoint.y);
        }
    }
    ctx.stroke();
    ctx.fillText(camera.x, 5, 10);
    ctx.fillText(camera.y, 5, 20);
}

function handleMouse(event) {
    if(event.buttons == 1) {
        if(prevMouse.x) {
            camera.add(12*(event.clientX - prevMouse.x) / canvas.width, 6*(event.clientY - prevMouse.y) / canvas.height);
            camera.x = mod(camera.x, 2*Math.PI);
            camera.y = clamp(camera.y,0, Math.PI);
        }
        A = Math.cos(camera.x);
        B = -Math.sin(camera.x);
        C = -B * Math.cos(camera.y);
        D = A * Math.cos(camera.y);
        F = Math.sin(camera.y);
        testPoint1 = test3D1.transform(A,B,C,D,F);
        testPoint2 = test3D2.transform(A,B,C,D,F);

        drawGraph();
    }
    prevMouse.set(event.clientX, event.clientY);
}

function handleKeys(event) {
    if(event.key == 'C') {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.beginPath();
    }
}

function resizeViewport() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGraph();
    drawGraph();
}

function $(id) {
    return document.getElementById(id);
}
function mod(m,n) {
    //fixes modulo of negative numbers
    return ((m % n) + n) % n;
}
function clamp(x, min, max) {
    return Math.max(Math.min(x,max),min);
}
