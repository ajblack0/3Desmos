var canvas = document.getElementById('viewport');
var camera = {
    theta: 0,
    phi: 0
};
var prevMouse = {
    x: null,
    y: null
};
var mouseDown = false;

main();

function main() {
    var gl = canvas.getContext('webgl');
    if(!gl) {
        alert('WebGL unsupported!');
        return;
    }
    
    canvas.width = 640;
    canvas.height = 640;

    document.onmousemove = handleMouse;
    document.onmousedown = function(event) {
        if(event.target == canvas) {
            mouseDown = true;
            canvas.style.cursor = 'grabbing';
    }};
    document.onmouseup = function() {mouseDown = false; canvas.style.cursor = 'grab'};
    document.onkeydown = handleKeys;


    var vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    uniform mat4 u_matrix;
    varying vec4 v_color;

    void main() {
        gl_Position = u_matrix * a_position;
        v_color = a_color;
    }
    `;
    var fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color;
    }
    `;

    var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = createProgram(gl, vertexShader, fragmentShader);
    
    var programInfo = {
        program: program,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(program, 'a_position'),
            vertexColor: gl.getAttribLocation(program, 'a_color')
        },
        uniformLocations: {
            matrix: gl.getUniformLocation(program, 'u_matrix')
        }
    };

    var positions = [
        0, 0,
        0, 0.5,
        0.5, 0,
        -0.5, -0.5,
        0, -0.5,
        -0.5, 0
    ];
    var colors = [
        0.1, 0.5, 0.7, 1,
        0.05, 0.25, 0.35, 1,
        1, 1, 1, 1,
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 0
    ];
    var matrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]

    var buffers = {
        position: gl.createBuffer(),
        color: gl.createBuffer()
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    function renderLoop() {
        matrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            camera.theta / 1000, camera.phi / 1000, 0, 1
        ];
        //console.log(camera.theta + ' ' + camera.phi);
        drawGraph(gl, programInfo, buffers, matrix);
        requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
}

function drawGraph(gl, programInfo, buffers, matrix) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programInfo.program);

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    var size = 4;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, size, type, normalize, stride, offset);

    gl.uniformMatrix4fv(programInfo.uniformLocations.matrix, false, matrix);

    var count = 6;
    gl.drawArrays(gl.TRIANGLES, offset, count);
}

function loadShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function handleMouse(event) {
    if(mouseDown) {
        if(prevMouse.x) {
            camera.theta += event.clientX - prevMouse.x;
            camera.phi -= event.clientY - prevMouse.y;
        }
    }
    prevMouse.x = event.clientX;
    prevMouse.y = event.clientY;
}

function handleKeys(event) {
    if(event.key == 'C') {
        //clear scrn
    }
}

function mod(m,n) {
    //fixes modulo of negative numbers
    return ((m % n) + n) % n;
}
function clamp(x, min, max) {
    return Math.max(Math.min(x,max),min);
}
