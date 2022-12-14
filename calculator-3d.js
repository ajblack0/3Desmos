const canvas = document.getElementById('graph-viewport');
var canvasSize = canvas.getBoundingClientRect();
var camera = {
    theta: 0,
    phi: Math.PI/4
};
var zoom = {
    x: 1,
    y: 1,
    z: 1,
    set: function(scalar) {
        zoom.x *= scalar;
        zoom.y *= scalar;
        zoom.z *= scalar;
    }
}
var prevMouse = {
    x: null,
    y: null
};
var mouseDown = false;
const polyCount = 200;

main();

function main() {
    const gl = canvas.getContext('webgl');
    if(!gl) {
        alert('WebGL not supported.');
        return;
    }
    const ext = gl.getExtension('OES_element_index_uint');
    if(!ext) {
        alert('32-bit indices not supported.');
    }

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    var aspectRatio = canvasSize.width / canvasSize.height;

    document.onpointermove = handleMouse;
    document.onpointerdown = function(event) {mouseDown = (event.target == canvas);};
    document.onpointerup = function() {mouseDown = false; prevMouse.x = null;};
    document.onkeydown = handleKeys;
    window.onresize = function() {
        canvasSize = canvas.getBoundingClientRect();
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        aspectRatio = canvas.width / canvas.height;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    };
    canvas.onwheel = initGraph;
    


    const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    attribute vec3 a_normal;
    uniform mat4 u_matrix;
    
    varying vec4 v_color;
    varying vec3 v_normal;

    mat4 perspective = mat4(vec4(1.0, 0.0, 0.0, 0.0),
                            vec4(0.0, 1.0, 0.0, 0.0),
                            vec4(0.0, 0.0, 0.4, 0.4),
                            vec4(0.0, 0.0, 0.0, 1.5));
    

    void main() {
        gl_Position = perspective * u_matrix * a_position;
        v_color = a_color;
        v_normal = mat3(u_matrix) * normalize(a_normal);
    }
    `;
    const fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_color;
    varying vec3 v_normal;

    vec3 light = normalize(vec3(0.2, 0.3, -1.0));

    void main() {
        gl_FragColor = vec4(v_color.rgb * (0.6+0.4*dot((2.0*float(gl_FrontFacing)-1.0)*v_normal, light)), v_color.a);
    }
    `;

    var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = createProgram(gl, vertexShader, fragmentShader);
    
    var programInfo = {
        program: program,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(program, 'a_position'),
            vertexColor: gl.getAttribLocation(program, 'a_color'),
            vertexNormal: gl.getAttribLocation(program, 'a_normal')
        },
        uniformLocations: {
            matrix: gl.getUniformLocation(program, 'u_matrix')
        }
    };

    var positions = [];
    var colors = [];
    var normals = [];
    var indices = [];
    var matrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
    
    function f(x, y) {
        return 0.3*Math.sin(11*x)*Math.sin(8*y);
    }
    function dfdx(x, y) {
        if(isNaN(f(x + 0.0000001, y))) {
            return (f(x, y) - f(x - 0.0000001, y)) / 0.0000001;
        }
        return (f(x + 0.0000001, y) - f(x, y)) / 0.0000001;
    }
    function dfdy(x, y) {
        if(isNaN(f(x, y + 0.0000001))) {
            return (f(x, y) - f(x, y - 0.0000001)) / 0.0000001;
        }
        return (f(x, y + 0.0000001) - f(x, y)) / 0.0000001;
    }
    function pushVertex(x, y) {
        positions.push(x / zoom.x, y / zoom.y, f(x, y) / zoom.z);
        colors.push(0, 0.7, 1, 1);
        normals.push(-zoom.x*dfdx(x, y), -zoom.y*dfdy(x, y), zoom.z);
    }
    function pushIndex(i, j) {
        var index = i*(polyCount+1) + j;
        indices.push(
            index,
            index + polyCount + 1,
            index + 1,
            index + polyCount + 1,
            index + polyCount + 2,
            index + 1
        );
    }
    
    var buffers;
    function initGraph(event) {
        positions = [];
        colors = [];
        normals = [];
        indices = [];
        if(event) {
            zoom.set(1 + event.deltaY / 2000);
        }

        var deltax = 2*zoom.x / polyCount;
        var deltay = 2*zoom.y / polyCount;
        for(i = 0; i <= polyCount; i++) {
            for(j = 0; j <= polyCount; j++) {
                pushVertex(i*deltax - zoom.x, j*deltay - zoom.y);
                if(j < polyCount) {
                    pushIndex(i, j);
                }
            }
        }
        buffers = {
            position: gl.createBuffer(),
            color: gl.createBuffer(),
            normal: gl.createBuffer(),
            index: gl.createBuffer()
        };
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
    }
    initGraph();

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
        
    function renderLoop() {
        sinTheta = Math.sin(camera.theta);
        cosTheta = Math.cos(camera.theta);
        sinPhi = Math.sin(camera.phi);
        cosPhi = Math.cos(camera.phi);

        matrix = [
            cosTheta / aspectRatio, sinTheta*sinPhi, sinTheta*cosPhi, 0,
            -sinTheta / aspectRatio, cosTheta*sinPhi, cosTheta*cosPhi, 0,
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

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, size, type, normalize, stride, offset);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);

    gl.uniformMatrix4fv(programInfo.uniformLocations.matrix, false, matrix);

    var count = polyCount*polyCount*6;
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, offset);
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
        prevMouse.x = event.clientX;
        prevMouse.y = event.clientY;
    }
}

function handleKeys(event) {
    // to be used maybe sometime
}

function clamp(x, min, max) {
    return Math.max(Math.min(x,max),min);
}
