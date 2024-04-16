{
    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    var backgroundColor = 'rgb(0, 153, 255)';

    var textoVisible = true; // Variable para controlar la visibilidad del texto

    class Jugador {
        constructor(x, y, altura, anchura, velocidad, rotacion, velocidadRotacion, vida, muerte, bolasLanzadas) {
            this.x = x;
            this.y = y;
            this.altura = altura;
            this.anchura = anchura;
            this.velocidad = velocidad;
            this.rotacion = rotacion;
            this.velocidadRotacion = velocidadRotacion;
            this.vida = vida;
            this.muerte = muerte;
            this.bolasLanzadas = bolasLanzadas;
        }
    }

    class Ball {
        constructor(x, y, ancho, largo, velocidad, direccion, frameInicial) {
            this.x = x;
            this.y = y;
            this.ancho = ancho;
            this.largo = largo;
            this.velocidad = velocidad;
            this.direccion = direccion;
            this.frameInicial = frameInicial;
        }
    }


    let barco = new Jugador(canvas.width / 4, canvas.height / 2, 154, 82, 3, 0, 0.1, 1, 0, 0);
    let tiburon = new Jugador((3 * canvas.width) / 4, canvas.height / 2, 102, 58, 3, 0, 0.1, 3, 0, null);
    let balls = [];
    let gameover = -1;

    const sharkFrames = [];
    let sharkFrameIndex = 0;
    let sharkFrameChangeInterval;

    const boatFrames = [];
    let boatFrameIndex = 0;
    let boatFrameChangeInterval;

    const ballFrames = [];
    let ballFrameIndex = 0;
    let ballFrameChangeInterval;

    document.getElementById('playerForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Evitar el envío del formulario por defecto

        var button = document.getElementById('playButton');
        var inputs = document.getElementsByTagName('input');
        var selects = document.getElementsByTagName('select');

        if (button.textContent === 'PLAY') {
            button.textContent = 'Nueva Partida';
            gameover = 0; // Cambiar el valor del botón a -1
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true; // Deshabilitar los inputs
            }
            for (var i = 0; i < selects.length; i++) {
                selects[i].disabled = true; // Deshabilitar los selects
            }
        } else {
            // Si el botón ya está en "Nueva Partida"
            button.textContent = 'PLAY';
            gameover = -1; // Cambiar el valor del botón a 0
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = false; // Habilitar los inputs
            }
            for (var i = 0; i < selects.length; i++) {
                selects[i].disabled = false; // Habilitar los selects
            }
        }


        // Obtener valores del formulario
        const player1Lives = parseInt(document.getElementById('player1Lives').value);
        const player1Speed = document.getElementById('player1Speed').value;
        const player1Name = document.getElementById('player1Name').value;

        const player2Lives = parseInt(document.getElementById('player2Lives').value);
        const player2Speed = document.getElementById('player2Speed').value;
        const player2Name = document.getElementById('player2Name').value;

        // Actualizar valores de los jugadores
        barco.vida = player1Lives;
        barco.muerte = player1Lives;
        barco.velocidad = (player1Speed === 'Lenta') ? 1 : (player1Speed === 'Media') ? 2 : 3;
        barco.nombre = player1Name;

        tiburon.vida = player2Lives;
        tiburon.muerte = player2Lives;
        tiburon.velocidad = (player2Speed === 'Lenta') ? 1 : (player2Speed === 'Media') ? 2 : 3;
        tiburon.nombre = player2Name;



        reiniciarPosiciones();
    });

    let parpadeoInicio;

    function init() {
        // Cargar imágenes
        cargarImagenes();

        // Event listeners
        window.addEventListener('keydown', keyDownHandler);
        window.addEventListener('keyup', keyUpHandler);

        // Iniciar animaciones
        iniciarAnimaciones();
    }

    function cargarImagenes() {
        // Cargar imágenes del tiburón
        for (let i = 1; i <= 4; i++) {
            const img = new Image();
            img.src = `./js/robot_al_agua/ani/shark${i}.png`;
            sharkFrames.push(img);
        }

        // Cargar imágenes del barco
        for (let i = 1; i <= 4; i++) {
            const img = new Image();
            img.src = `./js/robot_al_agua/ani/boat${i}.png`;
            boatFrames.push(img);
        }

        // Cargar imágenes del misil (ball)
        for (let i = 1; i <= 12; i++) {
            const img = new Image();
            img.src = `./js/robot_al_agua/ani/shot${i}.png`;
            ballFrames.push(img);
        }
    }

    function keyDownHandler(event) {
        // Manejar eventos de teclado
        keysPressed[event.key] = true;
        // Evitar la propagación del evento si la tecla presionada es el espacio
        if (event.key === ' ') {
            event.preventDefault();
        }
        parpadeoInicio = false;
    }

    function keyUpHandler(event) {
        // Manejar eventos de teclado
        delete keysPressed[event.key];
    }

    function iniciarAnimaciones() {
        // Iniciar la animación del tiburón cambiando entre frames
        sharkFrameChangeInterval = setInterval(function () {
            sharkFrameIndex = (sharkFrameIndex + 1) % sharkFrames.length;
        }, 200);

        // Iniciar la animación del barco cambiando entre frames
        boatFrameChangeInterval = setInterval(function () {
            boatFrameIndex = (boatFrameIndex + 1) % boatFrames.length;
        }, 200);

        // Iniciar la animación del misil cambiando entre frames
        ballFrameChangeInterval = setInterval(function () {
            for (let i = 0; i < balls.length; i++) {
                const ball = balls[i];
                if (ball.frameInicial < ballFrames.length - 1) {
                    ball.frameInicial += 1;
                } else {
                    ball.frameInicial = ballFrames.length - 1;
                }
            }
        }, 50);
    }

    // Define una función para reiniciar las posiciones de los jugadores
    function reiniciarPosiciones() {
        parpadeoInicio = true;
        // Reiniciar posición del barco
        barco.x = canvas.width / 4;
        barco.y = canvas.height / 2;
        barco.rotacion = 0;

        // Reiniciar posición del tiburón
        tiburon.x = (3 * canvas.width) / 4;
        tiburon.y = canvas.height / 2;
        tiburon.rotacion = 0;

        reiniciarBolas();
    }

    function reiniciarBolas() {
        // Reiniciar la lista de bolas lanzadas
        balls = [];
        // Reiniciar el contador de bolas lanzadas de los jugadores a cero
        barco.bolasLanzadas = 0;
        tiburon.bolasLanzadas = 0;
    }

    const heartImg = new Image();
    heartImg.src = './js/robot_al_agua/ani/heart.png';

    const deathImg = new Image();
    deathImg.src = './js/robot_al_agua/ani/death.png';

    function draw() {
        limpiarCanvas();
        dibujarFondo();

        if (gameover === -1) {
            ctx.fillStyle = "white";
            ctx.font = "80px PixelFont";
            const textoReady = "READY?";

            const anchoTextoReady = ctx.measureText(textoReady).width;
            const xTextoReady = (canvas.width - anchoTextoReady) / 2;
            ctx.fillText(textoReady, xTextoReady, canvas.height / 2 - 20);

            if (parpadeo) {
                ctx.fillStyle = "red";
                ctx.font = "20px PixelFont";

                const textoIni = "Configura los valores y dale al 'PLAY'";
                const anchoTextoIni = ctx.measureText(textoIni).width;
                const xTextoIni = (canvas.width - anchoTextoIni) / 2;

                ctx.fillText(textoIni, xTextoIni, canvas.height / 2 + 50);
            }

            // Cambio de estado de parpadeo cada 500 ms
            if (Date.now() - lastFlashTime > 500) {
                parpadeo = !parpadeo;
                lastFlashTime = Date.now();
            }
        } else if (gameover === 0) {

            if (parpadeoInicio) {
                if (parpadeo) {
                    dibujarJugador(tiburon, sharkFrames[sharkFrameIndex]);
                    dibujarJugador(barco, boatFrames[boatFrameIndex]);

                }

                // Cambio de estado de parpadeo cada 500 ms
                if (Date.now() - lastFlashTime > 500) {
                    parpadeo = !parpadeo;
                    lastFlashTime = Date.now();
                }

            } else {
                update();
                dibujarJugador(tiburon, sharkFrames[sharkFrameIndex]);
                dibujarJugador(barco, boatFrames[boatFrameIndex]);
                dibujarBolas();
            }

            // Dibujar nombres de jugadores en las esquinas inferiores del canvas
            ctx.font = "20px PixelFont";
            ctx.fillStyle = "red";
            const textoJ1 = "J1: ";
            const textoJ2 = "J2: ";
            ctx.fillText(textoJ1, 10, canvas.height - 35);
            ctx.fillText(textoJ2, canvas.width - ctx.measureText(tiburon.nombre).width - 35, canvas.height - 35);

            ctx.fillStyle = "white";
            ctx.fillText(barco.nombre, 10 + ctx.measureText(textoJ1).width, canvas.height - 35);
            ctx.fillText(tiburon.nombre, canvas.width - ctx.measureText(tiburon.nombre).width - 10, canvas.height - 35);

            // Dibujar corazones debajo de los nombres
            dibujarMuertes(barco, 10, canvas.height - 30, 1);
            dibujarCorazones(barco, 10, canvas.height - 30, 1);
            dibujarMuertes(tiburon, canvas.width - 30, canvas.height - 30, -1);
            dibujarCorazones(tiburon, canvas.width - 30, canvas.height - 30, -1);
        }

        if (gameover > 0) {
            // Dibujar Game Over y ganador
            dibujarTextoGameOver();
        }

        requestAnimationFrame(draw);
    }

    let parpadeo = true; // Iniciar con el texto visible
    let lastFlashTime = 0; // Mantener un seguimiento del tiempo del último parpadeo

    function dibujarCorazones(jugador, x, y, num) {
        for (let i = 0; i < jugador.vida; i++) {
            ctx.drawImage(heartImg, x + num * i * (heartImg.width + 10), y);
        }
    }

    function dibujarMuertes(jugador, x, y, num) {
        for (let i = 0; i < jugador.muerte; i++) {
            ctx.drawImage(deathImg, x + num * i * (deathImg.width + 10), y);
        }
    }

    function limpiarCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function dibujarFondo() {
        if (gameover === -1) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = backgroundColor;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function update() {
        if (keysPressed['ArrowUp']) {
            barco.x += Math.cos(barco.rotacion) * barco.velocidad;
            barco.y += Math.sin(barco.rotacion) * barco.velocidad;
            comprobarLimitesJugador(barco);
        }
        if (keysPressed['ArrowLeft']) {
            // Reducir la velocidad de rotación si la velocidad del jugador es menor
            barco.rotacion -= barco.velocidadRotacion * (barco.velocidad / 3);
        }
        if (keysPressed['ArrowRight']) {
            // Reducir la velocidad de rotación si la velocidad del jugador es menor
            barco.rotacion += barco.velocidadRotacion * (barco.velocidad / 3);
        }

        if (keysPressed['w']) {
            tiburon.x -= Math.cos(tiburon.rotacion) * tiburon.velocidad;
            tiburon.y -= Math.sin(tiburon.rotacion) * tiburon.velocidad;
            comprobarLimitesJugador(tiburon);
        }
        if (keysPressed['a']) {
            // Reducir la velocidad de rotación si la velocidad del jugador es menor
            tiburon.rotacion -= tiburon.velocidadRotacion * (tiburon.velocidad / 3);
        }
        if (keysPressed['d']) {
            // Reducir la velocidad de rotación si la velocidad del jugador es menor
            tiburon.rotacion += tiburon.velocidadRotacion * (tiburon.velocidad / 3);
        }

        if (keysPressed[' '] && barco.bolasLanzadas < 3) {
            keysPressed[' '] = false;
            // Calcular las coordenadas de la punta del barco
            const puntaX = barco.x + (barco.altura / 2) * Math.cos(barco.rotacion);
            const puntaY = barco.y + (barco.altura / 2) * Math.sin(barco.rotacion);

            // Almacenar la rotación actual del barco
            const ballRotation = barco.rotacion;
            balls.push(new Ball(puntaX, puntaY, 36, 40, 2, ballRotation, 0));
            barco.bolasLanzadas++;
            ballFrameIndex = 0;
        }

        balls.forEach(ball => {
            // Actualizamos posiciones de las bolas
            ball.x += Math.cos(ball.direccion) * ball.velocidad;
            ball.y += Math.sin(ball.direccion) * ball.velocidad;

            // Comprobamos colision de cada bola con el tiburón
            if (ball.x < tiburon.x + tiburon.anchura &&
                ball.x + ball.ancho > tiburon.x &&
                ball.y < tiburon.y + tiburon.altura &&
                ball.y + ball.largo > tiburon.y) {
                ball.x = -1;
                ball.y = -1;
                tiburon.vida--;
                reiniciarPosiciones();
            }
        });

        // Eliminar bolas que salgan de las coordenadas del canvas y restar 1 al contador de bolas
        balls = balls.filter(ball => {
            if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) {
                barco.bolasLanzadas--; // Restar 1 al contador de bolas
                return false; // Eliminar la bola
            }
            return true; // Conservar la bola
        });

        // Comprobamos colisiones del tiburon al barco
        if (barco.x < tiburon.x + tiburon.anchura &&
            barco.x + barco.anchura > tiburon.x &&
            barco.y < tiburon.y + tiburon.altura &&
            barco.y + barco.altura > tiburon.y) {
            barco.vida--;
            reiniciarPosiciones();
        }

        // Comprobamos si hay alguno sin vida
        if (barco.vida <= 0) // Ganador tiburon
        { gameover = 1; } else if (tiburon.vida <= 0) // Ganador barco
        { gameover = 2; } else if (barco.vida <= 0 && tiburon.vida <= 0) // Empate
        { gameover = 3; }
    }

    function dibujarTextoGameOver() {

        ctx.fillStyle = "black";
        ctx.font = "80px PixelFont";
        const textoGameOver = "Game Over";
        let textoGanador = "";
        switch (gameover) {
            case 1:
                textoGanador = tiburon.nombre + " HA GANADO!!!";
                break;
            case 2:
                textoGanador = barco.nombre + " HA GANADO!!!";
                break;
            case 3:
                textoGanador = "EMPATE";
                break;
        }
        const anchoTextoGameOver = ctx.measureText(textoGameOver).width;
        const anchoTextoGanador = ctx.measureText(textoGanador).width;
        const xGameOver = (canvas.width - anchoTextoGameOver) / 2;
        const xGanador = (canvas.width - anchoTextoGanador) / 2;
        ctx.fillText(textoGameOver, xGameOver, canvas.height / 2 - 40);


        if (parpadeo) {
            ctx.fillStyle = "red";
            ctx.fillText(textoGanador, xGanador, canvas.height / 2 + 50);

            ctx.fillStyle = "white";
            ctx.font = "20px PixelFont";
            const textoFin = "Revancha? Dale a 'NUEVA PARTIDA'";
            const anchotextoFin = ctx.measureText(textoFin).width;
            const xtextoFin = (canvas.width - anchotextoFin) / 2;


            ctx.fillText(textoFin, xtextoFin, canvas.height / 2 + 80);
        }

        // Cambio de estado de parpadeo cada 500 ms
        if (Date.now() - lastFlashTime > 500) {
            parpadeo = !parpadeo;
            lastFlashTime = Date.now();
        }
    }

    function distancia(x1, y1, x2, y2) {
        // Calcular la distancia entre dos puntos utilizando el teorema de Pitagoras
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    function comprobarLimitesJugador(jugador) {
        if (jugador.x < jugador.altura / 2) jugador.x = jugador.altura / 2;
        if (jugador.x > canvas.width - jugador.altura / 2) jugador.x = canvas.width - jugador.altura / 2;
        if (jugador.y < jugador.altura / 2) jugador.y = jugador.altura / 2;
        if (jugador.y > canvas.height - jugador.altura / 2) jugador.y = canvas.height - jugador.altura / 2;
    }

    function dibujarJugador(jugador, frame) {
        ctx.save();
        ctx.translate(jugador.x, jugador.y);
        ctx.rotate(jugador.rotacion);
        if (jugador === barco) {
            // Dibujar el frame actual del barco
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(frame, -jugador.anchura / 2, -jugador.altura / 2, jugador.anchura, jugador.altura);
        } else {
            // Dibujar8 el frame actual del tiburón
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(frame, -jugador.anchura / 2, -jugador.altura / 2, jugador.anchura, jugador.altura);
        }
        ctx.restore();
    }

    function dibujarBolas() {
        ctx.fillStyle = 'black';
        for (let i = 0; i < balls.length; i++) {
            const ball = balls[i];
            ctx.save(); // Guardar el estado actual del contexto
            ctx.translate(ball.x, ball.y); // Trasladar el origen al centro de la bola
            ctx.rotate(Math.PI / 2); // Rotar 90 grados a la derecha
            ctx.rotate(ball.direccion);
            ctx.drawImage(ballFrames[ball.frameInicial], -ball.ancho / 2, -ball.largo / 2, ball.ancho, ball.largo); // Dibujar la bola con ancho y largo
            ctx.restore(); // Restaurar el estado del contexto
        }
    }


    const keysPressed = {};

    init();
    draw();
}