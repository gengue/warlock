
var express = require('express'),
        app = express(),
        server = require('http').createServer(app),
        io = require('socket.io').listen(server),
        jugadores = [];

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
            actualizarJugadores();
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
    
    this.x = ~~(Math.floor(Math.random() * (520 - 200 + 1)) + 100);
    this.y = ~~(Math.floor(Math.random() * (370 - 180 + 1)) + 180);    

}
