var lienzo = null, canvas = null;
var score = 0;
var lastPress = null;
var gameover = true;
var wall = [];
var body = [];
const ARRIBA = 0, DERECHA = 1, ABAJO = 2, IZQUIERDA = 3;
var dir = DERECHA;
var pause = false;

// Declarar imágenes
var snakeImage = new Image();
var wallImage = new Image();
var foodImage = new Image();

// Asignar las rutas de las imágenes
snakeImage.src = 'ruta/a/la/imagen_de_la_serpiente.png';
wallImage.src = 'ruta/a/la/imagen_de_los_muros.png';
foodImage.src = 'ruta/a/la/comida.png';

// Crear paredes iniciales
wall.push(new Rectangle(100, 50, 10, 10, "#999"));
wall.push(new Rectangle(100, 100, 10, 10, "#999"));
wall.push(new Rectangle(200, 50, 10, 10, "#999"));
wall.push(new Rectangle(200, 100, 10, 10, "#999"));

var food = new Rectangle(80, 80, 10, 10, '#f00');

// Clase Rectangle
function Rectangle(x, y, width, height, color) {
    this.x = (x == null) ? 0 : x;
    this.y = (y == null) ? 0 : y;
    this.width = (width == null) ? 0 : width;
    this.height = (height == null) ? this.width : height;
    this.color = (color == null) ? "#000" : color;
}
Rectangle.prototype.intersects = function (rect) {
    if (rect != null) {
        return (this.x < rect.x + rect.width &&
            this.x + this.width > rect.x &&
            this.y < rect.y + rect.height &&
            this.y + this.height > rect.y);
    }
}
Rectangle.prototype.fill = function (lienzo) {
    if (lienzo != null) {
        lienzo.fillStyle = this.color;
        lienzo.fillRect(this.x, this.y, this.width, this.height);
    }
}

function iniciar() {
    canvas = document.getElementById('lienzo');
    lienzo = canvas.getContext('2d');

    reset();
    run();
    repaint();

    // Mover paredes cada 3 segundos
    setInterval(moveWalls, 3000);
}

function run() {
    setTimeout(run, 50);
    act();
}

function repaint() {
    requestAnimationFrame(repaint);
    paint(lienzo);
}

function act() {
    if (!pause && !gameover) {
        // Cambiar dirección
        if (lastPress == "ArrowUp" && dir != ABAJO) dir = ARRIBA;
        if (lastPress == "ArrowRight" && dir != IZQUIERDA) dir = DERECHA;
        if (lastPress == "ArrowDown" && dir != ARRIBA) dir = ABAJO;
        if (lastPress == "ArrowLeft" && dir != DERECHA) dir = IZQUIERDA;

        // Mover el cuerpo
        for (var i = body.length - 1; i > 0; i--) {
            body[i].x = body[i - 1].x;
            body[i].y = body[i - 1].y;
        }

        // Mover la cabeza
        if (dir == DERECHA) body[0].x += 10;
        if (dir == IZQUIERDA) body[0].x -= 10;
        if (dir == ARRIBA) body[0].y -= 10;
        if (dir == ABAJO) body[0].y += 10;

        // Envolver en los bordes
        if (body[0].x >= canvas.width) body[0].x = 0;
        if (body[0].y >= canvas.height) body[0].y = 0;
        if (body[0].x < 0) body[0].x = canvas.width - 10;
        if (body[0].y < 0) body[0].y = canvas.height - 10;

        // Comer comida
        if (body[0].intersects(food)) {
            score++;
            body.push(new Rectangle(0, 0, 10, 10, "#0f0")); // Agregar nuevo segmento
            repositionFood();
        }

        // Colisión con muros
        for (var i = 0; i < wall.length; i++) {
            if (body[0].intersects(wall[i])) {
                gameover = true;
            }
        }

        // Colisión con el cuerpo
        for (var i = 2; i < body.length; i++) {
            if (body[0].intersects(body[i])) {
                gameover = true;
            }
        }
    }

    // Pausa
    if (lastPress == 'P' || lastPress == 'p') {
        pause = !pause;
        lastPress = null;
    }

    // Reiniciar juego
    if (gameover && lastPress == 'Enter') {
        reset();
    }
}

function reset() {
    body.length = 0;
    body.push(new Rectangle(40, 40, 10, 10, "#0f0"));
    body.push(new Rectangle(30, 40, 10, 10, "#0f0"));
    body.push(new Rectangle(20, 40, 10, 10, "#0f0"));
    score = 0;
    dir = DERECHA;
    repositionFood();
    lastPress = null;
    gameover = false;
}

function repositionFood() {
    food.x = random(canvas.width / 10 - 1) * 10;
    food.y = random(canvas.height / 10 - 1) * 10;

    // Evitar que la comida se superponga con las paredes
    for (var i = 0; i < wall.length; i++) {
        if (food.intersects(wall[i])) {
            repositionFood();
        }
    }
}

function moveWalls() {
    for (var i = 0; i < wall.length; i++) {
        wall[i].x = random(canvas.width / 10 - 1) * 10;
        wall[i].y = random(canvas.height / 10 - 1) * 10;

        // Evitar que las paredes se superpongan con la comida
        if (wall[i].intersects(food)) {
            repositionFood();
        }
    }
}

function random(max) {
    return Math.floor(Math.random() * max);
}

function paint(lienzo) {
    // Fondo
    var gradiente = lienzo.createLinearGradient(0, 0, 0, canvas.height);
    gradiente.addColorStop(0.5, '#0000FF');
    gradiente.addColorStop(1, '#000000');
    lienzo.fillStyle = gradiente;
    lienzo.fillRect(0, 0, canvas.width, canvas.height);

    // Dibuja comida
    food.fill(lienzo);

    // Dibuja paredes
    for (var i = 0; i < wall.length; i++) {
        wall[i].fill(lienzo);
    }

    // Dibuja cuerpo de la serpiente
    for (var i = 0; i < body.length; i++) {
        body[i].fill(lienzo);
    }

    // Texto de puntuación
    lienzo.fillStyle = '#fff';
    lienzo.fillText('Score: ' + score, 10, 20);

    // Mensajes
    if (pause || gameover) {
        lienzo.textAlign = 'center';
        lienzo.fillStyle = '#fff';
        if (gameover) {
            lienzo.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        } else {
            lienzo.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
        }
        lienzo.textAlign = 'left';
    }
}

document.addEventListener('keydown', function (evt) {
    lastPress = evt.key;
}, false);

window.addEventListener("load", iniciar, false);
