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
var framerate = -1;
var time = 0;
var prevTime = 0;
var prevMouse = new Coordinate2D(null,null);
var resolution = 10;
var A,B,C,D,F;
function f(x,y) {
    return 0.3*Math.sin(10*x)*Math.sin(8*y);
}
var fPoints = [];
var fProjected = [];
for(i = 0; i < resolution; i++) {
    for(j = 0; j < resolution; j++) {
        fPoints.push(new Coordinate3D(-1 + i*2/resolution, -1 + j*2/resolution, f(-1 + i*2/resolution, -1 + j*2/resolution)));
        fProjected.push(fPoints[i*resolution + j].transform(A,B,C,D,F));
    }
}

init();
initGraph();
window.requestAnimationFrame(drawGraph);

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
    ctx.lineWidth = 2;
}

function drawGraph() {
    A = Math.cos(camera.x);
    B = -Math.sin(camera.x);
    C = -B * Math.cos(camera.y);
    D = A * Math.cos(camera.y);
    F = Math.sin(camera.y);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    /*for(i = 0; i <= resolution; i++) {
        tempPoint = fPoints[i][0].transform(A,B,C,D,F);
        ctx.moveTo(canvas.width/2 + 300*tempPoint.x, canvas.height/2 + 300*tempPoint.y);
        for(j = 0; j <= resolution; j++) {
            tempPoint = fPoints[i][j].transform(A,B,C,D,F);
            ctx.lineTo(canvas.width/2 + 300*tempPoint.x, canvas.height/2 + 300*tempPoint.y);
        }
    }*/
    fProjected[0] = fPoints[0].transform(A,B,C,D,F);
    for(i = 0; i < resolution*resolution; i++) {
        if(i < resolution) {
            fProjected[i+1] = fPoints[i+1].transform(A,B,C,D,F);
        }
        if(i < resolution*resolution - resolution - 1) {
            fProjected[i+resolution+1] = fPoints[i+resolution+1].transform(A,B,C,D,F);
            //for(j = 0.2; j < 1; j += 0.2) {
            //    ctx.fillRect(canvas.width/2 + 300*lerp(fProjected[i].x, fProjected[i+1].x, j), canvas.height/2 + 300*lerp(fProjected[i].y, fProjected[i+1].y, j), 2, 2);
            //}
            //ctx.fillRect(canvas.width/2 + 300*(2*fProjected[i+1].x+fProjected[i].x)/3, canvas.height/2 + 300*(2*fProjected[i+1].y+fProjected[i].y)/3,8,8);
            //ctx.fillRect(canvas.width/2 + 300*(fProjected[i+1].x+2*fProjected[i].x)/3, canvas.height/2 + 300*(fProjected[i+1].y+2*fProjected[i].y)/3,8,8);
            if(i % resolution != resolution-1) {
                ctx.moveTo(canvas.width/2 + 300*fProjected[i].x, canvas.height/2 + 300*fProjected[i].y);
                ctx.lineTo(canvas.width/2 + 300*fProjected[i+1].x, canvas.height/2 + 300*fProjected[i+1].y);
                ctx.lineTo(canvas.width/2 + 300*fProjected[i+resolution+1].x, canvas.height/2 + 300*fProjected[i+resolution+1].y);
                ctx.lineTo(canvas.width/2 + 300*fProjected[i+resolution].x, canvas.height/2 + 300*fProjected[i+resolution].y);
                drawPolygon(fProjected[i], fProjected[i+1], fProjected[i+resolution+1], fProjected[i+resolution]);
                ctx.stroke();
            }
        }
        /*if(i % resolution == 1) {
            ctx.moveTo(canvas.width/2 + 300*fProjected[i].x, canvas.height/2 + 300*fProjected[i].y);
        } else {
            ctx.lineTo(canvas.width/2 + 300*fProjected[i].x, canvas.height/2 + 300*fProjected[i].y);
        }*/
        //ctx.fillStyle = 'hsl('+(190+(3*i%26))+',100%,50%)';
        //ctx.fillRect(canvas.width/2 + 300*fProjected[i].x, canvas.height/2 + 300*fProjected[i].y,3,3);
        
        
    }
    /*for(i = 0; i <= resolution; i++) {
        tempPoint = fPoints[0][i].transform(A,B,C,D,F);
        ctx.moveTo(canvas.width/2 + 300*tempPoint.x, canvas.height/2 + 300*tempPoint.y);
        for(j = 0; j <= resolution; j++) {
            tempPoint = fPoints[j][i].transform(A,B,C,D,F);
            ctx.lineTo(canvas.width/2 + 300*tempPoint.x, canvas.height/2 + 300*tempPoint.y);
        }
    }*/
    let grad = ctx.createLinearGradient(centerX(0), centerY(0), centerX(0.5), centerY(0.5));
    grad.addColorStop(0, "rgb(0,0,0)");
    grad.addColorStop(0.5, "rgb(0,255,255)");
    grad.addColorStop(1, "rgb(255,255,255)");
    ctx.moveTo(centerX(0), centerY(0));
    ctx.lineTo(centerX(0.5), centerY(0.5));
    ctx.strokeStyle = grad;
    
    ctx.stroke();

    ctx.fillText(camera.x, 5, 10);
    ctx.fillText(camera.y, 5, 20);
    
    window.requestAnimationFrame(drawGraph);
}

function handleMouse(event) {
    if(event.buttons == 1) {
        if(prevMouse.x) {
            camera.add(6*(event.clientX - prevMouse.x) / canvas.width, 6*(event.clientY - prevMouse.y) / canvas.height);
            camera.x = mod(camera.x, 2*Math.PI);
            camera.y = clamp(camera.y,0, Math.PI);
        }
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
    canvas.width = 800;//window.innerWidth;
    canvas.height = 800;//window.innerHeight;
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
function clamp(a, min, max) {
    return Math.max(Math.min(a,max),min);
}
function lerp(a, b, percent) {
    return percent*a + (1-percent)*b;
}
function centerX(x) {
    return canvas.width/2 + 300*x;
}
function centerY(y) {
    return canvas.height/2 + 300*y;
}
function drawPolygon(a, b, c, d) {
    ctx.moveTo(centerX(a.x), centerY(a.y));
    ctx.lineTo(centerX(b.x), centerY(b.y));
    ctx.lineTo(centerX(c.x), centerY(c.y));
    ctx.lineTo(centerX(d.x), centerY(d.y));
    ctx.closePath();
}
