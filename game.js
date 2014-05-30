'use strict';
//window.addEventListener('load',init,false);
var canvas=null,ctx=null;
var x=50,y=50;
var lastPress=null;
var pause=false;
var dir=0;
var myName = null;

var players = [];
var mapa = null;

var KEY_ENTER=13;
var KEY_LEFT=37;
var KEY_UP=38;
var KEY_RIGHT=39;
var KEY_DOWN=40;
var colors=['#0f0','#00f','#ff0','#f00'];

var fondo=new Image();
    fondo.src='targetshoot.png';

var imgPlayer= [];

var player1 = new Image();
player1.src = 'mage.png'; 
imgPlayer.push(player1);
var player2 = new Image();
player2.src = 'mage2.png'; 
imgPlayer.push(player2);

imgPlayer.push(player1);

var lastUpdate=0,FPS=0,frames=0,acumDelta=0;

function init(){
    canvas= document.getElementById('canvas');
    ctx=canvas.getContext('2d');
    run();
}

function run(){
    requestAnimationFrame(run);

    var now=Date.now();
    var deltaTime=(now-lastUpdate)/1000;
    if(deltaTime>1)deltaTime=0;
    lastUpdate=now;
    
    frames++;
    acumDelta+=deltaTime;
    if(acumDelta>1){
        FPS=frames;
        frames=0;
        acumDelta-=1;
    }

    mapa = new circle();

    paint();
}
function act(lastPress){
    if(!pause){
        var valido = true;
        var dir = 0;
        // Change Direction
        switch(lastPress){
            case KEY_UP:
                dir = 1;
            break;
            case KEY_DOWN:
                dir = 2;
            break;
            case KEY_LEFT:
                dir = 3;
            break;
            case KEY_RIGHT:
                dir = 4;
            break;

            default:
                valido = false;

        }
        if(valido){
            //alert('envio de coordenada');
            socket.emit('cambio de coordenada', {nombre: myName, direction: dir}, function(data){
                if(data != false){  
                    players = data;    
                }else{
                    alert('se devolvio falso');
                }
            });
        }
    }
    // Pause/Unpause
    
    if(lastPress==KEY_ENTER){
        pause=!pause;
        lastPress=null;
    }
}

function paint(){
    //alert('pinatndo');
    //ctx.fillStyle='#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    mapa.drawImageArea(ctx,fondo);


    for(var i=0;i<players.length;i++){
        //ctx.fillStyle='#0f0';
        ctx.fillStyle=colors[i%4];
        //ctx.fillRect(players[i].x,players[i].y,players[i].width,players[i].height);
        ctx.drawImage(imgPlayer[i%2],185,110,92,86, players[i].x, players[i].y,60,60);
        //players[i].fill(ctx);
        ctx.fillStyle='#fff';
        ctx.fillText(players[i].nombre+'',players[i].x,players[i].y-2);
    }
    if(pause){
        ctx.fillText('PAUSE',canvas.width/2,canvas.height/2);
    }
    ctx.fillStyle='#fff';
    ctx.fillText('FPS: '+FPS,10,10);
}

document.addEventListener('keydown',function(evt){
    lastPress=evt.keyCode;
    act(evt.keyCode);
},false);
window.requestAnimationFrame=(function(){
    return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    function(callback){window.setTimeout(callback,17);};
})();

function circle(){
        this.x=50;
        this.y=50;
        this.radius=20;
    }
        
    circle.prototype.stroke=function(ctx){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
        ctx.stroke();
    }

    circle.prototype.drawImageArea=function(ctx,img,sx,sy,sw,sh){
        if(img.width)
            //ctx.drawImage(img,sx,sy,sw,sh,this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2);
            ctx.drawImage(img, 0, 0);
        else
            this.stroke(ctx);
    }
