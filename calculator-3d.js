const canvas = document.getElementById('viewport');
var camera = {
    theta: 0,
    phi: Math.PI/4
};
var prevMouse = {
    x: null,
    y: null
};
var mouseDown = false;
const polyCount = 200;

main();

function main() {
    var gl = canvas.getContext('webgl');
    if(!gl) {
        alert('WebGL unsupported!');
        return;
    }
    
    canvas.width = 720;
    canvas.height = 720;

    document.onpointermove = handleMouse;
    document.onpointerdown = function(event) {mouseDown = (event.target == canvas);};
    document.onpointerup = function() {mouseDown = false;};
    document.onkeydown = handleKeys;


    var vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    uniform mat4 u_matrix;
    varying vec4 v_color;

    vec3 light = vec3(1, 0, 1);
    vec3 normal(in vec4 position) {
        return vec3(-0.3*cos(11.0*position.x)*sin(8.0*position.y), -0.3*sin(11.0*position.x)*cos(8.0*position.y), 1) / sqrt(pow(0.3*cos(11.0*position.x)*sin(8.0*position.y),2.0) + pow(0.3*sin(11.0*position.x)*cos(8.0*position.y),2.0) + 1.0);
    }

    void main() {
        gl_Position = u_matrix * a_position;
        v_color = a_color * dot(normal(a_position), light);
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
    
    var delta = 2 / polyCount;
    function f(x, y) {
        return 0.3*Math.sin(11*x)*Math.sin(8*y);
    }
    function pushVertex(x, y) {
        positions.push(
            x, y, f(x, y),
            x + delta, y, f(x + delta, y),
            x + delta, y + delta, f(x + delta, y + delta),
            x, y, f(x, y),
            x, y + delta, f(x, y + delta),
            x + delta, y + delta, f(x + delta, y + delta)
        );
        colors.push(
            /*0, (x+1)/2, (y+1)/2, 1,
            0, (x+delta+1)/2, (y+1)/2, 1,
            0, (x+delta+1)/2, (y+delta+1)/2, 1,
            0, (x+1)/2, (y+1)/2, 1,
            0, (x+1)/2, (y+delta+1)/2, 1,
            0, (x+delta+1)/2, (y+delta+1)/2, 1*/
            0, 0.5, 1, 1,
            0, 0.5, 1, 1,
            0, 0.5, 1, 1,
            0, 0.5, 1, 1,
            0, 0.5, 1, 1,
            0, 0.5, 1, 1
        );
    }
    var positions = [];
    var colors = [];
    for(i = -1; i < 1; i += delta) {
        for(j = -1; j < 1; j += delta) {
            pushVertex(i, j);
        }
    }
    // points below previously used for testing
    /*var positions = [
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
        -0.3, 0, 0.3,
        0, 0, 0,
        0, -0.3, 0.3,
        -0.3, 0, 0.3,
        0.5, 0, 0,
        -0.5, 0, 0,
        0, 0, 0.5
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
        0.5, 0.5, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        0, 0, 1, 1,
        0, 0, 1, 1,
        0, 0, 1, 1
    ];*/
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
        // trig values to be used in the rotation matrix
        sinTheta = Math.sin(camera.theta);
        cosTheta = Math.cos(camera.theta);
        sinPhi = Math.sin(camera.phi);
        cosPhi = Math.cos(camera.phi);

        // 3-dimensional rotation matrix
        matrix = [
            cosTheta, sinTheta*sinPhi, sinTheta*cosPhi, sinTheta*cosPhi/2,
            -sinTheta, cosTheta*sinPhi, cosTheta*cosPhi, cosTheta*cosPhi/2,
            0, cosPhi, -sinPhi, -sinPhi/2,
            0, 0, 0, 2
        ];

        drawGraph(gl, programInfo, buffers, matrix);
        // repeatedly renders the scene
        requestAnimationFrame(renderLoop);
    }
    // render for the first time
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

    var count = Math.pow(polyCount, 2) * 6;
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
            camera.theta += 4*(event.clientX - prevMouse.x) / canvas.width;
            camera.phi += 4*(event.clientY - prevMouse.y) / canvas.height;
            camera.theta %= 2*Math.PI;
            camera.phi = clamp(camera.phi, -Math.PI/2, Math.PI/2)
        }
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
