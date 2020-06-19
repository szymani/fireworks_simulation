var gl;
var colorUniformLocation;
var startPos = {x:0, y:0};
var endPos = {x:0, y:0};
var isDrawing = false;
var fireworks = new Array();
var fireworks2 = new Array();
var shards = new Array();
var globalMinVel = 0.1;
var globalMaxVel = 0.3;
var limits = [50,50,50];
var automaticActive = false;
var timer = 0;
var vSpeed;
var vTime;
var vInitPos;
var linePos;
var bufferId;
var bufferPos;
var bufferSpeed;
var bufferTime;
var programPoint;
var programLine;

function getRelativeMousePosition(event, target) {
    target = target || event.target;
    var rect = target.getBoundingClientRect();
  
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
}
function getMousePos(canvas, ev){
    var pos = getRelativeMousePosition(ev, canvas);
    const x = pos.x/ gl.canvas.width  *  2 - 1;
    const y = pos.y / gl.canvas.height * -2 + 1;
    return{
        x: x,
        y: y,
    }
}
function getDistance(x1,y1,x2,y2){
    var xDistance = x1 - x2,
    yDistance = y1 - y2;
    return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
}
function getAngle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx);
    return theta;
}
function calcCurrentLocation(x, y, time, vx,vy){
    posx = x + vx*time*0.03;
    posy = y + vy*time*0.03 - 0.5*0.0001*time*time;
    return [posx,posy];
}
function createNewFirework(stage,index,autmatic=false){
    if(stage == 1){
        if(autmatic){
            var x = random(-0.5,0.5),
            y = random(-0.5,-0.3),
            v = random(globalMinVel*3 ,globalMaxVel*2 );
            if(x<-0.3)
                ang = random(0.3,1);  
            else if (x>0.3)
                ang = random(1.8,2.3);  
            else
                ang = random(1,2);  
            this.fireworks.push(new Firework(x,y,v,ang,1,timer,Math.random(), Math.random(), Math.random()));
        }
        else{
            var x = startPos.x,
            y = startPos.y,
            v = getDistance(startPos.x,startPos.y,endPos.x,endPos.y);
            ang = getAngle(startPos.x,startPos.y,endPos.x,endPos.y);
            this.fireworks.push(new Firework(x,y,v,ang,1,timer,Math.random(), Math.random(), Math.random()));
        }
    }
    else if(stage == 2){
        var result =  calcCurrentLocation(fireworks[index].xpos,fireworks[index].ypos,fireworks[index].movingTime,
                                            fireworks[index].vX,fireworks[index].vY);
        this.fireworks2.push(new Firework(
            result[0],result[1],
            random(globalMinVel*0.5,globalMaxVel*0.3),
            random(0,Math.PI*2),stage,
            timer,
            fireworks[index].rgb[0],
            fireworks[index].rgb[1],
            fireworks[index].rgb[2]));
    }else{
        var result =  calcCurrentLocation(fireworks2[index].xpos,fireworks2[index].ypos,fireworks2[index].movingTime,
            fireworks2[index].vX,fireworks2[index].vY);
        this.shards.push(new Firework(
        result[0],result[1],
        random(globalMinVel,globalMaxVel),
        random(0,Math.PI*2),stage,
        timer,fireworks2[index].rgb[0],
        fireworks2[index].rgb[1],
        fireworks2[index].rgb[2]));
    }
}
function keyUpHandler(){
    if(event.keyCode == 32){
        if(automaticActive){
            automaticActive = false;
        }
        else{
            automaticActive = true;
        }
    }
}


window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    
    canvas.onmousedown = function(event){
        isDrawing = true;
        startPos = getMousePos(canvas, event);
        endPos = startPos;
    }
    canvas.onmouseup = function(event){
        endPos = getMousePos(canvas, event);
        createNewFirework(1,0);
        isDrawing = false;
    } 
    canvas.onmousemove = function(event){
        if(isDrawing){
            endPos = getMousePos(canvas, event);
        }
    }
    document.addEventListener('keyup', keyUpHandler, false);

    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }

    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);
    
    // Load shaders and initialize attribute buffers
    programPoint = initShaders(gl, "vertex-shader", "fragment-shader");
    programLine = initShaders(gl, "vertex-shader-line", "fragment-shader-line");
    gl.useProgram(programPoint);

    // Associate our shader variables with our data buffer
    colorUniformLocation = gl.getUniformLocation(programPoint, "var_color");

    bufferId = gl.createBuffer();
    bufferPos = gl.createBuffer();
    bufferTime = gl.createBuffer();
    bufferSpeed = gl.createBuffer();

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    if(isDrawing){
        drawLine(startPos.x,startPos.y,endPos.x,endPos.y);
        drawPoint(startPos.x,startPos.y,0,0,1,0.5,0.5,timer);
    }
    handleAutomatic();
    drawAllFireworks();

    timer+=1;
    requestAnimFrame(render); 
}

function handleAutomatic(){
    if(automaticActive){
        if(timer%200  == 0){
            console.log("Random firework created");
            createNewFirework(1,0,true);
            // console.log("Random firework created");
 
        }
    }
}

function drawAllFireworks(){
    if(fireworks.length > limits[2]){
        var diff = fireworks.length - limits[2];
        //console.log("Fireworks number exceeded limit");
        for(i =0; i<diff;i++){
            fireworks.shift();    //Remove shard  
        }
    }
    for (const index in fireworks) {
        if(fireworks[index].ifFinish(timer)){
            for(i=0;i<random(30,50);i++){           //How many 2level fireworks are created
                createNewFirework(2,index);
            }
            fireworks.splice(index, 1);     //Remove firework
        }
        else{
            drawPoint(fireworks[index].xpos,fireworks[index].ypos,fireworks[index].vX,fireworks[index].vY,
                fireworks[index].rgb[0],fireworks[index].rgb[1],fireworks[index].rgb[2],fireworks[index].time);
        }
    }
    if(fireworks2.length > limits[2]){
        var diff = fireworks2.length - limits[2];
        //console.log("Fireworks stage two number exceeded limit");
        for(i =0; i<diff;i++){
            fireworks2.shift();    //Remove shard  
        }
    }
    for (const index in fireworks2) { 
        if(fireworks2[index].ifFinish(timer)){
            for(i=0;i<random(10,250);i++){              //How many 3level fireworks are created
                createNewFirework(3,index);
            }
            fireworks2.splice(index, 1);     //Remove firework stage 2
        }
        else
            drawPoint(fireworks2[index].xpos,fireworks2[index].ypos,fireworks2[index].vX,fireworks2[index].vY,
                fireworks2[index].rgb[0],fireworks2[index].rgb[1],fireworks2[index].rgb[2],fireworks2[index].time);
    }
    if(shards.length > limits[2]){
        var diff = shards.length - limits[2];
        //console.log("Shards number exceeded limit");
        for(i =0; i<diff;i++){
            shards.shift();    //Remove shard  
        }
    }
    for (const index in shards) {
        if(shards[index].ifFinish(timer)){
            shards.splice(index, 1);     //Remove shard
        }
        else{
            drawPoint(shards[index].xpos,shards[index].ypos,shards[index].vX,shards[index].vY,
                shards[index].rgb[0],shards[index].rgb[1],shards[index].rgb[2],shards[index].time);         
        }
    }
    // var total = shards.length + fireworks2.length + fireworks.length;
    // var lim = limits[0]+limits[1]+limits[2];
    // console.log("Total number of elements: " + total + "/" + lim);
}

function drawLine(x1,y1,x2,y2){ 
    gl.useProgram(programLine);
    gl.lineWidth(2);
    linePos = gl.getAttribLocation(programLine, "vPosition");
    gl.enableVertexAttribArray(linePos);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y2,
     ]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.linePos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, 2);
}
function drawPoint(x,y,vx,vy,r,g,b,t){
    
    gl.useProgram(programPoint);
    gl.uniform4f(colorUniformLocation, r,g,b, 1);

    vInitPos = gl.getAttribLocation(programPoint, "initPos");
    gl.enableVertexAttribArray(this.vInitPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x,y,0,1,
     ]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.vInitPos, 4, gl.FLOAT, false, 0, 0);

    vTime = gl.getAttribLocation(programPoint, "time");
    gl.enableVertexAttribArray(this.vTime);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTime);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        timer - t,
     ]), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(this.vTime, 1, gl.FLOAT, false, 0, 0);

    vSpeed = gl.getAttribLocation(programPoint, "speed");
    gl.enableVertexAttribArray(this.bufferSpeed);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferSpeed);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        vx,vy,0,0,
     ]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.vSpeed, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, 1);
}
function random( min, max ) {
	return Math.random() * ( max - min ) + min;
}

