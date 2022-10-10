var canvas = document.getElementById('viewport');
var camera = {
    theta: 0,
    phi: Math.PI/2
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
    document.onmousedown = function(event) {mouseDown = (event.target == canvas);};
    document.onmouseup = function() {mouseDown = false;};
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
        0, 0, 0.5,
        0, 0.5, 0.5,
        0.5, 0, 0.5 ,
        0, -0.5, 0,
        -0.5, -0.5, 0,
        -0.5, 0, 0,
        0, 0, 0,
        0, 0.3, 0.3,
        0.3, 0, 0.3,
        0, 0, 0,
        0, -0.3, 0.3,
        0.3, 0, 0.3,
        0, 0, 0,
        0, 0.3, 0.3,
        -0.3, 0, 0.3
    ];
    var colors = [
        0.1, 0.5, 0.7, 1,
        0.05, 0.25, 0.35, 1,
        1, 1, 1, 1,
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        0, 0.5, 0.5, 1,
        0, 0.5, 0.5, 1,
        0, 0.5, 0.5, 1,
        0.5, 0, 0.5, 1,
        0.5, 0, 0.5, 1,
        0.5, 0, 0.5, 1,
        0.5, 0.5, 0, 1,
        0.5, 0.5, 0, 1,
        0.5, 0.5, 0, 1
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
    gl.enable(gl.DEPTH_TEST);
        
    function renderLoop() {
        sinTheta = Math.sin(camera.theta);
        cosTheta = Math.cos(camera.theta);
        sinPhi = Math.sin(camera.phi);
        cosPhi = Math.cos(camera.phi);

        matrix = [
            cosTheta, sinTheta*sinPhi, 0, 0,
            -sinTheta, cosTheta*sinPhi, cosPhi, 0,
            0, cosPhi, -sinPhi, 0,
            0, 0, 0, 1
        ];

        drawGraph(gl, programInfo, buffers, matrix);
        requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
}

function drawGraph(gl, programInfo, buffers, matrix) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(programInfo.program);

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    var size = 3;
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

    var count = 15;
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
            camera.theta += 3*(event.clientX - prevMouse.x) / canvas.width;
            camera.phi += 3*(event.clientY - prevMouse.y) / canvas.height;
            camera.theta %= 2*Math.PI;
            camera.phi = clamp(camera.phi, -Math.PI/2, Math.PI/2)
        }
        console.log(camera.theta.toFixed(2), camera.phi.toFixed(2));
    }
    prevMouse.x = event.clientX;
    prevMouse.y = event.clientY;
}

function handleKeys(event) {
    // to be used maybe sometime
}

function clamp(x, min, max) {
    return Math.max(Math.min(x,max),min);
}
