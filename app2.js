var running = 0;
var pause =0;
function start_game(){
	running=1;
}
function pause_game(){
	pause=1-pause;
}



var canvas = document.getElementById('mycanvas');
var gl = canvas.getContext('experimental-webgl');

/*============ Defining and storing the geometry =========*/

var vertices = [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1,
    1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
];

var colors = [
    5, 3, 7, 5, 3, 7, 5, 3, 7, 5, 3, 7,
    1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
];

var indices = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
];

// Create and store data into vertex buffer
var size = 50;
var vertex_buffer = new Array(size);
var rndInt_x = new Array(size);
var rndInt_y = new Array(size);

var character_vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, character_vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

for (var i = 0; i <= size; i++) {
    vertex_buffer[i] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer[i]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    rndInt_x[i] = Math.floor(Math.random() * 40) - 20;
    rndInt_y[i] = Math.floor(Math.random() * 40) - 20;
}


// Create and store data into color buffer
var color_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

// Create and store data into index buffer
var index_buffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

/*=================== Shaders =========================*/

var vertCode = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'attribute vec3 color;' + //the color of the point
    'varying vec3 vColor;' +
    'uniform vec4 translation;' +

    'void main(void) { ' + //pre-built function
    'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.) + translation;' +
    'vColor = color;' +
    '}';

var fragCode = 'precision mediump float;' +
    'varying vec3 vColor;' +
    'void main(void) {' +
    'gl_FragColor = vec4(vColor, 1.);' +
    '}';

var vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);

var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);

var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertShader);
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);

/* ====== Associating attributes to vertex shader =====*/
var Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
var Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
var Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");



gl.bindBuffer(gl.ARRAY_BUFFER, character_vertex_buffer);
var position = gl.getAttribLocation(shaderProgram, "position");
gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);

for (var j = 0; j <= size; j++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer[j]);
    var positions = gl.getAttribLocation(shaderProgram, "position");
    gl.vertexAttribPointer(positions, 3, gl.FLOAT, false, 0, 0);
}

// Position
gl.enableVertexAttribArray(position);
gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
var color = gl.getAttribLocation(shaderProgram, "color");
gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

// Color
gl.enableVertexAttribArray(color);
gl.useProgram(shaderProgram);

/*==================== MATRIX =====================*/

function get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180); //angle*.5
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}



var proj_matrix_character = get_projection(40, canvas.width / canvas.height, 1, 100);
var mov_matrix_character = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var view_matrix_character = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
// translating z
view_matrix_character[14] = view_matrix_character[14] - 12; //zoom

var proj_matrix = new Array(size);
var mov_matrix = new Array(size);
var view_matrix = new Array(size);


for (var q = 0; q <= size; q++) {
    proj_matrix[q] = get_projection(40, canvas.width / canvas.height, 1, 100);

    mov_matrix[q] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    view_matrix[q] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    // translating z
    view_matrix[q][14] = (view_matrix[q][14] - 20 - 20 * q) - 60 ; //zoom

}


/*==================== Rotation ====================*/

function rotateZ(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0],
        mv4 = m[4],
        mv8 = m[8];

    m[0] = c * m[0] - s * m[1];
    m[4] = c * m[4] - s * m[5];
    m[8] = c * m[8] - s * m[9];

    m[1] = c * m[1] + s * mv0;
    m[5] = c * m[5] + s * mv4;
    m[9] = c * m[9] + s * mv8;
}

function rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1],
        mv5 = m[5],
        mv9 = m[9];

    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}

function rotateY(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0],
        mv4 = m[4],
        mv8 = m[8];

    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}

/*================= Drawing ===========================*/
//var time_old = 0;
var x = 10;
var y = 10;
var z = 0;
var Tx = 0,
    Ty = 0,
    Tz = -1;

var current_x = 0;
var current_y = 0;
var current_z = 0;

var x2 = 60;
var y2 = 70;
var z2 = 80;

var current_x2 = 0;
var current_y2 = 0;
var current_z2 = 0;

var distance = 0;
var distance_increase = 0.2
var start_distance = 20;
var animate = function() {
    
    if (pause ==1){
    }else if (running == 1){
    	distance += distance_increase;
    }else{
	start_distance=20;
	distance=0;
	Tx=0;
	Ty=0;
    }	
    x = x;
    y = y;
    z = z;



    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1.0);

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var rotation_speed = 0.01;
    if (distance > 60 + 5 * size) {
        //distance=0;
        start_distance = 0;
        distance_increase += 0.0000005;
    }


    rotateZ(mov_matrix_character, z - current_z); //time
    rotateY(mov_matrix_character, y - current_y);
    rotateX(mov_matrix_character, x - current_x);

    current_x = x;
    current_y = y;
    current_z = z;

    /* ==========translation======================================*/
    if( running ==1 || pause ==1){
	Tx += 0.01 * current_y;
        Ty += 0.01 * current_x;
        Tz = -1;
    }
    var translation = gl.getUniformLocation(shaderProgram, 'translation');
    gl.uniform4f(translation, Tx, Ty, Tz, 0.0);

    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix_character);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix_character);
    gl.uniformMatrix4fv(Mmatrix, false, mov_matrix_character);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);



    Number.prototype.mod = function(b) {
        // Calculate
        return ((this % b) + b) % b;
    }

    for (var i = 0; i <= size; i++) {
        y2 = (y2 + rotation_speed);
        x2 = (x2 + rotation_speed);
        z2 = (z2 + rotation_speed);

        view_matrix[i] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var g = (-start_distance - (5 * i) + distance)
        view_matrix[i][14] = view_matrix[i][14] + g.mod(-start_distance - (5 * size)); //zoom



        //rotateZ(mov_matrix[i], z2 - current_z2); //time
        //rotateY(mov_matrix[i], y2 - current_y2);
        //rotateX(mov_matrix[i], x2 - current_x2);

        current_x2 = x2;
        current_y2 = y2;
        current_z2 = z2;

        /* ==========translation======================================*/
        var Txs = rndInt_x[i],
            Tys = rndInt_y[i],
            Tzs = -1;
        var translations = gl.getUniformLocation(shaderProgram, 'translation');
        gl.uniform4f(translations, Txs, Tys, Tzs, 0.0);

        gl.uniformMatrix4fv(Pmatrix, false, proj_matrix[i]);
        gl.uniformMatrix4fv(Vmatrix, false, view_matrix[i]);
        gl.uniformMatrix4fv(Mmatrix, false, mov_matrix[i]);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        var offset = 5;
        if (view_matrix[i][14] < -8 && view_matrix[i][14] > -12) {
            if ((Txs > Tx && Txs > Tx + offset  ||Txs > Tx - offset && Txs < Tx )&&
		(Tys > Ty && Tys > Ty + offset  ||Tys > Ty - offset && Tys < Ty )
			) {
                console.log("collision");
		if (running == 1){
			alert(" game over");
		}
		running=0;
            }
        }
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(animate);


}
animate();
