'use strict';
//window.addEventListener('load',init,false);
var canvas = null, ctx = null;
var x = 50, y = 50;
var lastPress = null;
var pause = false;
var myName = null;

var players = [];

var KEY_ENTER = 13;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var colors = ['#0f0', '#00f', '#ff0', '#f00'];

var imgPlayer = [];

var mapaPixel;
var fondo = new Image();
fondo.src = 'img/targetshoot2.png';
var player1 = new Image();
player1.src = 'img/player1.png';
imgPlayer.push(player1);
var player2 = new Image();
player2.src = 'img/player2.png';
imgPlayer.push(player2);
imgPlayer.push(player1);

var lapida = new Image(); lapida.src = 'img/lapida.png';


var lastUpdate = 0, FPS = 0, frames = 0, acumDelta = 0;

var mousex = 0, mousey = 0, enPosicionDeseada = true;

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    run();    
    iniciarEscuchas();
    mapaPixel = ctx.getImageData(0,0,canvas.width,canvas.height);    
}

function run() {
    requestAnimationFrame(run);

    var now = Date.now();
    var deltaTime = (now - lastUpdate) / 1000;
    if (deltaTime > 1)
        deltaTime = 0;
    lastUpdate = now;

    frames++;
    acumDelta += deltaTime;
    if (acumDelta > 1) {
        FPS = frames;
        frames = 0;
        acumDelta -= 1;
    }

    paint();
    if (!enPosicionDeseada) {
        act();
    }
}
function act() {
    x = mousex;
    y = mousey;
    var indiceJugador;
    
    if (x < 0)
        x = 0;
    if (x > canvas.width)
        x = canvas.width;
    if (y < 0)
        y = 0;
    if (y > canvas.height)
        y = canvas.height;

     for (var i = 0; i < players.length; i++) {
         if(myName === players[i].nombre){
             indiceJugador = i;
             break;
         }
     }
    var IndicePixel =  4 * ((players[i].x - 20) + (players[i].y + 60) * canvas.width); 
    
    if (    mapaPixel.data[IndicePixel] === 63 && 
            mapaPixel.data[IndicePixel +1] === 0  &&
            mapaPixel.data[IndicePixel +2] === 0 && 
            players[indiceJugador].vida === true) {
                
            socket.emit('lo pelaron', {index: indiceJugador});    
    }
    if(players[indiceJugador].vida) {
        socket.emit('cambio de coordenada', {nombre: myName, dirx: x - 30, diry: y - 60}, function(data, pos) {
            if (data !== false) {
                players = data;
                if (pos) {
                    enPosicionDeseada = true;
                }
            } else {
                alert('se devolvio falso');
            }
        });
    }
}

function paint() {
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawImageArea(ctx, fondo);

    for (var i = 0; i < players.length; i++) {
        //ctx.fillStyle='#0f0';
        ctx.fillStyle = colors[i % 4];
        
        if(players[i].vida){
            ctx.drawImage(imgPlayer[i % 2], 128, 7, 92, 90, players[i].x, players[i].y, 60, 60);
        }else{      
            ctx.drawImage(lapida, 0, 0,130 ,230 , players[i].x, players[i].y, 60, 60);
//            ctx.fillStyle = 'red';
//            ctx.fillRect(players[i].x,  players[i].y, 30, 30);            
        }
        
        ctx.fillStyle = '#fff';
        ctx.fillText(players[i].nombre + '', players[i].x, players[i].y - 2);
    }
    ctx.fillStyle = '#fff';
    ctx.fillText('FPS: ' + FPS, 10, 10);
}

function iniciarEscuchas()
{
    document.addEventListener('click', function(evt) {
        mousex = evt.pageX - canvas.offsetLeft;
        mousey = evt.pageY - canvas.offsetTop;
        enPosicionDeseada = false;
        act();
    }, false);

    document.addEventListener('keydown', function(evt) {
        lastPress = evt.keyCode;
        act(evt.keyCode);
    }, false);
    window.requestAnimationFrame = (function() {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function(callback) {
                    window.setTimeout(callback, 17);
                };
    })();
}


//function circle(){
//        this.x=50;
//        this.y=50;
//        this.radius=20;
//    
//        
//    this.stroke=function(ctx){
//        ctx.beginPath();
//        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
//        ctx.stroke();
//    }
//
this.drawImageArea = function(ctx, img, sx, sy, sw, sh) {
    if (img.width)
        //ctx.drawImage(img,sx,sy,sw,sh,this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2);
        ctx.drawImage(img, 0, 0);
    else
        this.stroke(ctx);
}
//}