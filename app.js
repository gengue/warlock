
var express = require('express'),
        app = express(),
        server = require('http').createServer(app),
        io = require('socket.io').listen(server),
        jugadores = [];
balas = [];

var port = Number(process.env.PORT || 5000);



server.listen(port);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});
app.get('/js/game.js', function(req, res) {
    res.sendfile(__dirname + '/js/game.js');
});
app.get('/js/forms.js', function(req, res) {
    res.sendfile(__dirname + '/js/forms.js');
});
app.get('/css/index.css', function(req, res) {
    res.sendfile(__dirname + '/css/index.css');
});
app.get('/img/targetshoot2.png', function(req, res) {
    res.sendfile(__dirname + '/img/targetshoot2.png');
});
app.get('/img/player1.png', function(req, res) {
    res.sendfile(__dirname + '/img/player1.png');
});
app.get('/img/player2.png', function(req, res) {
    res.sendfile(__dirname + '/img/player2.png');
});
app.get('/img/lapida.png', function(req, res) {
    res.sendfile(__dirname + '/img/lapida.png');
});
app.get('/img/logo3bolas.png', function(req, res) {
    res.sendfile(__dirname + '/img/logo3bolas.png');
});
app.get('/img/targetshoot.png', function(req, res) {
    res.sendfile(__dirname + '/img/targetshoot.png');
});
app.get('/img/bala.png', function(req, res) {
    res.sendfile(__dirname + '/img/bala.png');
});

io.sockets.on('connection', function(socket) {
    //**FUNCION PARA NUEVO USUARIO**///
    socket.on('nuevo usuario', function(data, callback) {
        encontrado = false;
        for (var i = 0; i < jugadores.length; i++) {

            if (jugadores[i].nombre === data)
                encontrado = true;
        }
        if (encontrado || data === "") {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            jugadores.push(new Rectangle(socket.nickname));
            balas.push(new bala(0, 0));
            actualizarJugadores();
            actualizarBalas();
        }
    });
    //**FUNCION PARA CAMBIO DE COORDENADAS JUGADOR**///
    socket.on('cambio de coordenada', function(data, callback) {
        encontrado = false;
        var destx = false, desty = false;
        for (var i = 0; i < jugadores.length; i++) {
            //console.log('************'+data.nombre);
            if (jugadores[i].nombre === data.nombre) {

                encontrado = true;
                rango = 2;
                if (jugadores[i].x === data.dirx || jugadores[i].x === data.dirx + 1 || jugadores[i].x === data.dirx - 1) {
                    destx = true;
                }
                else {
                    if (jugadores[i].x > data.dirx) {
                        jugadores[i].x -= rango;
                    }
                    if (jugadores[i].x < data.dirx) {
                        jugadores[i].x += rango;
                    }
                }
                if (jugadores[i].y === data.diry || jugadores[i].y === data.diry + 1 || jugadores[i].y === data.diry - 1) {
                    desty = true;
                } else {
                    if (jugadores[i].y > data.diry) {
                        jugadores[i].y -= rango;
                    }
                    if (jugadores[i].y < data.diry) {
                        jugadores[i].y += rango;
                    }
                }
                jugadores[i].orientacion = data.orientacion;
            }

        }
        if (!encontrado) {
            callback(false);
        } else {
            if (destx && desty)
                callback(jugadores, true);
            actualizarJugadores();
        }
    });

    socket.on('disparo', function(data, callback) {
        var destx = false, desty = false;
        balas[data.index].x = data.xActual;
        balas[data.index].y = data.yActual;
        balas[data.index].activo = true;
        
        rango = 4;
        if (balas[data.index].x >= data.dirx - 3 && balas[data.index].x <= data.dirx + 3 ) {
            destx = true;
        }
        else {
            if (balas[data.index].x > data.dirx) {
                balas[data.index].x -= rango;
            }
            if (balas[data.index].x < data.dirx) {
                balas[data.index].x += rango;
            }
        }
        if (balas[data.index].y >= data.diry - 3 && balas[data.index].y <= data.diry + 3 ) {
            desty = true;
        } else {
            if (balas[data.index].y > data.diry) {
                balas[data.index].y -= rango;
            }
            if (balas[data.index].y < data.diry) {
                balas[data.index].y += rango;
            }
        }
        if (destx && desty){
            callback(true);
            balas[data.index].activo = false;
        }
            
        
        actualizarBalas();

    });
    function actualizarBalas(){
        io.sockets.volatile.emit('balas', balas);
    }
    function actualizarJugadores() {
        io.sockets.volatile.emit('usuarios', jugadores);
    }

    socket.on('lo pelaron', function(data) {
        jugadores[data.index].vida = false;
        actualizarJugadores();
    });

    //**FUNCION PARA ENVIAR UN MENSAJE**///
    socket.on('enviar mensaje', function(data) {
        io.sockets.emit('nuevo mensaje', {msg: data, nick: socket.nickname});
    });
    //**FUNCION PARA DESCONECTAR EL JUEGO**///
    socket.on('disconnect', function(data) {
        if (!socket.nickname) {
            return;
        }

        for (var i = 0; i < jugadores.length; i++) {

            if (jugadores[i].nombre === socket.nickname) {
                jugadores.splice(i, 1);
                actualizarJugadores();
            }
        }


    });

});


function Rectangle(name) {
    this.vida = true;
    this.nombre = name;
    this.orientacion = 0;
    this.x = ~~(Math.floor(Math.random() * 740));
    this.y = ~~(Math.floor(Math.random() * 500));

}
function bala(x, y) {
    this.x = x;
    this.y = y;
    this.activo = false;

}
