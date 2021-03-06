'use strict';
//window.addEventListener('load',init,false);
var canvas = null, ctx = null;
var x = 50, y = 50;
var lastPress = null;
var pause = false;
var myName = null;

var x_old = 0;
var y_old = 0;
var dir = 0;
var cambio = false;

var players = [];
var balas = [];

var KEY_ENTER = 13;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var colors = ['#0f0', '#00f', '#ff0', '#f00'];

var ESPACE = 32;
var presionando = false;
var Mmousex = 0;
var Mmousey = 0;
var disparo = false;
var xbala = 0;
var ybala = 0;

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

var lapida = new Image();
lapida.src = 'img/lapida.png';

var apuntador = new Image();
apuntador.src = 'img/targetshoot.png';

var bala = new Image();
bala.src = 'img/bala.png';


var lastUpdate = 0, FPS = 0, frames = 0, acumDelta = 0;

var mousex = 0, mousey = 0, enPosicionDeseada = true;

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    run();
    iniciarEscuchas();
    mapaPixel = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
    if (disparo) {
        actbala();
    }
}

function act() {
    if (!presionando) {
        x = mousex;
        y = mousey;
    }

    var indiceJugador = checkLife();

    if (players[indiceJugador].vida) {
        detOrientation();
        socket.emit('cambio de coordenada', {nombre: myName, dirx: x - 30, diry: y - 60, orientacion: dir}, function(data, pos) {
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

function actbala() {
    console.log("disparanod...");
    
    var myIndex = getIndexPlayer();
    if (presionando && !balas[myIndex].activo) {
        xbala = mousex;
        ybala = mousey;
    }
    
    if (disparo) {
        if (balas != null) {
            if (!balas[myIndex].activo) {
                socket.emit('disparo', {index: myIndex, xActual: players[myIndex].x, yActual: players[myIndex].y, dirx: Mmousex, diry: Mmousey}, function(pos) {
                    if (data !== false) {
                        balas = data;
                        if (pos) {
                            disparo = false;
                        }
                    } else {
                        alert('se devolvio falso');
                    }
                });
            } else {
                socket.emit('disparo', {index: myIndex, xActual: balas[myIndex].x, yActual: balas[myIndex].y, dirx: xbala, diry: ybala}, function(pos) {
                    if (pos) {
                        disparo = false;
                    }
                });
            }
        }
    }
}

function checkLimits() {

    if (x < 0)
        x = 0;
    if (x > canvas.width)
        x = canvas.width;
    if (y < 0)
        y = 0;
    if (y > canvas.height)
        y = canvas.height;
}
function getIndexPlayer() {
    for (var i = 0; i < players.length; i++) {
        if (myName === players[i].nombre) {
            return i;
        } 
    }
}
function checkLife() {
    checkLimits();

    var indiceJugador = getIndexPlayer();

    var IndicePixel = 4 * ((players[indiceJugador].x - 20) + (players[indiceJugador].y + 60) * canvas.width);

    if (mapaPixel.data[IndicePixel] === 63 &&
            mapaPixel.data[IndicePixel + 1] === 0 &&
            mapaPixel.data[IndicePixel + 2] === 0 &&
            players[indiceJugador].vida === true) {

        socket.emit('lo pelaron', {index: indiceJugador});
    }
    return indiceJugador;
}
function detOrientation() {
    if (cambio) {
        //console.log(x_old + "," + y_old + " Vs " + x + "," + y);
        x = mousex;
        y = mousey;
        var ran = 45;
        if (x > x_old) {
            if (y > y_old - ran && y < y_old + ran) {
                //dir = 1; //abajo diagonal derecha
                dir = 3;
            } else if (y < y_old) {
                //dir = 2; //arriba diagonal derecha
                dir = 9;
            } else if (y > y_old) {
                dir = 8; // derecha
            }
        } else if (x < x_old) {
            if (y > y_old - ran && y < y_old + ran) {
                //dir = 1; //abajo diagonal derecha
                dir = 6;
            } else if (y < y_old) {
                //dir = 2; //arriba diagonal derecha
                dir = 9;
            } else if (y > y_old) {
                dir = 8; // derecha
            }
        } else {
            if (y > y_old) {
                dir = 8; //abajo
            } else {
                dir = 9;//arriba
            }
        }

        x_old = x;
        y_old = y;

        cambio = false;
    }
}
function paint() {
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawImageArea(ctx, fondo);
    if (presionando) {
        ctx.drawImage(apuntador, 0, 0, 20, 20, Mmousex - 10, Mmousey - 10, 20, 20);
    }
    for (var i = 0; i < players.length; i++) {
        if (players[i].vida) {
            drawPlayer(players[i], i);
        }
        else {
            ctx.drawImage(lapida, 0, 0, 130, 230, players[i].x, players[i].y, 60, 60);
        }
        ctx.fillStyle = '#fff';
        ctx.fillText(players[i].nombre + '', players[i].x + 2, players[i].y - 2);
    }
    if (balas != null) {
        for (var i = 0; i < balas.length; i++) {
            if (balas[i].activo) {
                ctx.drawImage(bala, 0, 0, 19, 38, balas[i].x, balas[i].y, 60, 60);
            }
        }
    }

    ctx.fillStyle = '#fff';
    ctx.fillText('FPS: ' + FPS, 10, 10);
}

function drawPlayer(player, i) {
    switch (player.orientacion) {
        case 9: //Arriba
            //console.log("arriba");
            ctx.drawImage(imgPlayer[i % 2], 13, 7, 92, 90, player.x, player.y, 60, 60);
            break;
        case 8: //Abajo
            ctx.drawImage(imgPlayer[i % 2], 251, 7, 92, 90, player.x, player.y, 60, 60);
            //console.log("Abajo");
            break;
        case 6: //Izquierda
            ctx.drawImage(imgPlayer[i % 2], 368, 7, 92, 90, player.x, player.y, 60, 60);
            //console.log("Izquierda");
            break;
        case 3:  //Derecha
            ctx.drawImage(imgPlayer[i % 2], 128, 7, 92, 90, player.x, player.y, 60, 60);
            //console.log("Derecha");
            break;
        default:
            //console.log("default");
            ctx.drawImage(imgPlayer[i % 2], 251, 7, 92, 90, player.x, player.y, 60, 60);
    }
}
function iniciarEscuchas()
{
    canvas.addEventListener('click', function(evt) {
        mousex = evt.pageX - canvas.offsetLeft;
        mousey = evt.pageY - canvas.offsetTop;
        if (!presionando) {
            enPosicionDeseada = false;
            cambio = true;
            act();
        } else {
            if (!disparo) {
                disparo = true;
                actbala();
            }
        }
    }, false);

    document.addEventListener('keydown', function(evt) {
        lastPress = evt.keyCode;
        if (lastPress === ESPACE) {
            presionando = true;
            document.addEventListener('mousemove', function(evt) {
                Mmousex = evt.pageX - canvas.offsetLeft;
                Mmousey = evt.pageY - canvas.offsetTop;
            }, false);
        }
    }, false);
    document.addEventListener('keyup', function(evt) {
        lastPress = evt.keyCode;
        if (lastPress === ESPACE) {
            presionando = false;
            document.removeEventListener('mousemove', function(evt) {
            }, false);
        }
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