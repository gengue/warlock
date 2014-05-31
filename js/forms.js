var socket = io.connect();
	

	jQuery(function($){
		
		var nickFomulario = $('#nick-form');
		var nickError = $('#nickError');
		var nickCaja = $('#nickname');
		var usuarios = $('#usuarios');
		var chatFormulario = $('#chat-form');
		var mensajeCaja = $('#mensaje');
		var chat = $('#chat');

		nickFomulario.submit(function(e1){
			myName = document.getElementById('nickname').value;
			e1.preventDefault();
			socket.emit('nuevo usuario', nickCaja.val(), function(data){
				if(data != false){
					$('#nick').hide();
					$('#contenido').show();
					$('#nickError').html('ok');

					init();			
				}else{
					$('#nickError').html('El nombre de usuario ya esta en uso');
				}
			});
			nickCaja.val('');
		});


		socket.on('usuarios', function(data){
			var html = '<h2>Jugadores</h2>';
			
			for(i=0;i<data.length;i++){
				html += data[i].nombre + '<br/>';
			}
			players = data;
			//alert('actualiza');
			usuarios.html(html);
		});

		chatFormulario.submit(function(e){
			e.preventDefault();
			if(mensajeCaja.val() != ''){
				socket.emit('enviar mensaje', mensajeCaja.val());	
			}else{
				return false;
			}			
			mensajeCaja.val('');
		});


		socket.on('nuevo mensaje', function(data){
		//prepend() para ponerlo al principio
			chat.append('<b>['+data.nick+'] : </b>'+data.msg+'<br/>');
			chat.scrollTop(1000);
		});


	});
