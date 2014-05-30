
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
app.get('/img/targetshoot.png', function(req, res) {
    res.sendfile(__dirname + '/img/targetshoot.png');
});
app.get('/img/mage.png', function(req, res) {
    res.sendfile(__dirname + '/img/mage.png');
});
app.get('/img/mage2.png', function(req, res) {
    res.sendfile(__dirname + '/img/mage2.png');
});
app.get('/img/logo3bolas.png', function(req, res) {
    res.sendfile(__dirname + '/img/logo3bolas.png');
});

io.sockets.on('connection', function(socket) {
    //**FUNCION PARA NUEVO USUARIO**///
    socket.on('nuevo usuario', function(data, callback) {
        encontrado = false;
        for (var i = 0; i < jugadores.length; i++) {
            ;
            if (jugadores[i].nombre == data)
                encontrado = true;
        }
        if (encontrado || data == "") {
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
        var destx=false, desty=false;
        for (var i = 0; i < jugadores.length; i++) {
            //console.log('************'+data.nombre);
            if (jugadores[i].nombre === data.nombre) {

                encontrado = true;
                rango = 3;
                if (jugadores[i].x === data.dirx) {
                    destx=true;
                }
                else {
                    if (jugadores[i].x > data.dirx) {
                        jugadores[i].x -= rango;
                    }
                    if (jugadores[i].x < data.dirx) {
                        jugadores[i].x += rango;
                    }
                }
                if (jugadores[i].y === data.diry) {
                    desty=true
                } else {
                    if (jugadores[i].y > data.diry) {
                        jugadores[i].y -= rango;
                    }
                    if (jugadores[i].y < data.diry) {
                        jugadores[i].y += rango;
                    }
                }
            }

        }
        if (!encontrado) {
            callback(false);
        } else {
            if(destx && desty)
            callback(jugadores, true);
            actualizarJugadores();
        }
    });


    function actualizarJugadores() {
        io.sockets.volatile.emit('usuarios', jugadores);
    }

    //**FUNCION PARA DESCONECTAR UN USUARIO**///
    socket.on('desconectarse', function(data) {
        if (!socket.nickname) {
            return;
        }
        jugadores.splice(jugadores.indexOf(socket.nickname), 1);
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
        jugadores.splice(jugadores.indexOf(socket.nickname), 1);
        actualizarJugadores();
    });

});


function Rectangle(name) {

    this.nombre = name;
    this.x = ~~(Math.floor(Math.random() * 800));
    this.y = ~~(Math.floor(Math.random() * 500));
    this.width = 12;
    this.height = 12;
}

Rectangle.prototype.intersects = function(rect) {
    if (rect != null) {
        return(this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
    }
}

Rectangle.prototype.fill = function(ctx) {
    if (ctx != null) {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
